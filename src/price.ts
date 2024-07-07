import type { Model, Price } from "./interfaces";

export const calculatePrice = (
  model: Model,
  inputTokens: number,
  outputTokens: number,
): Price => {
  const input = model.input * inputTokens;
  const output = model.output * outputTokens;
  return {
    input,
    output,
    total: input + output,
  };
};
