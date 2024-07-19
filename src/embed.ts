import type {
  EmbeddingApiOptions,
  EmbeddingParams,
  EmbeddingProvider,
  EmbeddingResponse,
} from "./interfaces";
import { mixedbreadAIEmbed } from "./providers/mixedbread";
import { openAIEmbed } from "./providers/openai";
import { voyageAIEmbed } from "./providers/voyageai";

export const embed = async (
  text: string | Array<string> | Array<number> | Array<Array<number>>,
  providerType: EmbeddingProvider,
  params: EmbeddingParams,
  apiOptions: EmbeddingApiOptions = {},
): Promise<EmbeddingResponse> => {
  switch (providerType) {
    case "openai": {
      return openAIEmbed(text, params, apiOptions);
    }
    case "voyageai": {
      return voyageAIEmbed(text, params, apiOptions);
    }
    case "mixedbread-ai": {
      return mixedbreadAIEmbed(text, params, apiOptions);
    }
    default: {
      return openAIEmbed(text, params, apiOptions);
    }
  }
};
