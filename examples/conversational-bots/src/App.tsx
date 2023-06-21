import { Agent, Engine, Interface } from "generative-agents";
import "./App.css";
import { AgentList } from "./data/AgentList";
import AgentComponent from "./components/Agent";

function App() {
  const engine = new Engine(Interface.ModelName.OPEN_AI, "x");

  const agent = new Agent(
    "dexter",
    engine,
    "Hi, I am Dexter a passionate frontend developer who has a good eye for design. In my free time I listen to a lot of music and play football. Right now I am working on taking my life to the next level."
  );

  // const y = async () => {
  //   const x = await agent.replyWithContext("How old are you", ["user"]);
  //   console.log(x);
  // };
  // y();
  // agent.observe("Today was a good day");
  // agent.observe(
  //   "I have a meeting tomorrow at 12:30 am at the leela palace please remaind me"
  // );
  // agent.observe("I made a new friend today his name is Prairna");
  // agent.observe("I have do laundry tomorrow");
  // agent.observe("Ok bye");
  // console.log(agent.memoryStream, "xxx");
  // try {
  //   const y = async () => {
  //     const x = await agent.conversation(
  //       "Are you going to leela place tomorrow?",
  //       ["user"]
  //     );
  //     console.log(x);
  //   };
  //   y();
  // } catch {
  //   console.log("FUCK you");
  // }
  return (
    <div className="app-root">
      <div className="agent-container">
        {AgentList.map((a) => {
          return (
            <AgentComponent
              engine={engine}
              description={a.description}
              id={a.id}
              key={a.id}
              imageSrc={a.imageSrc}
            />
          );
        })}
      </div>
    </div>
  );
}

export default App;
