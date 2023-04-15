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

  action: Action;

  world: object;
  location: string[];

  constructor(
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
    this.action = {
      status: "sleeping",
      emoji: ["😴"],
    };
    this.world = world;
    this.location = location;
  }
}
