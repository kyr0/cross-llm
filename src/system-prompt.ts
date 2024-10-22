import type Anthropic from "@anthropic-ai/sdk";
import {
  autoTuneOpenAIHyperparameters,
  mapOpenAIPromptOptions,
  openAIPrompt,
  openAIPromptStreaming,
} from "./providers/openai";
import { coherePrompt } from "./providers/cohere";
import {
  anthropicPrompt,
  anthropicPromptStreaming,
  autoTuneAnthropicHyperparameters,
  mapAnthropicPromptOptions,
  type AnthropicPromptOptionsUnion,
} from "./providers/anthropic";
import { huggingFacePrompt } from "./providers/huggingface";
import { ollamaPrompt, type OllamaBody } from "./providers/ollama";
import type { ChatParams } from "openai-fetch";
import {
  perplexityPrompt,
  perplexityPromptStreaming,
} from "./providers/perplexity";
import type { GenerateRequest } from "cohere-ai/api";
import type {
  LLMProvider,
  Price,
  PromptApiOptions,
  PromptOptionsUnion,
  PromptResponse,
  Usage,
} from "./interfaces";

// non-streaming, single, system-prompt completion with any LLM
export const systemPrompt = async (
  promptText: string,
  providerType: LLMProvider,
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
              content: promptText,
            },
            {
              role: "user",
              content: promptText,
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
  providerType: LLMProvider,
  onChunk: (text: string, elapsedMs: number) => void,
  onStop: (
    text: string,
    elapsedMs: number,
    usage: Usage,
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

    case "perplexity": {
      await perplexityPromptStreaming(
        {
          ...(promptOptions as ChatParams),
          messages: [
            {
              role: "system",
              content: promptText,
            },
            {
              role: "user",
              content: promptText,
            },
          ],
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
