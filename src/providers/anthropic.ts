import Anthropic from "@anthropic-ai/sdk";
import type { ContentBlock } from "@anthropic-ai/sdk/resources/messages.mjs";
import { getModel } from "../models";
import type {
  Price,
  PromptApiOptions,
  PromptResponse,
  Usage,
} from "../interfaces";
import { calculatePrice } from "../price";

// uses global fetch() by default
export const anthropicPrompt = async (
  body: Partial<Anthropic.Messages.MessageCreateParamsNonStreaming>,
  apiOptions: PromptApiOptions = {},
): Promise<PromptResponse> => {
  apiOptions = {
    ...apiOptions,
    apiKey: apiOptions.apiKey,
  };

  const anthropic = new Anthropic({
    apiKey: apiOptions.apiKey,
  });

  if (!body.model) {
    body.model = "anthropic-claude-3-5-sonnet-20240620";
  }

  if (!body.max_tokens) {
    body.max_tokens = 4096;
  }

  if (!body.temperature) {
    body.temperature = 0.7;
  }

  const start = Date.now();
  /**
    system: "my prompt",
    messages: [{ role: "user", content: "Hello, world" }],
   */
  const completion = await anthropic.messages.create(
    body as Anthropic.Messages.MessageCreateParamsNonStreaming,
  );
  const end = Date.now();
  const elapsedMs = end - start;
  const usage: Usage = {
    outputTokens: completion.usage.output_tokens,
    inputTokens: completion.usage.input_tokens!,
    totalTokens: completion.usage.input_tokens + completion.usage.output_tokens,
  };

  return {
    // @ts-ignore
    message: completion.content.map((c) => c.text).join(""),
    usage,
    finishReason: completion.stop_reason,
    elapsedMs,
    price: calculatePrice(getModel("anthropic", body.model), usage),
  };
};

export const anthropicPromptStreaming = async (
  body: Partial<Anthropic.Messages.MessageCreateParamsStreaming>,
  onChunk: (text: string, elapsed: number) => void,
  onStop: (
    text: string,
    elapsed: number,
    usage: Usage,
    reason: string,
    price: Price,
  ) => void,
  onError: (error: unknown, elapsed: number) => void,
  apiOptions: PromptApiOptions = {},
) => {
  const start = Date.now();
  apiOptions = {
    ...apiOptions,
    apiKey: apiOptions.apiKey,
  };

  if (!body.model) {
    body.model = "anthropic-claude-3-5-sonnet-20240620";
  }

  if (!body.max_tokens) {
    body.max_tokens = 4096;
  }

  if (!body.temperature) {
    body.temperature = 0.7;
  }

  try {
    const anthropic = new Anthropic({
      apiKey: apiOptions.apiKey,
    });

    const stream = anthropic.messages.stream(
      body as Anthropic.Messages.MessageCreateParamsStreaming,
    );

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta &&
        event.delta.type === "text_delta"
      ) {
        onChunk(event.delta.text, Date.now() - start);
      }
    }

    const message = await stream.finalMessage();
    const usage: Usage = {
      outputTokens: message.usage.output_tokens,
      inputTokens: message.usage.input_tokens,
      totalTokens: message.usage.input_tokens + message.usage.output_tokens,
    };

    onStop(
      message.content
        // @ts-ignore
        .map((c: ContentBlock) => c.text)
        .join(""),
      Date.now() - start,
      usage,
      message.stop_reason || "end_turn",
      calculatePrice(getModel("anthropic", body.model!), usage),
    );
  } catch (error) {
    onError(error, Date.now() - start);
  }
};

export type AnthropicPromptOptionsUnion = Partial<
  | Anthropic.Messages.MessageCreateParamsStreaming
  | Anthropic.Messages.MessageCreateParamsNonStreaming
>;

export const mapAnthropicPromptOptions = <T>(
  promptOptions: AnthropicPromptOptionsUnion,
): T =>
  ({
    max_tokens: promptOptions.max_tokens,
    model: promptOptions.model,
    temperature: promptOptions.temperature,
  }) as T;

export const autoTuneAnthropicHyperparameters = <T>(
  promptOptions: AnthropicPromptOptionsUnion,
  options: PromptApiOptions = {},
): T => {
  if (typeof promptOptions.temperature === "undefined") {
    const creativitySet = typeof options.autoTuneCreativity === "number";
    const variabilitySet = typeof options.autoTuneWordVariety === "number";
    const focusSet = typeof options.autoTuneFocus === "number";

    if (creativitySet && variabilitySet) {
      // direct mapping, as scale is the same [0.0, 1.0]
      promptOptions.temperature =
        (options.autoTuneCreativity! + options.autoTuneWordVariety!) / 2;
    } else if (creativitySet) {
      // direct mapping, as scale is the same [0.0, 1.0]
      promptOptions.temperature = options.autoTuneCreativity!;
    } else if (variabilitySet) {
      // direct mapping, as scale is the same [0.0, 1.0]
      promptOptions.temperature = options.autoTuneWordVariety!;
    }

    if (focusSet) {
      // reduce temperature by focus, as focus is the opposite of creativity, but never below 0
      promptOptions.temperature = Math.max(
        0,
        (promptOptions.temperature || 0) - options.autoTuneFocus!,
      );

      // applying nucleus sampling, so that the cumulative probability mass is limited (and thus, the output is likely to be more focussed)
      promptOptions.top_p = 1 - Math.max(0, options.autoTuneFocus! / 2);
    }
  }
  return promptOptions as T;
};
