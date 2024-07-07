import type Anthropic from "@anthropic-ai/sdk";
import type { GenerateRequest } from "cohere-ai/api";
import type { ChatParams } from "openai-fetch";
import type { HuggingFaceBody } from "./huggingface";
import type { OllamaBody } from "./ollama";
import type { GeminiOptions } from "./gemini";

export interface PromptTokenUsage {
  completionTokens: number;
  promptTokens: number;
  totalTokens: number;
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
  message: string | null;
  usage: PromptTokenUsage;
  finishReason: PromptFinishReason;
  elapsedMs: number;
  price: Price;
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

export interface Price {
  input: number;
  output: number;
  total: number;
}

export type ModelProviderType =
  | "openai"
  | "anthropic"
  | "cohere"
  | "huggingface"
  | "ollama"
  | "gemini"
  | "perplexity";

export interface Model {
  input: number;
  output: number;
  provider: ModelProviderType;
  maxContextTokens: number;
  maxInputTokens: number;
  maxOutputTokens: number;
  id: string;
  label: string;
  cutoff: string;
}

export interface Models {
  [modelPrimaryKey: string]: Model;
}
