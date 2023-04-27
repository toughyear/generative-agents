// AgentDisplay.tsx
import { Agent } from "generative-agents";
import React from "react";

type AgentDisplayProps = {
  agent: Agent | undefined;
};

const AgentDisplay: React.FC<AgentDisplayProps> = ({ agent }) => {
  if (!agent) {
    return null;
  }

  return (
    <div className='p-4 shadow-lg bg-white rounded-lg mt-5'>
      <h2 className='text-xl font-bold mb-2'>
        Agent Details: {agent.action.status}
      </h2>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <p>
            <strong>ID:</strong> {agent.id}
          </p>
          <p>
            <strong>Name:</strong> {agent.name}
          </p>
          <p>
            <strong>Age:</strong> {agent.age}
          </p>
          <p>
            <strong>Latest Plan Iteration:</strong> {agent.latestPlanIteration}
          </p>
        </div>
        <div>
          <p>
            <strong>Visual Range:</strong> {agent.settings.visualRange} : what
            all things agent can perceive
          </p>
          <p>
            <strong>Attention:</strong> {agent.settings.attention} : how much
            objects are sent to memory stream
          </p>
          <p>
            <strong>Retention:</strong> {agent.settings.retention} : decaying
            factor and retrieval
          </p>
        </div>
      </div>
      <div className='mt-4'>
        <h3 className='text-lg font-bold mb-2'>Personality</h3>
        <p>
          <strong>Background:</strong> {agent.personality.background}
        </p>
        <p>
          <strong>Current Goal:</strong> {agent.personality.currentGoal}
        </p>
        <p>
          <strong>Lifestyle:</strong> {agent.personality.lifestyle}
        </p>
        <p>
          <strong>Innate Tendencies:</strong>{" "}
          {agent.personality.innateTendency.join(", ")}
        </p>
        <p>
          <strong>Learned Tendencies:</strong>{" "}
          {agent.personality.learnedTendency.join(", ")}
        </p>
        <p>
          <strong>Values:</strong> {agent.personality.values.join(", ")}
        </p>
      </div>
    </div>
  );
};

export default AgentDisplay;
