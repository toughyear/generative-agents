import React, { useRef } from "react";
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

  return (
    <div className='p-5 overflow-scroll bg-gray-50'>
      <AgentDisplay agent={agents[0]} />
      <PhaserGame agents={agents.slice(0, 1)} />
    </div>
  );
}

export default Game;
