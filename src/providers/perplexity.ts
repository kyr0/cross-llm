import type {
  PerplexityBody,
  Price,
  PromptApiOptions,
  PromptResponse,
  Usage,
} from "../interfaces";
import { openAIPrompt, openAIPromptStreaming } from "./openai";
import type { ChatStreamResponse } from "openai-fetch";

export const perplexityPrompt = async (
  body: PerplexityBody,
  apiOptions: PromptApiOptions = {},
): Promise<PromptResponse> => {
  if (!body.model) {
    body.model = "llama-3-sonar-small-32k-chat";
  }

  // see: https://docs.perplexity.ai/docs/getting-started
  return openAIPrompt(body, {
    ...apiOptions,
    baseUrl: "https://api.perplexity.ai",
    overrideProvider: "perplexity",
  });
};

export const perplexityPromptStreaming = async (
  body: PerplexityBody,
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
  if (!body.model) {
    body.model = "llama-3-sonar-small-32k-chat";
  }

  // see: https://docs.perplexity.ai/docs/getting-started
  return openAIPromptStreaming(body, onChunk, onStop, onError, {
    ...apiOptions,
    baseUrl: "https://api.perplexity.ai",
    overrideProvider: "perplexity",
  });
};
