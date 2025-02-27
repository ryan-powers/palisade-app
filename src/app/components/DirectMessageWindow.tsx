"use client";

import React from "react";
import { FaCircle } from "react-icons/fa";

interface Message {
  id: string;
  sender: string;
  content: string;
  time: string;
  isOwn: boolean;
}

interface DirectMessageWindowProps {
  userName: string;
  isOnline: boolean;
  isOwnSpace?: boolean;
}

export default function DirectMessageWindow({ userName, isOnline, isOwnSpace }: DirectMessageWindowProps) {
  const [inputMessage, setInputMessage] = React.useState("");
  const [messages, setMessages] = React.useState<Message[]>([]);

  const handleSend = () => {
    if (inputMessage.trim()) {
      const newMessage = {
        id: String(messages.length + 1),
        sender: "Ryan",
        content: inputMessage,
        time: new Date().toLocaleTimeString([], { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
        isOwn: true
      };
      setMessages([...messages, newMessage]);
      setInputMessage("");
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-800">
      {/* Chat Header */}
      <header className="px-4 py-3 border-b border-gray-700 flex items-center">
        <div className="flex items-center">
          <div className="relative mr-3">
            <div className="w-8 h-8 bg-gray-600 rounded-sm flex items-center justify-center text-white font-medium">
              {userName[0]}
            </div>
            <FaCircle 
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 
                ${isOnline ? 'text-green-500' : 'text-gray-500'} 
                bg-gray-800 rounded-full p-0.5`}
            />
          </div>
          <div>
            <h2 className="text-white font-medium">{userName}</h2>
            <p className="text-sm text-gray-400">
              {isOnline ? 'Active now' : 'Offline'}
            </p>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            {isOwnSpace ? (
              <>
                <div className="w-12 h-12 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                  <span className="text-2xl text-gray-400">R</span>
                </div>
                <h3 className="text-gray-900 font-medium mb-1">This is your space</h3>
                <p className="text-sm text-gray-500">
                  Draft messages, list your to-dos, or keep links handy.
                </p>
              </>
            ) : (
              <p className="mb-2">This is the beginning of your direct message history with {userName}</p>
            )}
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-2.5">
              <div className={`flex flex-col w-full max-w-[320px] leading-1.5 p-4 
                ${msg.isOwn 
                  ? 'bg-blue-500 ml-auto rounded-s-xl rounded-ee-xl' 
                  : 'bg-gray-100 rounded-e-xl rounded-es-xl'}`}>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <span className={`text-sm font-semibold ${msg.isOwn ? 'text-white' : 'text-gray-900'}`}>
                    {msg.sender}
                  </span>
                  <span className={`text-sm font-normal ${msg.isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                    {msg.time}
                  </span>
                </div>
                <p className={`text-sm font-normal ${msg.isOwn ? 'text-white' : 'text-gray-900'}`}>
                  {msg.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={`Message ${userName}`}
            className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
} 