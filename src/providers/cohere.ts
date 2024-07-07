import { CohereClient } from "cohere-ai";
import type { GenerateRequest } from "cohere-ai/api";
import { getModel } from "../models";
import type { PromptApiOptions, PromptResponse, Usage } from "../interfaces";
import { calculatePrice } from "../price";

// uses global fetch() when in non-Node env
export const coherePrompt = async (
  body: Partial<GenerateRequest>,
  apiOptions: PromptApiOptions = {},
): Promise<PromptResponse> => {
  apiOptions = {
    ...apiOptions,
    apiKey: apiOptions.apiKey,
  };
  const cohere = new CohereClient({
    token: apiOptions.apiKey,
  });

  const start = Date.now();

  if (!body.model) {
    body.model = "command-r-plus";
  }

  console.log("Using model:", body.model);

  if (!body.maxTokens) {
    body.maxTokens = 128 * 1000;
  }

  if (!body.temperature) {
    body.temperature = 0.3;
  }

  const completion = await cohere.generate(body as GenerateRequest);
  const end = Date.now();
  const elapsedMs = end - start;
  const usage: Usage = {
    outputTokens: completion.meta!.tokens?.outputTokens || 0,
    inputTokens: completion.meta!.tokens?.inputTokens || 0,
    totalTokens:
      (completion.meta!.tokens?.inputTokens || 0) +
      (completion.meta!.tokens?.outputTokens || 0),
  };

  const response = {
    message: completion.generations.map((c) => c.text).join(""),
    usage,
    finishReason: "completed",
    elapsedMs,
    price: calculatePrice(getModel("cohere", body.model), usage),
  };
  return response;
};
