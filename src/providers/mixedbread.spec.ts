import { expect, test } from "vitest";
import models from "../models";
import dotenv from "dotenv";
import { embed } from "../embed";
import type { EmbeddingProvider } from "../interfaces";

// load api keys from .env
dotenv.config();

test("Embedding deepset-mxbai-embed-de-large-v1", async () => {
  const model =
    models["mixedbread-ai-mixedbread-ai/deepset-mxbai-embed-de-large-v1"];

  console.log("model", model);

  const result = await embed(
    "Hallo, Welt!",
    model.provider as EmbeddingProvider,
    {
      // union of parameters passed down, mapped internally
      model: model.id as "mixedbread-ai/deepset-mxbai-embed-de-large-v1",
    },
    {
      // union of options passed down, mapped internally
      apiKey: import.meta.env[`${model.provider}_api_key`],
    },
  );

  expect(typeof result.elapsedMs).toEqual("number");
  expect(result.elapsedMs).toBeGreaterThan(0);
  expect(typeof result.usage?.outputTokens).toEqual("number");
  expect(typeof result.usage?.inputTokens).toEqual("number");
  expect(typeof result.usage?.totalTokens).toEqual("number");
  expect(result.data).toBeDefined();
  expect(Array.isArray(result.data)).toEqual(true);
  expect(result.data.length).toEqual(1);

  console.log("result", result);

  expect(typeof result.data[0]).toEqual("object");
  expect(typeof result.data[0].index).toEqual("number");
  expect(Array.isArray(result.data[0].embedding)).toEqual(true);
  expect(result.data[0].embedding.length).toEqual(1024);
}, 100000);

/*
test("Hyperparameter mapping", async () => {
  autoTuneOpenAIHyperparameters(
    {},
    {
      autoTuneCreativity: 0.7,
      autoTuneFocus: 0,
      autoTuneWordVariety: 0,
    },
  );
});
*/
