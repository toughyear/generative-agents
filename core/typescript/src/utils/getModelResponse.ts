import {
  ModelInstance,
  ModelName,
  ModelOptions,
  OpenAIModelOptions,
} from "../interface";

interface ModelResponseInterface {
  modelInstance: ModelInstance;
  modelName: ModelName;
  // Additional options that are neeeded to make the query for a specific model
  modelOptions: ModelOptions;
}

export const getModelResponse = async ({
  modelInstance,
  modelName,
  modelOptions,
}: ModelResponseInterface) => {
  switch (modelName) {
    case ModelName.OPEN_AI: {
      const { parameters } = modelOptions as OpenAIModelOptions;
      try {
        const response = await modelInstance.createChatCompletion(parameters);
        return response;
      } catch (error) {
        console.error(`Problem fetching results  ${error}`);
      }
    }
  }
};
