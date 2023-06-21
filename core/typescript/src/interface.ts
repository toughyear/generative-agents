import { CreateChatCompletionRequest, OpenAIApi } from "openai";

export enum MemoryType {
  PLAN = "PLAN",

  // Only supporting this for now will extend to the above types soon
  CONVERSATION = "CONVERSATION",
  OBSERVATION = "OBSERVATION",
  REFLECTION = "REFLECTION",
}

export interface BaseMemory {
  id: string;
  createdAt: string;
  description: string;
  importance: number;
  latestAccess: string;
  embedding: number[];
}

export interface Conversation extends BaseMemory {
  type: MemoryType.CONVERSATION;
  participants: string[];
}

export interface Observation extends BaseMemory {
  type: MemoryType.OBSERVATION;
}

export interface Reflection extends BaseMemory {
  type: MemoryType.REFLECTION;
  evidence: string[];
}

export type Memory = Observation | Conversation | Reflection;

export enum ModelName {
  OPEN_AI = "gpt-3.5-turbo",
}

export type ModelInstance = OpenAIApi;

export interface OpenAIModelOptions {
  parameters: CreateChatCompletionRequest;
}

export interface MemoryCount {
  observation: number;
  reflection: number;
  conversation: number;
}

export type ModelOptions = OpenAIModelOptions;
