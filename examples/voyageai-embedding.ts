import dotenv from "dotenv";
import { embed } from "../src";

// load api keys from .env
dotenv.config();

console.log("Promise-based VoyageAI Text Embeddings Voyage Large 2 Instruct:")
const result = await embed(
  ["Let's have fun with JSON, shall we?", "Yeah. Let's have fun with JSON."],
  "voyageai",
  {
    // union of parameters passed down, mapped internally
    model: "voyage-large-2-instruct",
  },
  {
    // union of options passed down, mapped internally
    apiKey: process.env[`voyageai_api_key`],
  },
);

console.log("result", result);