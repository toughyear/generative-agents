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

export class Agent {
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
    plan: number;
    conversation: number;
  };

  latestPlanIteration: number;

  importanceScoreSumSinceLastPurge: number;

  action: Action;

  world: World;
  location: string[];

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
    location: string[] = []
  ) {
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
      plan: 0,
      conversation: 0,
    };
    this.latestPlanIteration = 0;
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
        this.memoryStream.push(...(sampleAgentPlan as Plan[]));
        this.memoryCount.plan += sampleAgentPlan.length;

        // update latest plan iteration
        this.latestPlanIteration += 1;
        // Execute the new plan
        await this.executePlan();

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

            // update memory count
            this.memoryCount.plan += 1;

            return {
              id: `plan_${this.memoryCount.plan}`,
              createdAt: dateToString(new Date()),
              start: planItem.start,
              end: planItem.end,
              description: planItem.description,
              type: MemoryType.PLAN,
              embedding,
              importance,
              latestAccess: dateToString(new Date()),
              granularity: "HOUR",
              iteration: this.latestPlanIteration + 1,
              parent: planItem.description,
            };
          }
        );

        // resolve the promises
        const resolvedPlanMemories = await Promise.all(planMemories);

        // Add the detailed plan to the memory stream
        this.memoryStream.push(...resolvedPlanMemories);
      }

      // update latest plan iteration
      this.latestPlanIteration += 1;
      // Execute the new plan
      await this.executePlan();
    } catch (error) {
      console.error("Error creating plan:", error);
    }
  }

  executePlan = async () => {
    // Check if the agent has a plan
    const currentPlans = this.memoryStream.filter(
      (memory) =>
        memory.type === MemoryType.PLAN &&
        (memory as Plan).iteration === this.latestPlanIteration
    ) as Plan[];

    if (currentPlans.length === 0) {
      console.log("No plan found for the agent.");
      return;
    }

    // Execute the plan
    for (const plan of currentPlans) {
      this.action = {
        status: plan.description,
        emoji: plan.description.split("|")[1].replace(" ", ""),
      };

      const planDuration = plan.end - plan.start;

      console.log(`Executing plan: ${plan.description} for ${planDuration}s`);

      await new Promise((resolve) => setTimeout(resolve, planDuration * 1000));
    }
  };
}
