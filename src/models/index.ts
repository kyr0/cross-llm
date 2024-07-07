import openAiModels from "./openai.json";
import anthropicModels from "./anthropic.json";
import voyageAiModels from "./voyageai.json";
import type { EmbeddingProvider, LLMProvider, Models } from "../interfaces";

const models = {
  ...openAiModels,
  ...anthropicModels,
  ...voyageAiModels,
} as Models;

export const getModel = (
  provider: LLMProvider | EmbeddingProvider,
  id: string,
) => models[`${provider}-${id}`];

export default models;
