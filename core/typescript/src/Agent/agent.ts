import {
  Memory,
  MemoryCount,
  MemoryType,
  Observation,
  Reflection,
} from "../interface";
import { Engine } from "../Engine/engine";
import { dateToString } from "../utils/dateToString";
import { updateLocalStorageWithMemory } from "../utils/updateLocalStorageWithMemory";
import { nanoid } from "nanoid";

export class Agent {
  // Id to uniquely identify the agent. This is something the user should not care about and we would generate this whenever a new agent is initalised.
  id: string;

  // Model responsible for handling agent responses.
  engine: Engine;

  // Description about the agent. Keeping it as string for now will see how it's going.
  description: string;

  // Core of the agent which stores it's memories this will evolve to do a lot of things later.
  memoryStream: Memory[];

  // TODO: Move this to state later on.
  importanceScoreSumSinceLastPurge: number;

  constructor(id: string, engine: Engine, description: string) {
    this.id = id;
    this.engine = engine;

    // Check everytime if the memory with the associated agent id exists in the database or localstorage for now.
    this.memoryStream = localStorage.getItem(id)
      ? JSON.parse(localStorage.getItem(id) as string)
      : [];
    this.importanceScoreSumSinceLastPurge = 0;
    this.description = description;
  }

  // Add a observation to the agents memory stream.
  observe = async (description: string) => {
    const importance = await this.engine.getImportanceScore(description);
    const embedding = await this.engine.createEmbedding(description);

    const memory: Observation = {
      id: nanoid(),
      createdAt: dateToString(new Date()),
      description,
      importance,
      latestAccess: dateToString(new Date()),
      embedding,
      type: MemoryType.OBSERVATION,
    };

    // Add memory stream to local storage for now later replace the logic with data base code later.
    this.memoryStream = updateLocalStorageWithMemory({ id: this.id, memory });
    this.importanceScoreSumSinceLastPurge += importance;
  };

  // Reflect on the memory periodically.
  reflect = async () => {
    // Get the latest 100 Memories.
    const memories = this.memoryStream.slice(-100);

    // convert to a description string
    const description = memories.map((memory) => memory.description).join("\n");

    // get 5 top-level questions
    const questions = await this.engine.getSalientQuestions(description, 5);

    // for each relevant question, find the top closest memories using the retrieval score
    const currentTime = new Date();

    for (const question of questions) {
      const queryEmbedding = await this.engine.createEmbedding(question);
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
        id: nanoid(),
        createdAt: dateToString(currentTime),
        description: question,
        importance,
        latestAccess: dateToString(currentTime),
        embedding: queryEmbedding,
        type: MemoryType.REFLECTION,
        evidence: topMemories.map((memory) => memory.id),
      };

      // Update other states
      this.memoryStream = updateLocalStorageWithMemory({
        memory: reflection,
        id: this.id,
      });
    }

    // purge importance score sum
    this.importanceScoreSumSinceLastPurge = 0;
  };

  // Reply based on the current message and the memory stream accquired.
  conversation = async (
    message: string,
    /** Think: LLM's are always designed to have an output but in case of agent there might be some questions it would not want to answer how to think about that have some importance threshold for a question as well? */
    /** One of the participants would always be the agent and in case of conversational bots only would be the user */
    participants: string[] = ["user", "agent"]
    // Should the participants list be associated with an id? How do we uniquely identify the agent and the user?
  ): Promise<string> => {
    const memories = this.memoryStream.slice(-100);

    // Convert memories to a context string
    const context = memories.map((memory) => memory.description).join("\n");

    // Call the engine's reply method with the given message and context
    const reply = await this.engine.reply(message, this, context);

    const memoryDescription = `A converstion between ${participants.join(", ")}.
      They said: ${message}
      You replied: ${reply}
    `;

    // add reply to memory stream
    this.memoryStream = updateLocalStorageWithMemory({
      id: this.id,
      memory: {
        id: nanoid(),
        createdAt: dateToString(new Date()),
        description: memoryDescription,
        type: MemoryType.CONVERSATION,
        embedding: await this.engine.createEmbedding(reply),
        importance: await this.engine.getImportanceScore(reply),
        latestAccess: dateToString(new Date()),
        participants: participants,
      },
    });

    // Return the generated reply
    return reply;
  };
}
