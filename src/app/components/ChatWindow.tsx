"use client";

import React, { useEffect, useState } from "react";
import { useUserContext } from "../context/UserContext";

interface Message {
  id: string;
  senderId: string;
  content: string;
}

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  userId: string;
}

export default function ChatWindow({ messages, onSendMessage, userId }: ChatWindowProps) {
  const [chatInput, setChatInput] = useState("");
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (chatInput.trim()) {
      onSendMessage(chatInput);
      setChatInput("");
    }
  };

  return (
    <main className="flex-1 flex flex-col bg-white">
      {/* Channel Header */}
      <header className="px-4 py-2 border-b border-gray-200">
        <div className="font-semibold"># general</div>
        <div className="text-sm text-gray-500">Channel for all-team announcements and questions.</div>
      </header>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Static message from John */}
        <div className="flex items-start gap-2.5">
          <div className="flex flex-col w-full max-w-[320px] leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <span className="text-sm font-semibold text-gray-900">John</span>
              <span className="text-sm font-normal text-gray-500">11:46 PM</span>
            </div>
            <p className="text-sm font-normal text-gray-900">Hey team - is the meeting still on today?</p>
          </div>
        </div>

        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            isOwnMessage={msg.senderId === userId}
          />
        ))}
        <div ref={messagesEndRef} />
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

function ChatMessage({ message, isOwnMessage }: { message: Message; isOwnMessage: boolean }) {
  const { userId, displayName } = useUserContext();
  const senderDisplayName = message.senderId === userId 
    ? (displayName || 'You')
    : message.senderId.slice(0, 8);
  
  return (
    <div className="flex items-start gap-2.5">
      <div className={`flex flex-col w-full max-w-[320px] leading-1.5 p-4 
        ${isOwnMessage 
          ? 'bg-blue-500 ml-auto rounded-s-xl rounded-ee-xl' 
          : 'bg-gray-100 rounded-e-xl rounded-es-xl'}`}>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <span className={`text-sm font-semibold ${isOwnMessage ? 'text-white' : 'text-gray-900'}`}>
            {senderDisplayName}
          </span>
          <span className={`text-sm font-normal ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
            {new Date().toLocaleTimeString([], { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            })}
          </span>
        </div>
        <p className={`text-sm font-normal ${isOwnMessage ? 'text-white' : 'text-gray-900'}`}>
          {message.content}
        </p>
      </div>
    </div>
  );
}