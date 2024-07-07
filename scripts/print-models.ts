import models from "../src/models";
// @ts-ignore
import prettyjson from "prettyjson"

console.log("All supported models (see ./src/models):")

console.log(prettyjson.render(models));