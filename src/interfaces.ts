import type Anthropic from "@anthropic-ai/sdk";
import type { GenerateRequest } from "cohere-ai/api";
import type { ChatMessage, ChatParams } from "openai-fetch";
import type { HuggingFaceBody } from "./providers/huggingface";
import type { OllamaBody } from "./providers/ollama";
import type { GeminiOptions } from "./providers/gemini";

export interface Usage {
  outputTokens: number;
  inputTokens: number;
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
  usage: Usage;
  finishReason: PromptFinishReason;
  elapsedMs: number;
  price: Price;
  raw: any;
  rawBody: any;
}

export interface PerplexityBody extends ChatParams {
  model: // Meta/Perplexity models
    | "llama-3-sonar-small-32k-chat"
    | "llama-3-sonar-small-32k-online"
    | "llama-3-sonar-large-32k-chat"
    | "llama-3-sonar-large-32k-online"
    // Open-source models
    //| "llama-3-8b-instruct"
    //| "llama-3-70b-instruct"
    //| "mixtral-8x7b-instruct"
    | string /** https://docs.perplexity.ai/docs/model-cards */;
  return_citations?: boolean;
  return_images?: boolean;
}

export type PromptOptionsUnion =
  | Partial<GenerateRequest>
  | Partial<Anthropic.Messages.MessageCreateParamsNonStreaming>
  | Partial<Anthropic.Messages.MessageCreateParamsStreaming>
  | Partial<ChatParams>
  | Partial<HuggingFaceBody>
  | Partial<OllamaBody>
  | Partial<GeminiOptions>
  | Partial<PerplexityBody>;

export type PromptMessagesUnion =
  | Partial<Anthropic.Messages.MessageParam[]>
  | Partial<ChatMessage[]>;

export interface Price {
  input: number;
  output: number;
  total: number;
}

export type LLMProvider =
  | "openai"
  | "anthropic"
  | "cohere"
  | "huggingface"
  | "ollama"
  | "gemini"
  | "perplexity"
  | "voyageai";

export type EmbeddingProvider = "openai" | "voyageai";

export interface Model {
  input: number;
  output: number;
  provider: LLMProvider | EmbeddingProvider;
  maxContextTokens: number;
  maxInputTokens: number;
  // https://docs.perplexity.ai/docs/pricing
  flatFee?: number; // flat surcharge in cents (e.g. perplexity for their -online models)
  id: string;
  label: string;
  // not relevant for Embedding models
  maxOutputTokens?: number;
  cutoff?: string;
  dimensions?: number;
  minDimensions?: number;
}

export interface Models {
  [modelPrimaryKey: string]: Model;
}

export interface EmbeddingParams {
  model?: string;
  truncation?: boolean;
  input_type?: null | "query" | "document";
  encoding_format?: null | "base64" | "float";
  dimensions?: number;
  user?: string;
}

export interface Embedding {
  embedding: Array<number>;
  index: number;
  object: "embedding";
}

export interface EmbeddingResponse {
  usage: Usage;
  elapsedMs: number;
  price: Price;
  data: Array<Embedding>;
}

export interface EmbeddingApiOptions {
  baseUrl?: string;
  apiKey?: string;
  hostingLocation?: string;
  overrideProvider?: LLMProvider | EmbeddingProvider;
}

export interface PromptApiOptions extends EmbeddingApiOptions {
  /** linear scale [0..1], whereas 0 is close to determinism */
  autoTuneCreativity?: number;

  /** how much variety of terms is desired? [0..1], whereas 0 means: use the same terms over and over */
  autoTuneWordVariety?: number;

  /** how much should the model stay focused and on topic? [0..1], whereas 1 means: alot of focus, less topics */
  autoTuneFocus?: number;
}

export type Messages = Array<
  ChatMessage | { content: string | null; role: string }
>;
