import { EventEmitter } from "events";
import { AgentEngine } from "./engine";
import { dateToString } from "./formatters";
import {
  Action,
  AgentPersonality,
  AgentSettings,
  Memory,
  MemoryType,
  Observation,
  Plan,
  Reflection,
  World,
} from "./types";
import sampleAgentPlan from "./samplePlan.json";

export enum AgentEvents {
  TASK_FINISHED = "TASK_FINISHED",
}

export class Agent extends EventEmitter {
  engine: AgentEngine;
  id: string;
  name: string;
  age: number;

  personality: AgentPersonality;

  settings: AgentSettings;

  memoryStream: Memory[];

  memoryCount: {
    observation: number;
    reflection: number;
    conversation: number;
  };

  dayPlan: Plan[];

  importanceScoreSumSinceLastPurge: number;

  action: Action;

  world: World;
  location: string;

  constructor(
    engine: AgentEngine,
    id: string,
    name: string,
    age: number,
    personality: AgentPersonality,
    settings: AgentSettings = {
      attention: 8,
      retention: 8,
      visualRange: 8,
    },
    world: World = {},
    location: string = ""
  ) {
    super();

    this.engine = engine;
    this.id = id;
    this.name = name;
    this.age = age;
    this.personality = personality;
    this.settings = settings;
    this.memoryStream = [];
    this.memoryCount = {
      observation: 0,
      reflection: 0,
      conversation: 0,
    };
    this.dayPlan = [];
    this.importanceScoreSumSinceLastPurge = 0;
    this.action = {
      status: "sleeping",
      emoji: "😴",
    };
    this.world = world;
    this.location = location;
  }

  // add Observation
  observe = async (description: string) => {
    const importance = await this.engine.getImportanceScore(description);
    const embedding = await this.engine.getEmbedding(description);
    const memory: Observation = {
      id: `obs_${this.memoryCount.observation + 1}`,
      createdAt: dateToString(new Date()),
      description,
      importance,
      latestAccess: dateToString(new Date()),
      embedding,
      type: MemoryType.OBSERVATION,
    };

    // update other states
    this.memoryStream.push(memory);
    this.memoryCount.observation += 1;
    this.importanceScoreSumSinceLastPurge += importance;
  };

  reflect = async () => {
    // get latest 100 memories
    const memories = this.memoryStream.slice(-100);

    // convert to a description string
    const description = memories.map((memory) => memory.description).join("\n");

    // get 5 top-level questions
    const questions = await this.engine.getSalientQuestions(description, 5);

    // for each relevant question, find the top closest memories using the retrieval score
    const currentTime = new Date();

    for (const question of questions) {
      const queryEmbedding = await this.engine.getEmbedding(question);
      const retrievalScores = await Promise.all(
        memories.map(async (memory) => ({
          memory,
          score: await this.engine.getRetrievalScore(
            memory.importance,
            queryEmbedding,
            memory.embedding,
            new Date(memory.latestAccess),
            currentTime
          ),
        }))
      );

      // Sort memories by retrieval score and take the top 3
      const topMemories = retrievalScores
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((item) => item.memory);

      // consider them retrieved, so update their latestAccess in the actual memory stream
      topMemories.forEach((memory) => {
        const index = this.memoryStream.findIndex(
          (item) => item.id === memory.id
        );
        this.memoryStream[index].latestAccess = dateToString(currentTime);
      });

      const importance = await this.engine.getImportanceScore(question);

      // Create a reflection for each relevant question and add evidence accordingly
      const reflection: Reflection = {
        id: `reflect_${this.memoryCount.reflection + 1}`,
        createdAt: dateToString(currentTime),
        description: question,
        importance,
        latestAccess: dateToString(currentTime),
        embedding: queryEmbedding,
        type: MemoryType.REFLECTION,
        evidence: topMemories.map((memory) => memory.id),
      };

      // Update other states
      this.memoryStream.push(reflection);
      this.memoryCount.reflection += 1;
    }

    // purge importance score sum
    this.importanceScoreSumSinceLastPurge = 0;
  };

  async createPlan(testing = false): Promise<void> {
    try {
      if (testing) {
        // Read from local JSON file
        this.dayPlan.push(...(sampleAgentPlan as Plan[]));
        // Execute the new plan
        await this.executeCurrentTask();

        return;
      }

      // API requests
      const dayPlan = await this.engine.getDayPlan(
        this.name,
        this.age,
        this.personality
      );

      for (const planItem of dayPlan) {
        const detailedPlan = await this.engine.decomposePlanItem(
          this.name,
          this.age,
          this.personality,
          dayPlan,
          dayPlan.indexOf(planItem)
        );

        // Convert the detailed plan to Plan memory objects
        const planMemories: Promise<Plan>[] = detailedPlan.map(
          async (planItem): Promise<Plan> => {
            const importance = await this.engine.getImportanceScore(
              planItem.description
            );
            const embedding = await this.engine.getEmbedding(
              planItem.description
            );

            return {
              id: `plan_${this.dayPlan.length + 1}`,
              createdAt: dateToString(new Date()),
              start: planItem.start,
              end: planItem.end,
              description: planItem.description,
              type: MemoryType.PLAN,
              embedding,
              importance,
              executed: false,
              latestAccess: dateToString(new Date()),
              granularity: "HOUR",
              parent: planItem.description,
            };
          }
        );

        // resolve the promises
        const resolvedPlanMemories = await Promise.all(planMemories);

        // Add the detailed plan to the agent's day plan
        this.dayPlan.push(...resolvedPlanMemories);
      }

      // Execute the new plan
      await this.executeCurrentTask();
    } catch (error) {
      console.error("Error creating plan:", error);
    }
  }

  executeCurrentTask = async () => {
    // Check if the agent has a plan
    const { dayPlan } = this;

    if (dayPlan.length === 0) {
      console.log("No plan found for the agent.");
      return;
    }

    // Find the first unexecuted plan
    const currentTask = dayPlan.find((plan) => !plan.executed);

    if (!currentTask) {
      console.log("No unexecuted task found for the agent.");
      return;
    }

    // Update action
    this.action = {
      status: currentTask.description,
      emoji: currentTask.description.split("|")[1].replace(" ", ""),
    };

    const taskDuration = currentTask.end - currentTask.start;

    console.log(
      `Agent ${this.name} is executing task: ${currentTask.description} for ${taskDuration}s`
    );

    // wait for the agent to execute the task
    await new Promise((resolve) => setTimeout(resolve, taskDuration * 1000));

    // Mark the task as executed
    currentTask.executed = true;

    // observe that the agent has executed the task
    this.observe(`executed task: ${currentTask.description}`);

    // Update location for next task
    const nextTask = dayPlan.find((plan) => !plan.executed);

    if (!nextTask) {
      // No more tasks left
      // notify the agent that it finished its current task
      this.emit(AgentEvents.TASK_FINISHED);
      return;
    }

    const nextLocation = await this.engine.findPreferredLocation(
      this.world,
      nextTask.description,
      this.location,
      `${this.name}, ${this.age}, ${this.personality.background}, ${this.personality.currentGoal}`
    );

    // update action status to next task
    this.action = {
      status: nextTask.description,
      emoji: nextTask.description.split("|")[1].replace(" ", ""),
    };

    console.log(`Agent ${this.name} should go to ${nextLocation}`);

    this.location = nextLocation;
    // notify the agent that it finished its current task
    this.emit(AgentEvents.TASK_FINISHED);
  };

  replyWithContext = async (
    message: string,
    participants: string[]
  ): Promise<string> => {
    // Get the top 5 memories from the memory stream
    const memories = this.memoryStream.slice(-100);

    // Convert memories to a context string
    const context = memories.map((memory) => memory.description).join("\n");

    // Call the engine's reply method with the given message and context
    const reply = await this.engine.reply(message, this, context);

    const memoryDescription = `This is beginning of a conversation with ${participants.join(
      ", "
    )}.
      They said: ${message}
      You replied: ${reply}
    `;

    // add reply to memory stream
    this.memoryStream.push({
      id: `conv_${this.memoryCount.conversation + 1}`,
      createdAt: dateToString(new Date()),
      description: memoryDescription,
      type: MemoryType.CONVERSATION,
      embedding: await this.engine.getEmbedding(reply),
      importance: await this.engine.getImportanceScore(reply),
      latestAccess: dateToString(new Date()),
      participants: participants,
    });

    // Return the generated reply
    return reply;
  };
}
