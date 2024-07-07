import type { Model, Price, Usage } from "./interfaces";

export const calculatePrice = (model: Model, usage: Usage): Price => {
  if (model.provider === "voyageai") {
    return {
      input: model.input * usage.totalTokens,
      output: 0,
      total: model.input * usage.totalTokens,
    };
  }

  const input = model.input * usage.inputTokens;
  const output = model.output * usage.outputTokens;
  return {
    input,
    output,
    total: input + output,
  };
};
