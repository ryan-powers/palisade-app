"use client";

import React, { useState } from "react";
import { FaCog, FaChevronDown, FaPlus, FaCircle, FaLock } from "react-icons/fa";
import CreateChannelModal from './modals/CreateChannelModal';
import Image from 'next/image';

interface SidebarProps {
  onOpenProfile: () => void;
  onChannelSelect: (channelId: string, channelName: string, description?: string) => void;
  onDMSelect: (userName: string, isOnline: boolean) => void;
}

interface Channel {
  id: string;
  name: string;
  isPrivate?: boolean;
  description?: string;
}

interface DirectMessage {
  userId: string;
  name: string;
  isOnline: boolean;
}

export default function Sidebar({ onOpenProfile, onChannelSelect, onDMSelect }: SidebarProps) {
  const [activeItem, setActiveItem] = useState("general"); // Track active channel/DM
  const [isChannelsExpanded, setIsChannelsExpanded] = useState(true);
  const [isDMsExpanded, setIsDMsExpanded] = useState(true);
  const [channels, setChannels] = useState<Channel[]>([
    { 
      id: "1", 
      name: "general", 
      isPrivate: false,
      description: "Channel for all-team announcements and questions."
    },
    { 
      id: "2", 
      name: "product", 
      isPrivate: false,
      description: "For all product-related discussions."
    },
    { 
      id: "3", 
      name: "engineering", 
      isPrivate: true,
      description: "Private channel for engineering team discussions."
    },
  ]);

  const [directMessages] = useState<DirectMessage[]>([
    { userId: "1", name: "John", isOnline: true },
    { userId: "2", name: "Matt", isOnline: false },
    { userId: "3", name: "Ryan", isOnline: true },
  ]);

  const [isCreateChannelModalOpen, setIsCreateChannelModalOpen] = useState(false);

  const handleChannelSelect = (channelId: string, channelName: string) => {
    setActiveItem(channelName);
    onChannelSelect(channelId, channelName);
  };

  const handleDMSelect = (userId: string, userName: string, isOnline: boolean) => {
    setActiveItem(userName);
    onDMSelect(userName, isOnline);
  };

  const handleCreateChannel = (name: string, isPrivate: boolean, description: string) => {
    const newChannel = {
      id: String(Date.now()),
      name,
      isPrivate,
      description
    };
    setChannels(prevChannels => [...prevChannels, newChannel]);
    setActiveItem(name);
    onChannelSelect(newChannel.id, name, description);
  };

  return (
    <aside className="flex flex-col w-64 bg-gray-800 text-gray-300 h-screen">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-700 flex items-center justify-start">
        <Image 
          src="/images/logo-small.png"
          alt="Palisade"
          width={140}
          height={24}
          priority
        />
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-4">
        {/* Channels Section */}
        <div>
          <div 
            className="flex items-center justify-between px-2 mb-2 group cursor-pointer"
            onClick={() => setIsChannelsExpanded(!isChannelsExpanded)}
          >
            <div className="flex items-center">
              <FaChevronDown 
                className={`w-3 h-3 mr-1 transition-transform duration-200 
                  ${!isChannelsExpanded ? '-rotate-90' : ''}`}
              />
              <span className="font-bold text-sm uppercase tracking-wide">
                Channels
              </span>
            </div>
            <button 
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                setIsCreateChannelModalOpen(true);
              }}
            >
              <FaPlus className="w-4 h-4" />
            </button>
          </div>
          
          {isChannelsExpanded && (
            <ul className="space-y-1">
              {channels.map(channel => (
                <li 
                  key={channel.id}
                  className={`px-2 py-1 rounded cursor-pointer flex items-center hover:bg-gray-700 transition-colors
                    ${activeItem === channel.name ? 'bg-blue-600 text-white' : ''}`}
                  onClick={() => handleChannelSelect(channel.id, channel.name)}
                >
                  <span className="text-gray-400 mr-2">
                    {channel.isPrivate ? (
                      <FaLock className="w-3 h-3" />
                    ) : (
                      "#"
                    )}
                  </span>
                  {channel.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Direct Messages Section */}
        <div>
          <div 
            className="flex items-center justify-between px-2 mb-2 group cursor-pointer"
            onClick={() => setIsDMsExpanded(!isDMsExpanded)}
          >
            <div className="flex items-center">
              <FaChevronDown 
                className={`w-3 h-3 mr-1 transition-transform duration-200 
                  ${!isDMsExpanded ? '-rotate-90' : ''}`}
              />
              <span className="font-bold text-sm uppercase tracking-wide">
                Direct Messages
              </span>
            </div>
            <button 
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                console.log("Add DM");
              }}
            >
              <FaPlus className="w-4 h-4" />
            </button>
          </div>

          {isDMsExpanded && (
            <ul className="space-y-1">
              {directMessages.map(dm => (
                <li 
                  key={dm.userId}
                  className={`px-2 py-1 rounded cursor-pointer flex items-center hover:bg-gray-700 transition-colors
                    ${activeItem === dm.name ? 'bg-blue-600 text-white' : ''}`}
                  onClick={() => handleDMSelect(dm.userId, dm.name, dm.isOnline)}
                >
                  <FaCircle 
                    className={`w-2 h-2 mr-2 ${dm.isOnline ? 'text-green-500' : 'text-gray-500'}`} 
                  />
                  {dm.name}
                  {dm.userId === "3" && (
                    <span className="ml-2 text-gray-400 opacity-75">You</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </nav>

      {/* Profile Controls */}
      {/* <div className="p-4 border-t border-gray-700">
        <button
          className="w-full py-2 px-2 rounded flex items-center hover:bg-gray-700 transition-colors"
          onClick={onOpenProfile}
        >
          <FaCog className="w-5 h-4 mr-3" />
          <span>Preferences</span>
        </button>
      </div> */}

      <CreateChannelModal
        isOpen={isCreateChannelModalOpen}
        onClose={() => setIsCreateChannelModalOpen(false)}
        onCreateChannel={handleCreateChannel}
      />
    </aside>
  );
} 