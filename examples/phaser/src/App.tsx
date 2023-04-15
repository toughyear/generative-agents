import React from "react";
import "./App.css";
import PhaserGame from "./phaserGame";
import { Agent, AgentEngine } from "generative-agents";

function App() {
  const agent = new Agent("id_1", "Buri Buri Zaemon", 24, {
    background: "A Samurai",
    currentGoal: "slay the dragon",
    innateTendency: ["brave", "rude", "lonewolf"],
    learnedTendency: ["swordsmanship", "archery", "fishing"],
    lifestyle: "wanders around the forest of Tsurugi",
    values: ["honor", "loyalty", "justice"],
  });

  const ae = new AgentEngine(process.env.REACT_APP_OPENAI_API_KEY ?? "");

  console.log("agent", agent);
  console.log(
    "imp score",
    ae.getImportanceScore("buying grocery from Vilma's shop.")
  );
  console.log("imp score 2", ae.getImportanceScore("asking my crush out"));
  console.log("embedding", ae.getEmbedding("asking my crush out"));

  return (
    <div className='p-5 overflow-scroll'>
      <PhaserGame />
    </div>
  );
}

export default App;
