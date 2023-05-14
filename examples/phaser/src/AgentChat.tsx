import React, { useState } from "react";
import { Agent } from "generative-agents";
import { XCircle } from "lucide-react";

type AgentChatProps = {
  agent: Agent | undefined;
  closeChat: () => void;
};

type Message = {
  sender: "user" | "agent";
  content: string;
};

const AgentChat: React.FC<AgentChatProps> = ({ agent, closeChat }) => {
  const [messages, setMessages] = useState<Message[]>([
    { sender: "agent", content: "Welcome! How can I help you today?" },
    { sender: "user", content: "Hi" },
    {
      sender: "user",
      content: "I am a reporter and wanted to talk to you about a few things.",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isAgentReplying, setIsAgentReplying] = useState(false);

  const handleSendMessage = async () => {
    if (inputMessage.trim()) {
      setMessages([
        ...messages,
        { sender: "user", content: inputMessage.trim() },
      ]);
      setInputMessage("");

      if (agent) {
        setIsAgentReplying(true);

        const agentReply = await agent.replyWithContext(inputMessage.trim(), [
          "user",
        ]);
        setIsAgentReplying(false);
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "agent", content: agentReply },
        ]);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className='fixed top-0 right-0 m-4 w-1/3 h-[calc(100vh-2rem)] bg-white z-[1] rounded-lg shadow-md flex flex-col'>
      <div className='px-2 py-4'>
        <p className='text-2xl font-bold flex items-center'>
          {agent?.name}
          <span className='inline-block align-middle ml-2 bg-green-500 rounded-full w-2 h-2'></span>
          <XCircle
            className='ml-auto cursor-pointer text-gray-400 hover:text-gray-500 transition duration-300'
            onClick={closeChat}
          />
        </p>
        <p className='text-sm text-gray-500 mb-4'>
          This is your conversation with {agent?.name}{" "}
        </p>
      </div>
      <div className='flex-1 overflow-y-auto px-2 font-medium'>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-2 flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <p
              className={`rounded-lg  px-3 py-2 ${
                message.sender === "user"
                  ? "bg-[#F9E4CB] text-[#5F472B]"
                  : "bg-gray-300 text-gray-800"
              }`}
            >
              {message.content}
            </p>
          </div>
        ))}
        {isAgentReplying && (
          <div className='flex justify-start mb-2'>
            <style>
              {`
          .dot {
            animation: blink 1.4s linear infinite;
          }

          .dot:nth-child(2) {
            animation-delay: 0.2s;
          }

          .dot:nth-child(3) {
            animation-delay: 0.4s;
          }

          @keyframes blink {
            0% {
              opacity: 0.2;
            }
            20% {
              opacity: 1;
            }
            100% {
              opacity: 0.2;
            }
          }
        `}
            </style>
            <span className='dot bg-gray-500 inline-block mx-1 w-2 h-2 rounded-full'></span>
            <span className='dot bg-gray-500 inline-block mx-1 w-2 h-2 rounded-full'></span>
            <span className='dot bg-gray-500 inline-block mx-1 w-2 h-2 rounded-full'></span>
          </div>
        )}
      </div>
      <div className='mt-4 px-2 py-4'>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <div className='flex'>
            <input
              type='text'
              className='border border-gray-300 rounded-l-lg w-full p-2'
              placeholder='Type your message...'
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                e.stopPropagation();
                handleKeyPress(e);
              }}
            />
            <button
              type='submit'
              className='bg-[#F9E4CB] text-[#5F472B] font-medium rounded-r-lg px-4'
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgentChat;
