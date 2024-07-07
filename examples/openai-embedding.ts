import dotenv from "dotenv";
import { embed } from "../src";

// load api keys from .env
dotenv.config();

console.log("Promise-based OpenAI Text Embedding 3 Small:")
const result = await embed(
  ["Let's have fun with JSON, shall we?", "Yeah. Let's have fun with JSON."],
  "openai",
  {
    // union of parameters passed down, mapped internally
    model: "text-embedding-3-small",
  },
  {
    // union of options passed down, mapped internally
    apiKey: process.env[`openai_api_key`],
  },
);

console.log("result", result);