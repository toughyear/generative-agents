# Generative Agents 🔮

A Simple Framework for working with Generative Agents powered by LLMs.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)![Twitter Follow](https://img.shields.io/twitter/follow/toughyear?style=social)](https://twitter.com/toughyear) [![](https://dcbadge.vercel.app/api/server/9NjpMXtVaW?compact=true&style=flat)](https://discord.gg/9NjpMXtVaW)

![basic demo](https://raw.githubusercontent.com/toughyear/blog-uploads/main/uploads/ga/generative_agents_basic_demo.gif)

## What are Generative Agents? ⚡️

These agents act as drop-in replacement for humans in online sandbox environments.

You can use them to:

- **simulate** complex social behavior in a sandbox environment
- create **Dynamic NPCs** for your games
- create **Autonomous Agents** that acquire new skills while interacting with the environment like Minecraft

## See it in the wild 🐪

![basic demo](https://raw.githubusercontent.com/toughyear/blog-uploads/main/uploads/demo_2.gif)
We created a sandbox simulation based on the alpha version of the agent architecture. Check out [the live demo](http://demo.multimode.run/).

Or check out the [demo video](https://www.youtube.com/watch?v=hU4fJ1Gwxag) on Youtube.

> ⚠️ OpenAI APIs can be slow and unstable at times. Check the network tab to see if the requests are failing or getting rate-limited. We are currently working on a more stable solution.

## Usage ⚙️

We have started with a Typescript implementation of the agent architecture and plan to add more languages in the future.

You can create a sample agent with the following code:

```ts
import { Agent, AgentEngine } from "generative-agents";

// create an engine that manages the network requests and overall state of the world
const engine = new AgentEngine(openaiKey);

// create an agent
const agent = new Agent(
  engine,
  "thomas_miller", // agent id
  "Thomas Miller", // agent's name
  42, // agent's age
  {
    background:
      "Runs Taiki seafood restaurant with his wife Susan. Has a daughter Lucy and a son Mike.",
    currentGoal:
      "Creating a new speciality dish for restaurant and getting a new chef.",
    innateTendency: ["Curious", "Adventurous", "Optimistic"],
    learnedTendency: ["Hardworking", "Responsible", "Diligent"],
    lifestyle:
      "goes to work, comes home, spends time with family, goes to bed early",
    values: ["Family", "Honesty", "Integrity"],
  }
);
```

Once created the agent has following methods available:

```ts
// stream relevant observations to the agents to make the world believable
observe: (description: string) => Promise<void>;
// agents auto reflect on their observations and update their internal state after crossing certain thresholds
reflect: () => Promise<void>;
// at initialization agents create a plan for the day
createPlan(testing?: boolean): Promise<void>;
// execute the current task in the plan
executeCurrentTask: () => Promise<void>;
// agents can chat with each other and external users like humans
replyWithContext: (message: string, participants: string[]) => Promise<string>;
```

### Repo structure 📚

The [repository](https://github.com/toughyear/generative-agents) is divided into two parts -

```
/core/[language]
/examples/[type]
```

`/core` contains the core implementation of the agent architecture. It is divided into language specific folders. Currently, we only have a Typescript implementation.

`/examples` contains examples of how to use the core implementation. Currently, we have an example of a React + Phaser implementation of the agent architecture in a 2d top down pixelart game.

We look forward to adding more examples in the future. Contributions are welcome!

## Contributing 🤝 💪

Yes! We need you! The current implementation is experimental. If you are interested, we would love to plan the future of this project and build with you all. It will be interesting to see what we all can build with it.

Next up on the roadmap is to add more languages and examples. We are also working on a more stable solution for the OpenAI API. We also are planning to work on generic **Minecraft agent** that can acquire new skills while interacting with the environment. Help us build it!

Join the development on [Discord](https://discord.gg/9NjpMXtVaW).

If you have any ideas or suggestions, please open an issue or a pull request.

Twitter DMs open [here](https://twitter.com/toughyear).

_We are so back! Let's build the matrix together!_

## Notice

For the ease of access, we have put our OpenAI key in the code. Hopefully, we will not see any abuse. If you are planning to use this code for your own project, we request you to create your own OpenAI key and use it instead.
