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
import type { MessageParam } from "@anthropic-ai/sdk/resources/index.mjs";

// non-streaming, single, system-prompt completion with any LLM
export const prompt = async (
  messages: ChatParams["messages"],
  providerType: LLMProvider,
  promptOptions: PromptOptionsUnion = {},
  apiOptions: PromptApiOptions = {},
): Promise<PromptResponse> => {
  switch (providerType) {
    case "cohere": {
      return coherePrompt(
        {
          ...(promptOptions as GenerateRequest),
          prompt: messages[0]?.content as string,
        },
        apiOptions,
      );
    }
    case "anthropic": {
      const systemRoleMessage = messages.find(
        (message) => message!.role === "system",
      );
      return anthropicPrompt(
        {
          ...autoTuneAnthropicHyperparameters(
            mapAnthropicPromptOptions<Anthropic.Messages.MessageCreateParamsNonStreaming>(
              promptOptions as AnthropicPromptOptionsUnion,
            ),
            apiOptions,
          ),
          messages: messages.filter(
            (message) => message!.role !== "system",
          ) as MessageParam[],
          system: (systemRoleMessage?.content as string) || "",
        },
        apiOptions,
      );
    }
    case "huggingface": {
      return huggingFacePrompt(
        {
          ...(promptOptions as ChatParams),
          messages: messages as ChatParams["messages"],
        },
        apiOptions,
      );
    }
    case "ollama": {
      return ollamaPrompt(
        {
          ...(promptOptions as OllamaBody),
          messages: messages as ChatParams["messages"],
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
          messages: messages as ChatParams["messages"],
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
          messages: messages as ChatParams["messages"],
        },
        apiOptions,
      );
    }
  }
};

export const promptStreaming = async (
  messages: ChatParams["messages"],
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
      const systemRoleMessage = messages.find(
        (message) => message!.role === "system",
      );

      await anthropicPromptStreaming(
        {
          ...autoTuneAnthropicHyperparameters(
            mapAnthropicPromptOptions<Anthropic.Messages.MessageCreateParamsStreaming>(
              promptOptions as AnthropicPromptOptionsUnion,
            ),
            apiOptions,
          ),
          messages: messages.filter(
            (message) => message!.role !== "system",
          ) as MessageParam[],
          system: (systemRoleMessage?.content as string) || "",
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
          messages: messages as ChatParams["messages"],
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
          messages: messages as ChatParams["messages"],
        },
        onChunk,
        onStop,
        onError,
        apiOptions,
      );
    }
  }
};
