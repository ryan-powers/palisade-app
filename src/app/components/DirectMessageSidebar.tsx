"use client";

import React, { useState } from "react";
import { FaSearch, FaCircle, FaPencilAlt } from "react-icons/fa";
import DMChatWindow from "./DMChatWindow";
import DirectMessageWindow from "./DirectMessageWindow";

interface DMUser {
  id: string;
  name: string;
  isOnline: boolean;
  lastMessage?: string;
  timestamp?: string;
  isOwnSpace?: boolean;
}

export default function DirectMessageSidebar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDM, setSelectedDM] = useState<DMUser | null>(null);

  const staticDMs: DMUser[] = [
    {
      id: "1",
      name: "John",
      isOnline: true,
      lastMessage: "Thanks for the update!",
      timestamp: "2:30 PM"
    },
    {
      id: "2",
      name: "Matt",
      isOnline: false,
      lastMessage: "New message",
      timestamp: "Yesterday"
    },
    {
      id: "3",
      name: "Sarah",
      isOnline: true,
      lastMessage: "New message",
      timestamp: "Yesterday"
    },
    {
      id: "self",
      name: "Ryan Powers",
      isOnline: true,
      lastMessage: "Draft messages, list your to-dos, or keep links handy",
      isOwnSpace: true
    }
  ];

  return (
    <div className="flex-1 flex">
      {/* DMs Sidebar */}
      <div className="w-80 flex flex-col bg-gray-800 border-r border-gray-700">
        {/* Header */}
        <header className="px-4 py-2 border-b border-gray-700 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-white">Direct Messages</h1>
          <button className="p-2 hover:bg-gray-700 rounded">
            <FaPencilAlt className="text-gray-400 w-4 h-4" />
          </button>
        </header>

        {/* Search Bar */}
        <div className="p-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Find a conversation"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* DM List */}
        <div className="flex-1 overflow-y-auto">
          {staticDMs.map((dm) => (
            <button
              key={dm.id}
              onClick={() => setSelectedDM(dm)}
              className={`w-full px-4 py-2 hover:bg-gray-700 flex items-center justify-between group
                ${selectedDM?.id === dm.id ? 'bg-gray-700' : ''}`}
            >
              <div className="flex items-center w-full">
                <div className="relative">
                  <div className="w-8 h-8 bg-gray-600 rounded-sm flex items-center justify-center text-white font-medium">
                    {dm.name[0]}
                  </div>
                  <FaCircle 
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 
                      ${dm.isOnline ? 'text-green-500' : 'text-gray-500'} 
                      bg-gray-800 rounded-full p-0.5`}
                  />
                </div>
                <div className="ml-3 text-left flex-1 min-w-0">
                  <div className="flex items-center">
                    <span className="text-white font-medium truncate">{dm.name}</span>
                    {dm.isOwnSpace && (
                      <span className="ml-2 text-xs text-gray-400 shrink-0">(you)</span>
                    )}
                    {dm.timestamp && (
                      <span className="ml-2 text-xs text-gray-400 shrink-0">{dm.timestamp}</span>
                    )}
                  </div>
                  {dm.lastMessage && (
                    <p className={`text-sm text-gray-400 ${dm.isOwnSpace ? 'break-words' : 'truncate'} pr-4`}>
                      {dm.lastMessage}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      {selectedDM ? (
        selectedDM.name === "John" ? (
          <DMChatWindow
            userName={selectedDM.name}
            isOnline={selectedDM.isOnline}
            isOwnSpace={selectedDM.isOwnSpace}
          />
        ) : (
          <DirectMessageWindow
            userName={selectedDM.name}
            isOnline={selectedDM.isOnline}
            isOwnSpace={selectedDM.isOwnSpace}
          />
        )
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-800 text-gray-500">
          <p>Select a conversation to start messaging</p>
        </div>
      )}
    </div>
  );
} 