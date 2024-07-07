import { expect, test } from "vitest";
import models from "../models";
import dotenv from "dotenv";
import { systemPrompt, systemPromptStreaming } from "../system-prompt";
import { prompt, promptStreaming } from "../prompt";
import type { Price, PromptTokenUsage } from "../interfaces";

// load api keys from .env
dotenv.config();

test("System Prompt - Anthropic Sonnet 3.5 Streaming", async () => {
  const model = models["anthropic-claude-3-5-sonnet-20240620"];
  return new Promise<void>((resolve, reject) => {
    (async () => {
      let partialResponseText = "";
      await systemPromptStreaming(
        "Respond with JSON: { works: true }",
        model.provider,
        async (text: string, elapsedMs: number) => {
          // onChunk
          partialResponseText += text || "";
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
        async (error: unknown, elapsedMs: number) => {
          console.log("error", error);
          reject(error);
        },
        {
          // union of parameters passed down, mapped internally
          model: model.id,
          max_tokens: model.maxOutputTokens,
        },
        {
          // union of options passed down, mapped internally
          apiKey: import.meta.env[`${model.provider}_api_key`],
        },
      );
    })();
  });
}, 100000);

test("Multi-message Prompt - Anthropic Sonnet 3.5 Streaming", async () => {
  const model = models["anthropic-claude-3-5-sonnet-20240620"];
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
        async (error: unknown, elapsedMs: number) => {
          console.log("error", error);
          reject(error);
        },
        {
          // union of parameters passed down, mapped internally
          model: model.id,
          max_tokens: model.maxOutputTokens,
        },
        {
          // union of options passed down, mapped internally
          apiKey: import.meta.env[`${model.provider}_api_key`],
        },
      );
    })();
  });
}, 100000);

test("System Prompt - Anthropic Opus 3 Non-Streaming", async () => {
  const model = models["anthropic-claude-3-opus-20240229"];

  const result = await systemPrompt(
    "Respond with JSON: { works: true }",
    model.provider,
    {
      // union of parameters passed down, mapped internally
      model: model.id,
      max_tokens: model.maxOutputTokens,
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
  expect(result.price).toBeDefined();
  expect(typeof result.price?.input).toEqual("number");
  expect(typeof result.price?.output).toEqual("number");
  expect(typeof result.price?.total).toEqual("number");
}, 100000);

test("Multi-message Prompt - Anthropic Opus 3 Non-Streaming", async () => {
  const model = models["anthropic-claude-3-opus-20240229"];

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
  expect(result.price).toBeDefined();
  expect(typeof result.price?.input).toEqual("number");
  expect(typeof result.price?.output).toEqual("number");
  expect(typeof result.price?.total).toEqual("number");
}, 100000);
