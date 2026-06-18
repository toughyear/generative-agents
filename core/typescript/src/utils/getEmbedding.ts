import { ModelInstance, ModelName } from "../interface";

export interface EmbeddingInterafce {
  description: string;
  modelName: ModelName;
  modelInstance: ModelInstance;
}

export const getEmbedding = async ({
  description,
  modelName,
  modelInstance,
}: EmbeddingInterafce): Promise<number[]> => {
  switch (modelName) {
    case ModelName.OPEN_AI:
      const { data } = await modelInstance.createEmbedding({
        input: description,
        model: "text-embedding-ada-002",
      });
      return data?.data[0]?.embedding;
  }
};
