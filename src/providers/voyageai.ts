import type {
  EmbeddingApiOptions,
  EmbeddingParams,
  EmbeddingResponse,
} from "../interfaces";
import { openAIEmbed } from "./openai";

export const voyageAIEmbed = async (
  text: string | Array<string> | Array<number> | Array<Array<number>>,
  params: EmbeddingParams,
  apiOptions: EmbeddingApiOptions = {},
): Promise<EmbeddingResponse> => {
  if (!params.model) {
    params.model = "voyage-large-2-instruct"; // 68.28% MTEB
  }

  const embeddingResult = await openAIEmbed(text, params, {
    ...apiOptions,
    baseUrl: "https://api.voyageai.com/v1/",
    overrideProvider: "voyageai",
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
