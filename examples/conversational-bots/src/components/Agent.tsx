import { Agent, Engine } from "generative-agents";
import { useState } from "react";

export interface AgentInterface {
  id: string;
  engine: Engine;
  description: string;
  imageSrc: string;
}

const AgentComponent = ({
  id,
  engine,
  description,
  imageSrc,
}: AgentInterface) => {
  const [chat, setChat] = useState(false);

  const agent = new Agent(id, engine, description);
  return (
    <div className="agent">
      <img src={imageSrc} alt="Agent" width={"120px"} height={"120px"} />
      <div>{description}</div>
      <button className="agent-chat-button" onClick={() => setChat(!chat)}>
        Chat
      </button>
      {chat && <div className="chat-container">HEY YEAH</div>}
    </div>
  );
};

export default AgentComponent;
