"use client";

import React, { useState } from "react";
import { FaCircle } from "react-icons/fa";

interface Message {
  id: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
  sender: string;
}

interface DMChatWindowProps {
  userName: string;
  isOnline: boolean;
  isOwnSpace?: boolean;
}

export default function DMChatWindow({ userName, isOnline, isOwnSpace }: DMChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(
    userName === "John" ? [
      {
        id: "1",
        content: "Hey, did you get a chance to look at the new design?",
        timestamp: "10:30 AM",
        isOwn: false,
        sender: "John"
      },
      {
        id: "2",
        content: "Yes, I really like the direction it's going in!",
        timestamp: "10:32 AM",
        isOwn: true,
        sender: "Ryan"
      },
      {
        id: "3",
        content: "Great! I'll share the updates with the team then",
        timestamp: "10:33 AM",
        isOwn: false,
        sender: "John"
      },
      {
        id: "4",
        content: "Thanks for the update!",
        timestamp: "10:35 AM",
        isOwn: true,
        sender: "Ryan"
      }
    ] : []
  );
  const [inputMessage, setInputMessage] = useState("");

  const handleSend = () => {
    if (inputMessage.trim()) {
      const newMessage: Message = {
        id: String(Date.now()),
        content: inputMessage,
        timestamp: new Date().toLocaleTimeString([], { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
        isOwn: true,
        sender: "Ryan"
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

      {/* Messages Area - now with white background */}
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
                  Draft messages, list your to-dos, or keep links and files handy.
                </p>
              </>
            ) : (
              <p className="mb-2">This is the beginning of your direct message history with {userName}</p>
            )}
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] rounded-lg p-3 
                ${message.isOwn ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-sm font-medium ${message.isOwn ? 'text-blue-100' : 'text-gray-700'}`}>
                    {message.sender}
                  </span>
                  <span className={`text-xs ${message.isOwn ? 'text-blue-200' : 'text-gray-500'}`}>
                    {message.timestamp}
                  </span>
                </div>
                <p>{message.content}</p>
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