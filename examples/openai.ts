import dotenv from "dotenv";
import { prompt } from "../src";

// load api keys from .env
dotenv.config();

console.log("Promise-based OpenAI GPT-4 Turbo:")

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
  "openai",
  {
    // model identifier of the provider
    model: "gpt-4-turbo",
    temperature: 0.7,
    response_format: {
      type: "json_object",
    }
  },
  {
    // union of options passed down, mapped internally
    apiKey: process.env[`openai_api_key`],
  },
);

console.log("result", result);