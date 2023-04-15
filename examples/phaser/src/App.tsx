import React from "react";
import "./App.css";
import PhaserGame from "./phaserGame";
import { Agent } from "generative-agents";

function App() {
  const agent = new Agent("id_1", "Buri Buri Zaemon", 24, {
    background: "A Samurai",
    currentGoal: "slay the dragon",
    innateTendency: ["brave", "rude", "lonewolf"],
    learnedTendency: ["swordsmanship", "archery", "fishing"],
    lifestyle: "wanders around the forest of Tsurugi",
    values: ["honor", "loyalty", "justice"],
  });

  console.log("agent", agent);

  return (
    <div className='p-5 overflow-scroll'>
      <PhaserGame />
    </div>
  );
}

export default App;
