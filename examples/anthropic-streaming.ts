import dotenv from "dotenv";
import { systemPromptStreaming, type PromptFinishReason, type PromptTokenUsage } from "../src";

// load api keys from .env
dotenv.config();

console.log("Streaming Anthropic Claude 3 Haiku:")

await systemPromptStreaming(
  "Respond with JSON: { works: true }",
  "anthropic",
  async (partialText: string, elapsedMs: number) => {
    // onChunk

    // stream-write to console
    process.stdout.write(partialText);
  },
  async (fullText: string, 
    elapsedMs: number,
    usage: PromptTokenUsage,
    finishReason: PromptFinishReason) => {
    // onStop
    // you will get the full text here again, accumulated
    //console.log("Full result", fullText);

    console.log("")
    console.log("parsed JSON", JSON.parse(fullText));
    console.log("finishReason", finishReason);
    console.log("elapsedMs", elapsedMs);
    console.log("usage", usage);
  },
  async (error: unknown, elapsedMs: number) => {
    // onError
    console.log("error", error, elapsedMs, 'ms elapsed');
  },
  {
    // model identifier of the provider
    model: "claude-3-haiku-20240307",
    temperature: 0.7,
    max_tokens: 4096,
  },
  {
    // union of options passed down, mapped internally
    apiKey: process.env[`anthropic_api_key`],
  },
);