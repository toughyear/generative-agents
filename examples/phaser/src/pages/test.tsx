import React, { useRef } from "react";
import { Agent, AgentEngine } from "generative-agents";

interface Props {
  openaiKey: string;
}

function Test(props: Props) {
  const { openaiKey } = props;

  const engine = useRef(new AgentEngine(openaiKey)).current;

  const agent = useRef(
    new Agent(
      engine,
      "susan_miller",
      "Susan Miller",
      37,
      {
        background:
          "Runs Taiki seafood restaurant, which is close to her house, with her husband Thomas. Has a daughter Lucy and a son Mike, both go to college.",
        currentGoal: "Learn how to use the new cash register",
        innateTendency: ["Early Riser", "Hardworking", "Responsible"],
        learnedTendency: ["Hardworking", "Yoga", "Cooking"],
        lifestyle:
          "Wakes up 7 and practices yoga. Goes to work at 8:30. Works until 5:30. Goes home and cooks dinner. Goes to bed at 10.",
        values: ["Family", "Honesty"],
      },
      undefined,
      undefined,
      "susan_miller_bed"
    )
  ).current;

  return (
    <div className='flex flex-col'>
      <h1>Execute Engine Functions for testing</h1>
      <button
        onClick={async () => {
          console.time("createTaskList");
          const output = await engine.createTaskList(
            agent.name,
            agent.age,
            agent.personality
          );
          console.timeEnd("createTaskList");
          console.log(output);
        }}
        className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded self-start'
      >
        Create task list
      </button>
      <button
        onClick={async () => {
          console.time("createPlan");
          await agent.createPlan();
          console.timeEnd("createPlan");
          console.log(agent.dayPlan);
        }}
        className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded self-start mt-10'
      >
        populate agent with tasks
      </button>
    </div>
  );
}

export default Test;
