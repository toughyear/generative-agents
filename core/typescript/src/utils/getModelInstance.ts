import { Configuration, OpenAIApi } from "openai";
import { ModelInstance, ModelName } from "../interface";

export const getModelInstance = (
  modelName: ModelName,
  modelKey: string
): ModelInstance => {
  switch (modelName) {
    case ModelName.OPEN_AI: {
      // Intialise OPEN AI.
      const config = new Configuration({
        apiKey: modelKey,
      });
      return new OpenAIApi(config);
    }
    default: {
      /** Would be cool if we can print the actual types supported here from the typescript defination. */
      throw new Error("Model not supported");
    }
  }
};
