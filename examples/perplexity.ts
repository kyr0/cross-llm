import dotenv from "dotenv";
import { prompt } from "../src";

// load api keys from .env
dotenv.config();

console.log("Promise-based Perplexity llama-3-sonar-large-32k-online:")

const result = await prompt(
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

console.log("result", result);