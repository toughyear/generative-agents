import { AgentEngine } from "./engine";
import { dateToString } from "./helpers";

type AgentPersonality = {
  background: string;
  innateTendency: string[];
  learnedTendency: string[];
  currentGoal: string;
  lifestyle: string;
  values: string[];
};

type AgentSettings = {
  visualRange: number;
  attention: number;
  retention: number;
};

type Action = {
  status: string;
  emoji: string[];
};

enum MemoryType {
  OBSERVATION = "OBSERVATION",
  REFLECTION = "REFLECTION",
  PLAN = "PLAN",
  CONVERSATION = "CONVERSATION",
}

interface BaseMemory {
  id: string;
  createdAt: string;
  description: string;
  importance: number;
  latestAccess: string;
  embedding: number[];
}

interface Observation extends BaseMemory {
  type: MemoryType.OBSERVATION;
}

interface Reflection extends BaseMemory {
  type: MemoryType.REFLECTION;
  evidence: string[];
}

interface Plan extends BaseMemory {
  type: MemoryType.PLAN;
  iteration: number;
  granularity: "DAY" | "HOUR" | "MINUTE";
  start: number;
  end: number;
  parent: string[];
}

interface Conversation extends BaseMemory {
  type: MemoryType.CONVERSATION;
}

type Memory = Observation | Reflection | Plan | Conversation;

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

  world: object;
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
    world: object = {},
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
    this.latestPlanIteration = 1;
    this.importanceScoreSumSinceLastPurge = 0;
    this.action = {
      status: "sleeping",
      emoji: ["😴"],
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
}
