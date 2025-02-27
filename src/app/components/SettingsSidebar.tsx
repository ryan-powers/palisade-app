"use client";

import React from "react";
import { FaPlus, FaCommentDots, FaCog, FaHome } from "react-icons/fa";

interface SettingsSidebarProps {
  workspaceName: string;
  userInitial: string;
  onOpenProfile: () => void;
  onDMsClick: () => void;
  onHomeClick: () => void;
}

export default function SettingsSidebar({ 
  workspaceName, 
  userInitial, 
  onOpenProfile, 
  onDMsClick,
  onHomeClick 
}: SettingsSidebarProps) {
  return (
    <aside className="flex flex-col w-16 bg-gray-900 text-gray-300 h-screen">
      {/* Top Section */}
      <div className="flex-1">
        {/* Workspace Button */}
        <button className="w-full aspect-square flex items-center justify-center hover:bg-gray-800 transition-colors">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-semibold">
            {userInitial}
          </div>
        </button>

        {/* Separator */}
        <div className="mx-4 my-4 border-t border-gray-700" />

        {/* Home Button with Label */}
        <div className="flex flex-col items-center -space-y-1 mb-2">
          <button 
            onClick={onHomeClick}
            className="w-full aspect-square flex items-center justify-center hover:bg-gray-800 transition-colors group"
          >
            <div className="w-9 h-9 border-2 border-gray-600 rounded-lg flex items-center justify-center group-hover:border-gray-400 transition-colors">
              <FaHome className="w-4 h-4 text-gray-600 group-hover:text-gray-400" />
            </div>
          </button>
          <span className="text-xs font-semibold text-gray-500">Home</span>
        </div>

        {/* DMs Button with Label */}
        <div className="flex flex-col items-center -space-y-1 mb-2">
          <button 
            onClick={onDMsClick}
            className="w-full aspect-square flex items-center justify-center hover:bg-gray-800 transition-colors group"
          >
            <div className="w-9 h-9 border-2 border-gray-600 rounded-lg flex items-center justify-center group-hover:border-gray-400 transition-colors">
              <FaCommentDots className="w-4 h-4 text-gray-600 group-hover:text-gray-400" />
            </div>
          </button>
          <span className="text-xs font-semibold text-gray-500">DMs</span>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="p-2 space-y-2">
        {/* Settings Button */}
        <button 
          onClick={onOpenProfile}
          className="w-full aspect-square flex items-center justify-center hover:bg-gray-800 transition-colors group"
        >
          <div className="w-9 h-9 border-2 border-gray-600 rounded-lg flex items-center justify-center group-hover:border-gray-400 transition-colors">
            <FaCog className="w-4 h-4 text-gray-600 group-hover:text-gray-400" />
          </div>
        </button>

        {/* Add Workspace Button */}
        <button className="w-full aspect-square flex items-center justify-center hover:bg-gray-800 transition-colors group">
          <div className="w-9 h-9 border-2 border-gray-600 rounded-lg flex items-center justify-center group-hover:border-gray-400 transition-colors">
            <FaPlus className="w-4 h-4 text-gray-600 group-hover:text-gray-400" />
          </div>
        </button>
      </div>
    </aside>
  );
} 