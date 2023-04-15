import React from "react";
import "./App.css";
import PhaserGame from "./phaserGame";
import { Agent, AgentEngine } from "generative-agents";

function App() {
  const ae = new AgentEngine(process.env.REACT_APP_OPENAI_API_KEY ?? "");

  const agent = new Agent(ae, "id_1", "Buri Buri Zaemon", 24, {
    background: "A Samurai",
    currentGoal: "slay the dragon",
    innateTendency: ["brave", "rude", "lonewolf"],
    learnedTendency: ["swordsmanship", "archery", "fishing"],
    lifestyle: "wanders around the forest of Tsurugi",
    values: ["honor", "loyalty", "justice"],
  });

  console.log("agent", agent);
  const handleObservation = async () => {
    const observation = "buying grocery from Vilma's shop.";
    await agent.observe(observation);
    console.log("agent", agent);
  };

  return (
    <div className='p-5 overflow-scroll'>
      <button
        className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
        onClick={handleObservation}
      >
        Add observation to memory
      </button>

      <PhaserGame />
    </div>
  );
}

export default App;
