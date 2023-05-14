import React, { useRef, useState } from "react";
import PhaserGame from "./phaserGame";
import { Agent, AgentEngine, buildSpatialWorld } from "generative-agents";

import { agentsData } from "./data/agents";
import AgentDisplay from "./AgentDisplay";
import { locations } from "./data/world";
import AgentChat from "./AgentChat";
import NotificationModal from "./NotificationModal";

interface Props {
  openaiKey: string;
}

function Game(props: Props) {
  const { openaiKey } = props;
  const [showNotification, setShowNotification] = useState(true);

  const handleCloseNotification = () => {
    setShowNotification(false);
  };

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
  const [showChat, setShowChat] = useState(false);

  const nextAgent = () => {
    setSelectedAgentIndex((prevIndex) => (prevIndex + 1) % agents.length);
  };

  const prevAgent = () => {
    setSelectedAgentIndex(
      (prevIndex) => (prevIndex - 1 + agents.length) % agents.length
    );
  };

  return (
    <div className='p-5 overflow-scroll bg-gray-50 relative'>
      <AgentDisplay agent={agents[selectedAgentIndex]} />
      {showNotification && (
        <NotificationModal
          message='All the agents are sharing the same cached plan for the day because of the rate limiting by OpenAI. We are working on a long-term fix.'
          onClose={handleCloseNotification}
        />
      )}
      {showChat && (
        <AgentChat
          agent={agents[selectedAgentIndex]}
          closeChat={() => setShowChat(false)}
        />
      )}
      <div className='my-2'>
        <button
          onClick={prevAgent}
          className='bg-black text-white font-bold py-2 px-4 rounded-md  hover:bg-gray-800 mr-2 transition duration-300'
        >
          &lt; Previous
        </button>
        <button
          onClick={nextAgent}
          className='bg-black text-white font-bold py-2 px-4 rounded-md  hover:bg-gray-800 mr-2 transition duration-300'
        >
          Next &gt;
        </button>
        <button
          onClick={() => setShowChat((prev) => !prev)}
          className='bg-[#f8d7af] text-[#5F472B] font-medium rounded-md py-2 px-4  hover:bg-[#f9dcb7] mr-2 transition duration-300'
        >
          Chat
        </button>
      </div>
      <PhaserGame agents={agents} />
    </div>
  );
}

export default Game;
