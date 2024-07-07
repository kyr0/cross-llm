// https://github.com/dexaai/openai-fetch
import {
  OpenAIClient,
  type ChatParams,
  type ChatStreamResponse,
  type EmbeddingParams as OpenAIEmbeddingParams,
} from "openai-fetch";
import { getModel } from "../models";
import type {
  EmbeddingApiOptions,
  EmbeddingParams,
  EmbeddingResponse,
  Price,
  PromptApiOptions,
  PromptResponse,
  Usage,
} from "../interfaces";
import { calculatePrice } from "../price";

export const openAIPrompt = async (
  body: ChatParams,
  apiOptions: PromptApiOptions = {},
): Promise<PromptResponse> => {
  apiOptions = {
    ...apiOptions,
    apiKey: apiOptions.apiKey,
  };

  // default for OpenAI (GPT-4 Turbo, best reasoning)
  if (!body.model) {
    body.model = "gpt-4-turbo";
  }

  const openai = new OpenAIClient(apiOptions);
  const start = Date.now();
  const completion = await openai.createChatCompletion(body);
  const end = Date.now();
  const elapsedMs = end - start;
  const topPChoice = completion.choices[0];
  const usage: Usage = {
    outputTokens: completion.usage!.completion_tokens,
    inputTokens: completion.usage!.prompt_tokens,
    totalTokens: completion.usage!.total_tokens,
  };
  return {
    message: topPChoice.message.content,
    usage,
    finishReason: topPChoice.finish_reason,
    elapsedMs,
    price: calculatePrice(
      getModel(apiOptions.overrideProvider || "openai", body.model),
      usage,
    ),
    raw: completion,
    rawBody: body,
  };
};

export const openAIPromptStreaming = async (
  body: ChatParams,
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
): Promise<ChatStreamResponse | undefined> => {
  const start = Date.now();
  try {
    apiOptions = {
      ...apiOptions,
      apiKey: apiOptions.apiKey,
    };

    if (!body.model) {
      body.model = "gpt-4-turbo";
    }
    const openai = new OpenAIClient(apiOptions);

    const readStreamChunks = async (stream: ReadableStream) => {
      try {
        const reader = stream.getReader();
        let accumulated = "";
        let finishReason = "";
        let usage: Usage;
        let price: Price;
        const readChunk = async () => {
          try {
            const { done, value } = await reader.read();
            const data = value?.choices ? value.choices[0] : undefined;

            if (data?.finish_reason) {
              finishReason = data.finish_reason;
            }

            if (value?.usage) {
              usage = {
                outputTokens: value.usage!.completion_tokens,
                inputTokens: value.usage!.prompt_tokens,
                totalTokens: value.usage!.total_tokens,
              } as Usage;

              price = calculatePrice(
                getModel(apiOptions.overrideProvider || "openai", body.model),
                usage,
              );
            }

            if (done) {
              if (finishReason === "stop") {
                // TODO: max_tokens and "continue" not yet supported
                onStop(
                  accumulated,
                  Date.now() - start,
                  usage,
                  finishReason,
                  price,
                );
              } else {
                onError(
                  new Error("Stream ended without completion."),
                  Date.now() - start,
                );
              }
              return;
            }
            if (typeof data?.delta?.content !== "undefined") {
              accumulated += data.delta.content;
              onChunk(data.delta.content, Date.now() - start);
            }
            readChunk();
          } catch (error) {
            onError(error, Date.now() - start);
          }
        };
        readChunk();
      } catch (error) {
        onError(error, Date.now() - start);
      }
    };

    const readableStream: ChatStreamResponse =
      await openai.streamChatCompletion({
        ...body,
        stream_options: {
          include_usage: true,
        },
      });

    readStreamChunks(readableStream);

    return readableStream;
  } catch (error) {
    onError(error, Date.now() - start);
  }
};

export type OpenAIPromptOptionsUnion = Partial<ChatParams>;

export const mapOpenAIPromptOptions = <T>(
  promptOptions: OpenAIPromptOptionsUnion,
): T =>
  ({
    ...promptOptions,
    n: promptOptions.n || 1,
  }) as T;

export const autoTuneOpenAIHyperparameters = <T>(
  promptOptions: OpenAIPromptOptionsUnion,
  options: PromptApiOptions = {},
): T => {
  if (
    typeof promptOptions.temperature === "undefined" &&
    typeof options.autoTuneCreativity === "number"
  ) {
    // technical temperature scale is [0.0, 2.0], but human-acceptable results are [0.0, 1.0]
    // as long as we don't add other sampling methods such as nucleus sampling (top_p)
    promptOptions.temperature = options.autoTuneCreativity;

    if (typeof options.autoTuneFocus === "number") {
      // the higher the focus, the lower the temperature
      promptOptions.temperature = Math.max(
        0,
        (promptOptions.temperature || 0) - options.autoTuneFocus,
      );
    }

    if (
      typeof promptOptions.seed === "undefined" &&
      promptOptions.temperature < 0.05 // temperature approaches 0
    ) {
      // bias towards an even more deterministic result
      promptOptions.seed = 1337;
    }
  }

  if (
    typeof promptOptions.frequency_penalty !== "number" &&
    typeof options.autoTuneWordVariety === "number"
  ) {
    // scale frequency_penalty from variability scale [0.0, 1.0] to [-2.0, 2.0]
    promptOptions.frequency_penalty = options.autoTuneWordVariety * 4.0 - 2.0;
  }

  if (
    typeof promptOptions.presence_penalty !== "number" &&
    typeof options.autoTuneFocus === "number"
  ) {
    // scale presence_penalty from focus scale [0.0, 1.0] to [-2.0, 2.0], inverted
    promptOptions.presence_penalty = 2.0 - options.autoTuneFocus * 4.0;

    // applying nucleus sampling, so that the cumulative probability mass is limited (and thus, the output is likely to be more focussed)
    promptOptions.top_p = 1 - Math.max(0, options.autoTuneFocus / 2);
  }
  return promptOptions as T;
};

export const openAIEmbed = async (
  text: string | Array<string> | Array<number> | Array<Array<number>>,
  params: EmbeddingParams,
  apiOptions: EmbeddingApiOptions = {},
): Promise<EmbeddingResponse> => {
  apiOptions = {
    ...apiOptions,
    apiKey: apiOptions.apiKey,
  };

  if (!params.model) {
    params.model = "text-embedding-3-small"; // MTEB 62.3%; 6.5x cheaper than "large", only 2.3% less accurate
  }

  const openai = new OpenAIClient(apiOptions);
  const start = Date.now();
  const embeddings = await openai.createEmbeddings({
    ...params,
    input: text,
  } as OpenAIEmbeddingParams);
  const end = Date.now();
  const elapsedMs = end - start;
  const usage: Usage = {
    inputTokens: embeddings.usage.prompt_tokens,
    totalTokens: embeddings.usage!.total_tokens,
    outputTokens: 0,
  };

  return {
    usage,
    elapsedMs,
    price: calculatePrice(
      getModel(apiOptions.overrideProvider || "openai", params.model),
      usage,
    ),
    data: embeddings.data,
  };
};
