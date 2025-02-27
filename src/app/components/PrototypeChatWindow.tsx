"use client";

import React, { useState } from "react";

const STATIC_MESSAGES = [
  {
    id: "1",
    sender: "John",
    content: "Hey team - is the meeting still on today?",
    time: "11:46 PM",
    isOwn: false
  },
  {
    id: "2",
    sender: "Sarah",
    content: "Yes, starting in 30 minutes!",
    time: "11:47 PM",
    isOwn: false
  },
  {
    id: "3",
    sender: "Ryan",
    content: "Thanks for confirming, I'll be there.",
    time: "11:48 PM",
    isOwn: true
  }
];

export default function PrototypeChatWindow() {
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState(STATIC_MESSAGES);

  const handleSend = () => {
    if (chatInput.trim()) {
      const newMessage = {
        id: String(messages.length + 1),
        sender: "Ryan",
        content: chatInput,
        time: new Date().toLocaleTimeString([], { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
        isOwn: true
      };
      setMessages([...messages, newMessage]);
      setChatInput("");
    }
  };

  return (
    <main className="flex-1 flex flex-col bg-white">
      {/* Channel Header */}
      <header className="px-4 py-2 border-b border-gray-200">
        <div className="font-semibold"># product</div>
        <div className="text-sm text-gray-500">For all product-related discussions.</div>
      </header>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
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
        ))}
      </div>

      {/* Chat Input */}
      <div className="border-t border-gray-200 p-2 flex items-center">
        <input
          className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="text"
          placeholder="Type a message..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
        />
        <button
          onClick={handleSend}
          className="ml-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Send
        </button>
      </div>
    </main>
  );
} 