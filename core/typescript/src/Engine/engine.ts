import { Agent } from "../Agent/agent";
import { DEFAULT_IMPORTANCE_SCORE } from "../constant";
import { ModelInstance, ModelName } from "../interface";
import { cosineSimilarity } from "../utils/cosineSimilarity";
import { getEmbedding } from "../utils/getEmbedding";
import { getModelInstance } from "../utils/getModelInstance";
import { getModelResponse } from "../utils/getModelResponse";

/** THINK: Should engine be a base class and OPEN_AI and claude extend this class */

/** Engine is responsible for making all the API calls based on the selected model. */
export class Engine {
  /** TODO: Add a list of models here that we add support for */
  modelName: ModelName;
  /** Based on the model name instansicate the model Instance which would be used for making necessary API calls */
  modelInstance: ModelInstance;

  constructor(modelName: ModelName, modelKey: string) {
    this.modelName = modelName;
    this.modelInstance = getModelInstance(modelName, modelKey);
  }

  async createEmbedding(memoryDescription: string): Promise<number[]> {
    const embedding = await getEmbedding({
      description: memoryDescription,
      modelInstance: this.modelInstance,
      modelName: this.modelName,
    });

    return embedding;
  }

  async getImportanceScore(memoryDescription: string): Promise<number> {
    const prompt = `On the scale of 1 to 10, where 1 is purely mundane
    (e.g., brushing teeth, making bed) and 10 is
    extremely poignant (e.g., a break up, college
    acceptance), rate the likely poignancy of the
    following piece of memory.
    Memory: ${memoryDescription}
    Rating:`;

    try {
      const response = await getModelResponse({
        modelInstance: this.modelInstance,
        modelName: this.modelName,
        // TODO: This would also be a function will update this later.
        modelOptions: {
          parameters: {
            model: this.modelName,
            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],
            temperature: 0,
            max_tokens: 1,
            n: 1,
            stop: "\n",
          },
        },
      });
      const score = Number(response?.data?.choices[0]?.message?.content);
      return score;
    } catch (error) {
      return DEFAULT_IMPORTANCE_SCORE;
    }
  }

  async getSalientQuestions(
    memoryDescription: string,
    n: number = 3
  ): Promise<string[]> {
    const prompt = `Given only the information below, provide the ${n} most salient high-level questions we can answer about the subjects in the statements, formatted as follows:
      1. {Question}
      2. {Question}
      3. {Question}
      ...
    INFORMATION: "${memoryDescription}"`;

    const response = await getModelResponse({
      modelInstance: this.modelInstance,
      modelName: this.modelName,
      modelOptions: {
        parameters: {
          model: this.modelName,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.8,
          max_tokens: 200,
          n: 1,
        },
      },
    });

    const generatedText = response?.data?.choices[0]?.message?.content.trim();

    // Use a regular expression to match and extract the questions
    const regex = /\d+\.\s*(.*?)\s*(?=\d+\.|$)/g;
    let match;
    const questions = [];

    if (!generatedText) {
      return [];
    }

    while ((match = regex.exec(generatedText)) !== null) {
      questions.push(match[1]);
    }

    return questions.slice(0, n);
  }

  async getRelevanceScore(
    queryEmbedding: number[],
    memoryEmbedding: number[]
  ): Promise<number> {
    // calculate the cosine similarity between the query and memory
    const similarity = cosineSimilarity(queryEmbedding, memoryEmbedding);

    // normalize the similarity to be between 0 and 1
    const score = (similarity + 1) / 2;

    return score;
  }

  getRecencyScore(
    lastRetrieved: Date,
    currentTime: Date,
    decayFactor: number = 0.94
  ): number {
    const MILLISECONDS_PER_HOUR = 3600000;
    const minutesSinceLastRetrieval =
      (currentTime.getTime() - lastRetrieved.getTime()) / MILLISECONDS_PER_HOUR;

    // Calculate the raw recency score
    const recency = Math.pow(decayFactor, minutesSinceLastRetrieval);

    // Normalize the recency score to be between 0 and 1 (inclusive)
    const minRecency = Math.pow(decayFactor, Number.MAX_SAFE_INTEGER);
    const normalizedRecency = (recency - minRecency) / (1 - minRecency);

    return normalizedRecency;
  }

  async getRetrievalScore(
    importanceScore: number,
    queryEmbedding: number[],
    memoryEmbedding: number[],
    lastRetrieved: Date,
    currentTime: Date,
    decayFactor: number = 0.94
  ): Promise<number> {
    // Get the individual scores
    const relevanceScore = await this.getRelevanceScore(
      queryEmbedding,
      memoryEmbedding
    );
    const recencyScore = this.getRecencyScore(
      lastRetrieved,
      currentTime,
      decayFactor
    );

    // Normalize the importance score to the range [0, 1]
    const normalizedImportanceScore = (importanceScore - 1) / 9;

    // Calculate the final score using the given formula
    const alpha = 1; // can be adjusted to change the relative importance of each score. Equally weighted for now.
    const score =
      alpha * recencyScore * recencyScore +
      alpha * normalizedImportanceScore * importanceScore +
      alpha * relevanceScore * relevanceScore;

    return score;
  }

  async reply(message: string, agent: Agent, context: string): Promise<string> {
    // Construct the prompt for the OpenAI API
    const prompt = `You are acting as a agent with the following description ${agent.description}. The agent is having a conversation with someone. Here is context about what was going on in agents life for sometime:
    CONTEXT START
      ${context}
    CONTEXT END
    Here is the message you (agent) are responding to: "${message}"
    Given the character's personality and the context provided above, reply as the agent.
    `;

    try {
      // Call the OpenAI API
      const response = await getModelResponse({
        modelInstance: this.modelInstance,
        modelName: this.modelName,
        modelOptions: {
          parameters: {
            model: this.modelName,
            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],
            temperature: 0.7,
            max_tokens: 100,
            n: 1,
          },
        },
      });

      // Get the generated response from the API
      const reply = response?.data?.choices?.[0].message?.content?.trim();

      if (!reply) {
        console.log("ERROR: No reply generated");
        return "I'm not sure how to respond.";
      }

      return reply;
    } catch (error) {
      console.log(error);
      return "I'm not sure how to respond.";
    }
  }
}
