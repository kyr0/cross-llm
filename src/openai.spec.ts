import { expect, test } from "vitest";
import { systemPrompt, systemPromptStreaming } from "./prompt";
import models from "./models";
import dotenv from "dotenv";
import type { Price, PromptTokenUsage } from "./interfaces";

// load api keys from .env
dotenv.config();

test("OpenAI GPT-4 Turbo Streaming", async () => {
  const model = models["openai-gpt-4-turbo"];
  return new Promise<void>((resolve, reject) => {
    (async () => {
      let partialResponseText = "";
      await systemPromptStreaming(
        "Respond with JSON: { works: true }",
        model.provider,
        async (text: string, elapsedMs: number) => {
          // onChunk
          partialResponseText += text || "";
          expect(typeof elapsedMs).toEqual("number");
          expect(elapsedMs).toBeGreaterThan(0);
        },
        async (
          fullText: string,
          elapsedMs: number,
          usage: PromptTokenUsage,
          reason: string,
          price: Price,
        ) => {
          // onStop
          expect(partialResponseText).toEqual(fullText);
          expect(typeof reason).toEqual("string");
          expect(reason.length).toBeGreaterThan(0);
          expect(JSON.parse(fullText)).toEqual({ works: true });
          expect(typeof elapsedMs).toEqual("number");
          expect(elapsedMs).toBeGreaterThan(0);
          expect(usage).toBeDefined();
          expect(typeof usage.completionTokens).toEqual("number");
          expect(typeof usage.promptTokens).toEqual("number");
          expect(typeof usage.totalTokens).toEqual("number");
          expect(price).toBeDefined();
          expect(typeof price.input).toEqual("number");
          expect(typeof price.output).toEqual("number");
          expect(typeof price.total).toEqual("number");
          resolve();
        },
        async (error: unknown, elapsed: number) => {
          expect(typeof elapsed).toEqual("number");
          console.log("error", error);
          reject(error);
        },
        {
          // union of parameters passed down, mapped internally
          model: model.id,
          max_tokens: model.maxOutputTokens,
          response_format: {
            type: "json_object",
          },
        },
        {
          // union of options passed down, mapped internally
          apiKey: import.meta.env[`${model.provider}_api_key`],
        },
      );
    })();
  });
}, 100000);

test("OpenAI GPT-4o Non-Streaming", async () => {
  const model = models["openai-gpt-4o"];

  const result = await systemPrompt(
    "Respond with JSON: { works: true }",
    model.provider,
    {
      // union of parameters passed down, mapped internally
      model: model.id,
      max_tokens: model.maxOutputTokens,
      response_format: {
        type: "json_object",
      },
    },
    {
      // union of options passed down, mapped internally
      apiKey: import.meta.env[`${model.provider}_api_key`],
    },
  );

  expect(typeof result.message).toEqual("string");
  expect(result.message?.length).toBeGreaterThan(0);
  expect(typeof result.finishReason).toEqual("string");
  expect(result.finishReason?.length).toBeGreaterThan(0);
  expect(typeof result.elapsedMs).toEqual("number");
  expect(result.elapsedMs).toBeGreaterThan(0);
  expect(typeof result.usage?.completionTokens).toEqual("number");
  expect(typeof result.usage?.promptTokens).toEqual("number");
  expect(typeof result.usage?.totalTokens).toEqual("number");
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
