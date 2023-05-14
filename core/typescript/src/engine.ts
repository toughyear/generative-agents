import { Configuration, CreateChatCompletionRequest, OpenAIApi } from "openai";
import { cosineSimilarity } from "./maths";
import { AgentPersonality, World } from "./types";
import { getAllKeys } from "./formatters";
import { Agent } from "./agent";

/**
 * returns a engine instance that manages agents and their inference requirements
 */
export class AgentEngine {
  openai: OpenAIApi;
  model: string;

  constructor(apiKey: string, model: string = "gpt-4") {
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

  async getSalientQuestions(
    description: string,
    n: number = 3
  ): Promise<string[]> {
    const prompt = `Given only the information below, provide the ${n} most salient high-level questions we can answer about the subjects in the statements, formatted as follows:
1. {Question}
2. {Question}
3. {Question}
...

INFORMATION: "${description}"
`;

    const parameters: CreateChatCompletionRequest = {
      model: this.model,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 200,
      n: 1,
    };

    const response = await this.openai.createChatCompletion(parameters);
    const generatedText = response.data.choices[0].message?.content.trim();

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

  async getDayPlan(
    name: string,
    age: number,
    personality: AgentPersonality
  ): Promise<
    {
      start: number;
      end: number;
      description: string;
    }[]
  > {
    const prompt = `Here is a description of ${name}, aged ${age} \n
Background: ${personality.background}
Innate Tendencies: ${personality.innateTendency.join(", ")}
Learned Tendencies: ${personality.learnedTendency.join(", ")}
Current Goal: ${personality.currentGoal}
Lifestyle: ${personality.lifestyle}
Values: ${personality.values.join(", ")}

What would ${name}'s day look like? Write in the following format:
[800,1000] Wake up and get ready for the day
[1000,1030] Prepare breakfast and eat
[1030,1700] Work in office
...
[1700,1800] Prepare dinner and eat
[1800,2000] Watch TV
[2000,800] Sleep
`;

    // Set the OpenAI API parameters
    const parameters: CreateChatCompletionRequest = {
      model: this.model,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
      n: 1,
    };

    // Call the OpenAI API
    const response = await this.openai.createChatCompletion(parameters);

    // Get the generated day plan from the response
    const generatedDayPlan = response.data.choices[0].message?.content.trim();

    if (!generatedDayPlan) {
      console.log("ERROR: No day plan generated");
      return [];
    }

    // Use regex to parse the generated day plan and convert it into an array of objects
    const regex = /\[(\d+),(\d+)\]\s+(.+)/g;
    let match;
    const dayPlan: {
      start: number;
      end: number;
      description: string;
    }[] = [];

    while ((match = regex.exec(generatedDayPlan)) !== null) {
      dayPlan.push({
        start: parseInt(match[1]),
        end: parseInt(match[2]),
        description: match[3].trim(),
      });
    }

    return dayPlan;
  }

  async decomposePlanItem(
    name: string,
    age: number,
    personality: AgentPersonality,
    planItems: {
      start: number;
      end: number;
      description: string;
    }[],
    index: number
  ): Promise<
    {
      start: number;
      end: number;
      description: string;
    }[]
  > {
    const planItem = planItems[index];

    const prompt = `
    Here is a description of ${name}, aged ${age} \n
    Background: ${personality.background}
    Innate Tendencies: ${personality.innateTendency.join(", ")}
    Learned Tendencies: ${personality.learnedTendency.join(", ")}
    Current Goal: ${personality.currentGoal}
    Lifestyle: ${personality.lifestyle}
    Values: ${personality.values.join(", ")}
    
    
    In their typical day, they have following planned item:
    [${planItem.start},${planItem.end}] ${planItem.description}

Please decompose it into smaller, more detailed activities. Example in the following format:
[800,830] sub task 1 | 😴💤
[830,850] Sub task 2 | 🍽️🍞
...
[900,1000] last sub task

VERY IMPORTANT -
1. If it doesn't make sense to decompose the activity, please return the original activity. Example -
[800,1000] Wake up and get ready for the day | 😴💤
2. Do not breakdown into more than 4 sub tasks.
3. The start and end time of the sub-tasks should be within the start and end time of the original activity.
4. Always end with emojis describing the task. Min 1 max 3.
5. These sub-tasks should not conflict with other planned activities. Find the list of all planned activities below -
${planItems
  .map(
    (item, i) =>
      `[${item.start},${item.end}] ${item.description} ${
        i === index ? "<--" : ""
      } `
  )
  .join("\n")}
`;

    // Set the OpenAI API parameters
    const parameters: CreateChatCompletionRequest = {
      model: this.model,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 700,
      n: 1,
    };

    // Call the OpenAI API
    const response = await this.openai.createChatCompletion(parameters);

    // Get the generated detailed plan from the response
    const generatedDetailedPlan =
      response.data.choices[0].message?.content.trim();

    if (!generatedDetailedPlan) {
      console.log("ERROR: No detailed plan generated");
      return [];
    }

    // Use regex to parse the generated detailed plan and convert it into an array of objects
    const regex = /\[(\d+),(\d+)\]\s+(.+)/g;
    let match;
    const detailedPlan: {
      start: number;
      end: number;
      description: string;
    }[] = [];

    while ((match = regex.exec(generatedDetailedPlan)) !== null) {
      detailedPlan.push({
        start: parseInt(match[1]),
        end: parseInt(match[2]),
        description: match[3].trim(),
      });
    }

    return detailedPlan;
  }

  async findPreferredLocation(
    world: World,
    taskDescription: string,
    currentLocation: string,
    agentDescription: string
  ): Promise<string> {
    // Construct the prompt for the OpenAI API
    const prompt = `
      We have a game world in which an agent exists. 
      We need to predict the preferred location of the agent while performing some activity. 
      Below is all the details you will require to predict the preferred location of the agent.
      
      TASK_DESCRIPTION: ${taskDescription}
      CURRENT_LOCATION: ${currentLocation}
      AGENT_DESCRIPTION: ${agentDescription}
      WORLD: ${getAllKeys(world).join(", ")}


      find a place in the world where the agent would prefer to be while performing the task described above.
      Reply in following format:
      PREFERRED_LOCATION: <location>
    `;

    // Set the OpenAI API parameters
    const parameters: CreateChatCompletionRequest = {
      model: this.model,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 100,
      n: 1,
    };

    try {
      // Call the OpenAI API
      const response = await this.openai.createChatCompletion(parameters);

      // Get the generated preferred location from the response
      const prediction = response.data.choices[0].message?.content.trim();

      if (!prediction) {
        console.log("ERROR: No preferred location generated");
        return currentLocation; // return the current location if no preferred location generated
      }

      const regex = /PREFERRED_LOCATION:\s+(.+)/g;

      const match = regex.exec(prediction);

      if (!match) {
        console.log("ERROR: No preferred location generated");
        return currentLocation; // return the current location if no preferred location generated
      }

      return match[1];
    } catch (error) {
      console.log(error);
      return currentLocation; // return the current location if no preferred location generated
    }
  }

  async reply(message: string, agent: Agent, context: string): Promise<string> {
    // Construct the prompt for the OpenAI API
    const prompt = `You are acting as a game character named ${
      agent.name
    }, who has the following personality:
Background: ${agent.personality.background}
age: ${agent.age}
Innate Tendencies: ${agent.personality.innateTendency.join(", ")}
Learned Tendencies: ${agent.personality.learnedTendency.join(", ")}
Current Goal: ${agent.personality.currentGoal}
Lifestyle: ${agent.personality.lifestyle}
Values: ${agent.personality.values.join(", ")}

The agent is having a conversation. Here is the relevant context: 
CONTEXT START
${context}
CONTEXT END

The character is having a conversation with another character. Here is the message they are responding to:
"${message}"

Given the character's personality and the context provided above, reply as the character.
`;

    // Set the OpenAI API parameters
    const parameters: CreateChatCompletionRequest = {
      model: this.model,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 100,
      n: 1,
    };

    try {
      // Call the OpenAI API
      const response = await this.openai.createChatCompletion(parameters);

      // Get the generated response from the API
      const reply = response.data.choices[0].message?.content.trim();

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
