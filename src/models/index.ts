import openAiModels from "./openai.json";
import anthropicModels from "./anthropic.json";
import voyageAiModels from "./voyageai.json";
import perplexityModels from "./perplexity.json";
import mixedbreadAiModels from "./mixedbread-ai.json";
import type { EmbeddingProvider, LLMProvider, Models } from "../interfaces";

const models = {
  ...openAiModels,
  ...anthropicModels,
  ...voyageAiModels,
  ...perplexityModels,
  ...mixedbreadAiModels,
} as Models;

export const getModel = (
  provider: LLMProvider | EmbeddingProvider,
  id: string,
) => models[`${provider}-${id}`];

export default models;
