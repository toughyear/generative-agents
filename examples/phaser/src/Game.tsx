import React, { useRef, useState } from "react";
import PhaserGame from "./phaserGame";
import { Agent, AgentEngine, buildSpatialWorld } from "generative-agents";

import { agentsData } from "./data/agents";
import AgentDisplay from "./AgentDisplay";
import { locations } from "./data/world";

interface Props {
  openaiKey: string;
}

function Game(props: Props) {
  const { openaiKey } = props;

  const engine = useRef(new AgentEngine(openaiKey)).current;

  const world = buildSpatialWorld(locations);

  const agents: Agent[] = useRef(
    agentsData.map(
      (agent) =>
        new Agent(
          engine,
          agent.id,
          agent.name,
          agent.age,
          { ...agent },
          undefined,
          world,
          agent.startLocation
        )
    )
  ).current;

  const [selectedAgentIndex, setSelectedAgentIndex] = useState(0);

  const nextAgent = () => {
    setSelectedAgentIndex((prevIndex) => (prevIndex + 1) % agents.length);
  };

  const prevAgent = () => {
    setSelectedAgentIndex(
      (prevIndex) => (prevIndex - 1 + agents.length) % agents.length
    );
  };

  return (
    <div className='p-5 overflow-scroll bg-gray-50'>
      <AgentDisplay agent={agents[selectedAgentIndex]} />
      <div className='my-2'>
        <button
          onClick={prevAgent}
          className='bg-black text-white font-bold py-2 px-4  hover:bg-gray-800 mr-2 transition duration-300'
        >
          &lt; Previous
        </button>
        <button
          onClick={nextAgent}
          className='bg-black text-white font-bold py-2 px-4  hover:bg-gray-800 mr-2 transition duration-300'
        >
          Next &gt;
        </button>
        <button
          onClick={nextAgent}
          className='bg-green-500 text-white font-bold py-2 px-4  hover:bg-green-600 mr-2 transition duration-300'
        >
          Chat
        </button>
      </div>
      <PhaserGame agents={[agents[selectedAgentIndex]]} />
    </div>
  );
}

export default Game;
