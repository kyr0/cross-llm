import type Anthropic from "@anthropic-ai/sdk";
import {
  autoTuneOpenAIHyperparameters,
  mapOpenAIPromptOptions,
  openAIPrompt,
  openAIPromptStreaming,
} from "./openai";
import { coherePrompt } from "./cohere";
import {
  anthropicPrompt,
  anthropicPromptStreaming,
  autoTuneAnthropicHyperparameters,
  mapAnthropicPromptOptions,
  type AnthropicPromptOptionsUnion,
} from "./anthropic";
import { type HuggingFaceBody, huggingFacePrompt } from "./huggingface";
import { ollamaPrompt, type OllamaBody } from "./ollama";
import type { GeminiOptions } from "./gemini";
import type { ChatParams } from "openai-fetch";
import { perplexityPrompt } from "./perplexity";
import type { GenerateRequest } from "cohere-ai/api";
import type { Model, ModelProviderType } from "./models";

export interface PromptTokenUsage {
  completionTokens?: number;
  promptTokens?: number;
  totalTokens?: number;
}

export type PromptFinishReason =
  | string
  | null
  | "function_call"
  | "stop"
  | "length"
  | "tool_calls"
  | "content_filter"
  // Anthropic
  | "end_turn";

export interface PromptResponse {
  message?: string | null;
  usage?: PromptTokenUsage;
  finishReason: PromptFinishReason;
  elapsedMs: number;
  price?: Price;
}

export interface PromptApiOptions {
  baseURL?: string;
  hostingLocation?: string;
  apiKey?: string;

  /** linear scale [0..1], whereas 0 is close to determinism */
  autoTuneCreativity?: number;

  /** how much variety of terms is desired? [0..1], whereas 0 means: use the same terms over and over */
  autoTuneWordVariety?: number;

  /** how much should the model stay focused and on topic? [0..1], whereas 1 means: alot of focus, less topics */
  autoTuneFocus?: number;
}

export type PromptOptionsUnion =
  | Partial<GenerateRequest>
  | Partial<Anthropic.Messages.MessageCreateParamsNonStreaming>
  | Partial<Anthropic.Messages.MessageCreateParamsStreaming>
  | Partial<ChatParams>
  | Partial<HuggingFaceBody>
  | Partial<OllamaBody>
  | Partial<GeminiOptions>;

// non-streaming, single, system-prompt completion with any LLM
export const systemPrompt = async (
  promptText: string,
  providerType: ModelProviderType,
  promptOptions: PromptOptionsUnion = {},
  apiOptions: PromptApiOptions = {},
): Promise<PromptResponse> => {
  switch (providerType) {
    case "cohere": {
      return coherePrompt(
        {
          ...(promptOptions as GenerateRequest),
          prompt: promptText,
        },
        apiOptions,
      );
    }
    case "anthropic": {
      return anthropicPrompt(
        {
          ...autoTuneAnthropicHyperparameters(
            mapAnthropicPromptOptions<Anthropic.Messages.MessageCreateParamsNonStreaming>(
              promptOptions as AnthropicPromptOptionsUnion,
            ),
            apiOptions,
          ),
          messages: [{ role: "user", content: promptText }],
          system: promptText,
        },
        apiOptions,
      );
    }
    case "huggingface": {
      return huggingFacePrompt(
        {
          ...(promptOptions as ChatParams),
          messages: [
            {
              role: "system",
              content: promptText,
            },
          ],
        },
        apiOptions,
      );
    }
    case "ollama": {
      return ollamaPrompt(
        {
          ...(promptOptions as OllamaBody),
          messages: [
            {
              role: "system",
              content: promptText,
            },
          ],
        },
        apiOptions,
      );
    }
    /* TODO: because auth with Google is a complexity disaster; requires filesystem access 
    // so it breaks for service-workers; need to find a way to create a token from an 
    // environment-serialized key file
    case "gemini": {
      return geminiPrompt(
        {
          ...(promptOptions as GeminiOptions),
          contents: [
            {
              role: "user",
              parts: [{ text: promptText }],
            },
          ],
        },
        apiOptions,
      );
    }
    */
    case "perplexity": {
      return perplexityPrompt(
        {
          ...(promptOptions as ChatParams),
          messages: [
            {
              role: "system",
              content:
                "You are artificial intelligence assistant for fact-checking. You must base any verdict on evidence and the scientific method of reasoning, hence reason deductively. You need to respond in JSON format only. Example: { sources: [''], claim: 'Earth is flat.', verdict: false, explanation: '' }",
            },
            {
              role: "user",
              content: `Claim: ${promptText}`,
            },
          ],
        },
        apiOptions,
      );
    }
    // openai
    default: {
      return openAIPrompt(
        {
          ...autoTuneOpenAIHyperparameters(
            mapOpenAIPromptOptions(promptOptions as ChatParams),
            apiOptions,
          ),
          messages: [
            {
              role: "system",
              content: promptText,
            },
          ],
        },
        apiOptions,
      );
    }
  }
};

export const systemPromptStreaming = async (
  promptText: string,
  providerType: ModelProviderType,
  onChunk: (text: string, elapsedMs: number) => void,
  onStop: (
    text: string,
    elapsedMs: number,
    usage: PromptTokenUsage,
    finishReason: string,
    price: Price,
  ) => void,
  onError: (error: unknown, elapsedMs: number) => void,
  promptOptions: PromptOptionsUnion = {},
  apiOptions: PromptApiOptions = {},
) => {
  switch (providerType) {
    // TODO: implement streaming for all providers

    case "anthropic": {
      console.log("calling anthropic streaming");
      await anthropicPromptStreaming(
        {
          ...autoTuneAnthropicHyperparameters(
            mapAnthropicPromptOptions<Anthropic.Messages.MessageCreateParamsStreaming>(
              promptOptions as AnthropicPromptOptionsUnion,
            ),
            apiOptions,
          ),
          messages: [{ role: "user", content: promptText }],
          system: promptText,
        },
        onChunk,
        onStop,
        onError,
        apiOptions,
      );
      break;
    }

    // OpenAI
    default: {
      await openAIPromptStreaming(
        {
          ...autoTuneOpenAIHyperparameters(
            mapOpenAIPromptOptions(promptOptions as ChatParams),
            apiOptions,
          ),
          messages: [
            {
              role: "system",
              content: promptText,
            },
          ],
        },
        onChunk,
        onStop,
        onError,
        apiOptions,
      );
    }
  }
};

export interface Price {
  input: number;
  output: number;
  total: number;
}

export const calculatePrice = (
  model: Model,
  inputTokens: number,
  outputTokens: number,
): Price => {
  const input = model.input * inputTokens;
  const output = model.output * outputTokens;
  return {
    input,
    output,
    total: input + output,
  };
};
