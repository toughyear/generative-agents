import { Configuration, CreateChatCompletionRequest, OpenAIApi } from "openai";
import { cosineSimilarity } from "./helpers";

/**
 * returns a engine instance that manages agents and their inference requirements
 */
export class AgentEngine {
  openai: OpenAIApi;
  model: string;

  constructor(apiKey: string, model: string = "gpt-3.5-turbo") {
    const configuration = new Configuration({
      apiKey,
    });
    this.openai = new OpenAIApi(configuration);
    this.model = model;
  }

  async getEmbedding(memoryDescription: string): Promise<number[]> {
    const { data } = await this.openai.createEmbedding({
      input: memoryDescription,
      model: "text-embedding-ada-002",
    });

    return data.data[0].embedding;
  }

  async getImportanceScore(memoryDescription: string): Promise<number> {
    // create the prompt for the OpenAI API
    const prompt = `On the scale of 1 to 10, where 1 is purely mundane
      (e.g., brushing teeth, making bed) and 10 is
      extremely poignant (e.g., a break up, college
      acceptance), rate the likely poignancy of the
      following piece of memory.
      Memory: ${memoryDescription}
      Rating:`;

    // set the OpenAI API parameters
    const parameters: CreateChatCompletionRequest = {
      model: this.model,
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
    };

    // call the OpenAI API
    const response = await this.openai.createChatCompletion(parameters);

    // get the importance score from the response
    const score = Number(response.data.choices[0].message?.content);

    return score;
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
}
