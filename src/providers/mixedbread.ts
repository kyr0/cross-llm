import type {
  EmbeddingApiOptions,
  EmbeddingParams,
  EmbeddingResponse,
} from "../interfaces";
import { openAIEmbed } from "./openai";

export const mixedbreadAIEmbed = async (
  text: string | Array<string> | Array<number> | Array<Array<number>>,
  params: EmbeddingParams,
  apiOptions: EmbeddingApiOptions = {},
): Promise<EmbeddingResponse> => {
  if (!params.model) {
    params.model = "mixedbread-ai/mxbai-embed-large-v1"; // MTEB 64.68 avg
  }

  const embeddingResult = await openAIEmbed(text, params, {
    ...apiOptions,
    baseUrl: "https://api.mixedbread.ai/v1/",
    overrideProvider: "mixedbread-ai",
  });

  return {
    ...embeddingResult,
    usage: {
      ...embeddingResult.usage,
      outputTokens: 0,
      inputTokens: embeddingResult.usage.totalTokens,
    },
  };
};
