import React, { useState, useEffect } from "react";
import "./App.css";
import Game from "./Game";

function App() {
  const openaiKeyFromEnv = process.env.REACT_APP_OPENAI_API_KEY;

  const [openaiKey, setOpenaiKey] = useState(openaiKeyFromEnv);
  const [settingKey, setSettingKey] = useState(false);

  // first time, if no key, set settingKey to true
  useEffect(() => {
    if (!openaiKey) {
      setSettingKey(true);
    }
  }, []);

  if (!openaiKey || settingKey) {
    return (
      <div className='p-5 overflow-scroll bg-gray-50'>
        <div className='flex flex-col items-center justify-center h-screen'>
          <div className='flex flex-col items-center justify-center'>
            <h1 className='text-3xl font-bold text-gray-900'>
              Welcome to Generative Agents
            </h1>
            <p className='mt-2 text-xl text-gray-600'>
              Please enter your OpenAI API key to get started.
            </p>
          </div>
          <div className='mt-5'>
            <input
              className='px-4 py-2 text-xl border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent'
              type='text'
              placeholder='OpenAI API Key'
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
            />
            <button
              className='px-4 py-2 ml-2 text-xl font-bold text-white bg-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent'
              onClick={() => setSettingKey(false)}
            >
              Set Key
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <Game openaiKey={openaiKey} />;
}

export default App;
