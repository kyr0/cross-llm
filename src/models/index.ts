import openAiModels from "./openai.json";
import anthropicModels from "./anthropic.json";

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

const models = {
  ...openAiModels,
  ...anthropicModels,
} as Models;

export const getModel = (provider: ModelProviderType, id: string) =>
  models[`${provider}-${id}`];

export default models;
