import React, { useRef } from "react";
import "./App.css";
import PhaserGame from "./phaserGame";
import { Agent, AgentEngine } from "generative-agents";

import { agentsData } from "./data/agents";
import AgentDisplay from "./AgentDisplay";

function App() {
  const engine = useRef(
    new AgentEngine(process.env.REACT_APP_OPENAI_API_KEY ?? "")
  ).current;

  const agents: Agent[] = useRef(
    agentsData.map(
      (agent) =>
        new Agent(engine, agent.id, agent.name, agent.age, { ...agent })
    )
  ).current;

  return (
    <div className='p-5 overflow-scroll bg-gray-50'>
      <AgentDisplay agent={agents[0]} />
      <PhaserGame agents={agents} />
    </div>
  );
}

export default App;
