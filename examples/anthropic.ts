import dotenv from "dotenv";
import { prompt } from "../src";

// load api keys from .env
dotenv.config();

console.log("Promise-based Anthropic Claude 3 Haiku:")

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
  "anthropic",
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

console.log("result", result);