import openAiModels from "./openai.json";
import anthropicModels from "./anthropic.json";
import type { ModelProviderType, Models } from "../interfaces";

const models = {
  ...openAiModels,
  ...anthropicModels,
} as Models;

export const getModel = (provider: ModelProviderType, id: string) =>
  models[`${provider}-${id}`];

export default models;
