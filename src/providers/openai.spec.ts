import { expect, test } from "vitest";
import { systemPrompt, systemPromptStreaming } from "../system-prompt";
import models from "../models";
import dotenv from "dotenv";
import type { EmbeddingProvider, Price, Usage } from "../interfaces";
import { prompt, promptStreaming } from "../prompt";
import { embed } from "../embed";

// load api keys from .env
dotenv.config();

test("System Prompt - OpenAI GPT-4 Turbo Streaming", async () => {
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
          usage: Usage,
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
          expect(typeof usage.outputTokens).toEqual("number");
          expect(typeof usage.inputTokens).toEqual("number");
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

test("Mutli-message Prompt - OpenAI GPT-4 Turbo Streaming", async () => {
  const model = models["openai-gpt-4-turbo"];
  return new Promise<void>((resolve, reject) => {
    (async () => {
      let partialResponseText = "";
      await promptStreaming(
        [
          {
            role: "user",
            content: "Let's have fun with JSON, shall we?",
          },
          {
            role: "assistant",
            content: "Yeah. Let's have fun with JSON.",
          },
          {
            role: "user",
            content: "Respond with JSON: { works: true }",
          },
        ],
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
          usage: Usage,
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
          expect(typeof usage.outputTokens).toEqual("number");
          expect(typeof usage.inputTokens).toEqual("number");
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

test("System Prompt - OpenAI GPT-4o Non-Streaming", async () => {
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
  expect(typeof result.usage?.outputTokens).toEqual("number");
  expect(typeof result.usage?.inputTokens).toEqual("number");
  expect(typeof result.usage?.totalTokens).toEqual("number");
  expect(typeof result.price?.input).toEqual("number");
  expect(typeof result.price?.output).toEqual("number");
  expect(typeof result.price?.total).toEqual("number");
}, 100000);

test("Multi-message Prompt - OpenAI GPT-4o Non-Streaming", async () => {
  const model = models["openai-gpt-4o"];

  const result = await prompt(
    [
      {
        role: "user",
        content: "Let's have fun with JSON, shall we?",
      },
      {
        role: "assistant",
        content: "Yeah. Let's have fun with JSON.",
      },
      {
        role: "user",
        content: "Respond with JSON: { works: true }",
      },
    ],
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
  expect(typeof result.usage?.outputTokens).toEqual("number");
  expect(typeof result.usage?.inputTokens).toEqual("number");
  expect(typeof result.usage?.totalTokens).toEqual("number");
  expect(typeof result.price?.input).toEqual("number");
  expect(typeof result.price?.output).toEqual("number");
  expect(typeof result.price?.total).toEqual("number");
}, 100000);

test("Embedding - text-embedding-3-small", async () => {
  const model = models["openai-text-embedding-3-small"];

  const result = await embed(
    ["Let's have fun with JSON, shall we?", "Yeah. Let's have fun with JSON."],
    model.provider as EmbeddingProvider,
    {
      // union of parameters passed down, mapped internally
      model: model.id as "text-embedding-3-small",
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
  expect(result.data[0].embedding.length).toEqual(1536);
  expect(result.data[1].embedding.length).toEqual(1536);
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
