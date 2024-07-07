<span align="center">

  # cross-llm

</span>

> Use every LLM in every environment with one simple API. Works in Node.js/Bun/Deno, Service Workers, Web Extensions, PWAs.

## 🌟 Features

The most simple API to use LLMs. It can hardly be easier than **1 function call** 😉

AI models _currently_ supported:
-  ✅ **OpenAI**: Any OpenAI LLM, including GPT-4 and newer models.
   - ✅ Promise-based
   - ✅ Streaming 
   - ✅ Single message system prompt (instruct)
   - ✅ Multi-message prompt (chat)
   - ✅ Cost model 
-  ✅ **Anthropic**: The whole Claude model-series, including Opus.
   - ✅ Promise-based
   - ✅ Streaming 
   - ✅ Single message system prompt (instruct)
   - ✅ Multi-message prompt (chat)
   - ✅ Cost model 

AI providers and models **to be supported soon**:
-  ✅ **Google**: The whole Gemeni model-series, including 1.5 Pro, Advanced.
-  ✅ **Cohere**: The whole Command model-series, including Command R Plus.
-  ✅ **Ollama**: All Ollama LLMs, including Llama 3.
-  ✅ **HuggingFace**: All HuggingFace LLMs.
-  ✅ **Perplexity**: All models.

## 📚 Usage

1. 🔨 First install the library:
`npm/pnpm/yarn/bun install cross-llm`

2. 💡 Take a look at the super-simple [code examples](./examples/).

```ts
import { systemPrompt } from "cross-llm";

const response = 
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

### Write tests for new AI providers

Please write and run unit/integration/e2e tests using `jest` by creating `./src/*.spec.ts` test suites:

`npm run test`

### Build a release

Run the following command to update the `./dist` files:

`npm run build`

Create a new NPM release build:

`npm pack`


