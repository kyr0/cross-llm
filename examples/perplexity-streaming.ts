import dotenv from "dotenv";
import { type PromptFinishReason, type Usage, promptStreaming } from "../src";

// load api keys from .env
dotenv.config();

console.log("Streaming Perplexity llama-3-sonar-large-32k-online:")

await promptStreaming(
  [
    {
      role: "system",
      content: "Be grounded and precise. If no answer is found, report that no evidence is available.",
    },
    {
      role: "user",
      content: "When was the re-union of Germany?",
    }
  ],
  "perplexity",
  async (partialText: string, elapsedMs: number) => {
    // onChunk

    // stream-write to console
    process.stdout.write(partialText);
  },
  async (fullText: string, 
    elapsedMs: number,
    usage: Usage,
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
    model: "llama-3-sonar-large-32k-online",
    temperature: 0.001,
    return_citations: true,
    return_images: true,
  },
  {
    // union of options passed down, mapped internally
    apiKey: process.env[`perplexity_api_key`],
  },
);