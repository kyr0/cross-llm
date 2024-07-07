import dotenv from "dotenv";
import { systemPrompt } from "../src";

// load api keys from .env
dotenv.config();

console.log("Promise-based OpenAI GPT-4 Turbo:")

const result = await systemPrompt(
  "Respond with JSON: { works: true }",
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