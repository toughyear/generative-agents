export type AgentPersonality = {
  background: string;
  innateTendency: string[];
  learnedTendency: string[];
  currentGoal: string;
  lifestyle: string;
  values: string[];
};

export type AgentSettings = {
  visualRange: number;
  attention: number;
  retention: number;
};

export type Action = {
  status: string;
  emoji: string;
};

export enum MemoryType {
  OBSERVATION = "OBSERVATION",
  REFLECTION = "REFLECTION",
  PLAN = "PLAN",
  CONVERSATION = "CONVERSATION",
}

export interface BaseMemory {
  id: string;
  createdAt: string;
  description: string;
  importance: number;
  latestAccess: string;
  embedding: number[];
}

export interface Observation extends BaseMemory {
  type: MemoryType.OBSERVATION;
}

export interface Reflection extends BaseMemory {
  type: MemoryType.REFLECTION;
  evidence: string[];
}

export interface Plan extends BaseMemory {
  type: MemoryType.PLAN;
  iteration: number;
  granularity: "DAY" | "HOUR" | "MINUTE";
  start: number;
  end: number;
  parent: string;
}

export interface Conversation extends BaseMemory {
  type: MemoryType.CONVERSATION;
}

export type Memory = Observation | Reflection | Plan | Conversation;
