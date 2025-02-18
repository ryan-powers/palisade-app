"use client";

import { useState } from "react";

export default function ChatPage() {
  // Example states for messages, input, etc.
  const [messages, setMessages] = useState([
    { id: 1, user: "Alice", text: "Hello everyone!" },
    { id: 2, user: "Bob", text: "Hey Alice! Good to see you." },
  ]);
  const [chatInput, setChatInput] = useState("");

  // Pretend send message
  const sendMessage = () => {
    if (!chatInput.trim()) return;
    const newMsg = {
      id: messages.length + 1,
      user: "You", // This would be the logged-in user
      text: chatInput.trim(),
    };
    setMessages([...messages, newMsg]);
    setChatInput("");
  };

  return (
    <div className="h-screen w-screen flex">
      {/* Sidebar */}
      <aside className="flex flex-col w-64 bg-gray-800 text-white">
        <div className="p-4 text-2xl font-bold border-b border-gray-700">
          Palisade
        </div>

        <nav className="flex-1 overflow-y-auto">
          {/* Channels */}
          <div className="mt-4 px-4 text-sm font-semibold text-gray-400 uppercase">
            Channels
          </div>
          <ul className="space-y-1 mt-2">
            <li className="px-4 py-1 hover:bg-gray-700 transition-colors cursor-pointer"># general</li>
            <li className="px-4 py-1 hover:bg-gray-700 transition-colors cursor-pointer"># random</li>
          </ul>

          {/* Direct Messages */}
          <div className="mt-6 px-4 text-sm font-semibold text-gray-400 uppercase">
            Direct Messages
          </div>
          <ul className="space-y-1 mt-2">
            <li className="px-4 py-1 hover:bg-gray-700 transition-colors cursor-pointer">@ Alice</li>
            <li className="px-4 py-1 hover:bg-gray-700 transition-colors cursor-pointer">@ Bob</li>
          </ul>
        </nav>
      </aside>

      {/* Main Chat Section */}
      <main className="flex-1 flex flex-col bg-white">
        {/* Channel Header */}
        <header className="px-4 py-2 border-b border-gray-200 flex items-center justify-between">
          <div className="font-semibold"># general</div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.map((msg) => (
            <div key={msg.id} className="flex items-center space-x-2">
              <span className="font-bold text-blue-600">{msg.user}:</span>
              <span>{msg.text}</span>
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
              if (e.key === "Enter") sendMessage();
            }}
          />
          <button
            onClick={sendMessage}
            className="ml-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Send
          </button>
        </div>
      </main>

      {/* Profile Icon (bottom-right corner) */}
      <div className="absolute bottom-3 left-3">
        <div className="w-10 h-10 rounded-full bg-gray-300 hover:bg-gray-400 flex items-center justify-center cursor-pointer">
          <span className="text-sm font-semibold text-gray-700">RP</span>
        </div>
      </div>
    </div>
  );
}
