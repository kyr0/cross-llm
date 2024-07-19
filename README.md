<span align="center">

  # cross-llm

</span>

> Use LLM and Vector Embedding APIs on the web platform. Uses standard `fetch()` and thus runs everywhere, including in Service Workers.

## 🌟 Features

The most simple API to use LLMs. It can hardly be easier than **1 function call** 😉

> And what's bes? 

AI models _currently_ supported:
-  ✅ **OpenAI**: Any OpenAI LLM, including GPT-4 and newer models.
   - ✅ Promise-based
   - ✅ Streaming 
   - ✅ Single message system prompt (instruct)
   - ✅ Multi-message prompt (chat)
   - ✅ Cost model 
   - ✅ Text Embedding
-  ✅ **Anthropic**: The whole Claude model-series, including Opus.
   - ✅ Promise-based
   - ✅ Streaming 
   - ✅ Single message system prompt (instruct)
   - ✅ Multi-message prompt (chat)
   - ✅ Cost model 
   - 〰️ Text Embedding (_Anthropic doesn't provide embedding endpoints_)
-  ✅ **Perplexity**: All models supported.
   - ✅ Promise-based
   - ✅ Streaming 
   - ✅ Single message system prompt (instruct)
   - ✅ Multi-message prompt (chat)
   - ✅ Cost model (including flat fee)
   - 〰️ Text Embedding (_Perplexity doesn't provide embedding endpoints_)
-  ✅ **VoyageAI**: Text Embedding models
   - ✅ Text Embedding
-  ✅ **Mixedbread AI**: Text Embedding models, specifically for **German**
   - ✅ Text Embedding

AI providers and models **to be supported soon**:
-  ❌ **Google**: The whole Gemeni model-series, including 1.5 Pro, Advanced.
-  ❌ **Cohere**: The whole Command model-series, including Command R Plus.
-  ❌ **Ollama**: All Ollama LLMs, including Llama 3.
-  ❌ **HuggingFace**: All HuggingFace LLMs.

## 📚 Usage

1. 🔨 First install the library:
`npm/pnpm/yarn/bun install cross-llm`

2. 💡 Take a look at the super-simple [code examples](./examples/).

#### Single System Prompt
```ts
import { systemPrompt } from "cross-llm";

const promptResonse = await systemPrompt("Respond with JSON: { works: true }", "anthropic", {
  model: "claude-3-haiku-20240307",
  temperature: 0.7,
  max_tokens: 4096
}, { apiKey: import.meta.env[`anthropic_api_key`] });

// promptResponse.message => {\n  "works": true\n}
// promptResponse.usage.outputTokens => 12
// promptResponse.usage.inputTokens => 42
// promptResponse.usage.totalTokens => 54
// promptResponse.price.input => 0.0000105
// promptResponse.price.output => 0.000015
// promptResponse.price.total => 0.0000255
// promptResponse.finishReason => "end_turn"
// promptResponse.elapsedMs => 888 // milliseconds elapsed
// promptResponse.raw => provider's raw completion response object, no mapping
// promptResponse.rawBody => the exact body object passed to the provider's completion endpoint
```

#### Text Embedding
```ts
import { embed } from "cross-llm";

const textEmbedding = await embed(["Let's have fun with JSON, shall we?"], "voyageai", {
  model: "voyage-large-2-instruct",
}, { apiKey: import.meta.env[`voyageai_api_key`], });

// textEmbedding.data[0].embedding => [0.1134245, ...] // n-dimensional embedding vector
// textEmbedding.data[0].index => 0
// textEmbedding.usage.totalTokens => 23
// textEmbedding.price.total => calculated price
// textEmbedding.elapsedMs => 564 // in milliseconds
```

#### Multi-Message Prompt, Streaming
```ts
import { promptStreaming, type PromptFinishReason, type Usage, type Price } from "cross-llm";

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
  "openai",
  async (partialText: string, elapsedMs: number) => {
    // onChunk

    // stream-write to terminal
    process.stdout.write(partialText);
  },
  async (fullText: string, 
    elapsedMs: number,
    usage: Usage,
    finishReason: PromptFinishReason,
    price: Price) => {

    // onStop
    console.log("")
    console.log("parsed JSON", JSON.parse(fullText));
    console.log("finishReason", finishReason);
    console.log("elapsedMs", elapsedMs);
    console.log("usage", usage);
    console.log("price", price);
  },
  async (error: unknown, elapsedMs: number) => {
    // onError
    console.log("error", error, elapsedMs, 'ms elapsed');
  },
  {
    model: "gpt-4-turbo",
    temperature: 0.7,
    response_format: {
      type: "json_object",
    }
  },
  {
    // union of options passed down, mapped internally
    apiKey: import.meta.env[`openai_api_key`],
  },
);
```

3. 📋 Copy & Paste -> enjoy! 🎉

## 🔥 Contributing

Simply create an issue or fork this repository, clone it and create a Pull Request (PR).
I'm just implementing the features, AI model providers, cost model mappings that I need,
but feel free to simply add your models or implement new AI providers. 
Every contribution is very welcome! 🤗

### List/verify supported models

Please verify that your model/provider has been added correctly in `./src/models`.

`npm run print-models`

### Write and verify example code

Please add example code for when you implement a new AI provider in `./examples`.

`npm run example openai.ts`

or

`npm run example voyageai-embedding.ts`

### Write tests for new AI providers

Please write and run unit/integration/e2e tests using `jest` by creating `./src/*.spec.ts` test suites:

`npm run test`

### Build a release

Run the following command to update the `./dist` files:

`npm run build`

Create a new NPM release build:

`npm pack`

Check the package contents for integrity.

`npm publish`


