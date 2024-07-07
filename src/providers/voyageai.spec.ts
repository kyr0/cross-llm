import { expect, test } from "vitest";
import models from "../models";
import dotenv from "dotenv";
import { embed } from "../embed";
import type { EmbeddingProvider } from "../interfaces";

// load api keys from .env
dotenv.config();

test("Embedding voyage-large-2-instruct", async () => {
  const model = models["voyageai-voyage-large-2-instruct"];

  console.log("model", model);

  const result = await embed(
    ["Let's have fun with JSON, shall we?", "Yeah. Let's have fun with JSON."],
    model.provider as EmbeddingProvider,
    {
      // union of parameters passed down, mapped internally
      model: model.id,
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
  expect(result.data.length).toEqual(2);
  expect(typeof result.data[0]).toEqual("object");
  expect(typeof result.data[1]).toEqual("object");
  expect(typeof result.data[0].index).toEqual("number");
  expect(typeof result.data[1].index).toEqual("number");
  expect(Array.isArray(result.data[0].embedding)).toEqual(true);
  expect(Array.isArray(result.data[1].embedding)).toEqual(true);
  expect(result.data[0].embedding.length).toEqual(1024);
  expect(result.data[1].embedding.length).toEqual(1024);
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
