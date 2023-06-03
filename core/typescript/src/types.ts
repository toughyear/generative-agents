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

export interface World {
  [key: string]: World | number;
}

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
  /** Importance distinguishes mundane from core memories, by assigning a higher score to those memory objects that the agent believes to be importan */
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
  executed: boolean;
  start: number;
  end: number;
}

export interface Conversation extends BaseMemory {
  type: MemoryType.CONVERSATION;
  participants: string[];
}

export type Memory = Observation | Reflection | Plan | Conversation;
