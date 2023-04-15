import { Configuration, CreateChatCompletionRequest, OpenAIApi } from "openai";

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
    const score = Number(response.data.choices[0].message);

    return score;
  }

  async getEmbedding(memoryDescription: string): Promise<number[]> {
    const prompt = `Retrieve an embedding for the following text: "${memoryDescription}".`;

    const { data } = await this.openai.createEmbedding({
      input: memoryDescription,
      model: "text-embedding-ada-002",
    });

    return data.data[0].embedding;
  }
}
