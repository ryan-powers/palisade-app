"use client";

import React, { useState } from 'react';
import { FaLock, FaHashtag } from 'react-icons/fa';

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateChannel: (name: string, isPrivate: boolean, description: string) => void;
}

export default function CreateChannelModal({ isOpen, onClose, onCreateChannel }: CreateChannelModalProps) {
  const [channelName, setChannelName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!channelName.trim()) {
      setError('Channel name is required');
      return;
    }

    if (!/^[a-z0-9-_]+$/.test(channelName)) {
      setError('Channel name can only contain lowercase letters, numbers, hyphens, and underscores');
      return;
    }

    onCreateChannel(channelName, isPrivate, description);
    setChannelName('');
    setDescription('');
    setIsPrivate(false);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed bottom-16 left-4 z-50 animate-slideUp">
        <div className="bg-white rounded-lg shadow-xl w-[400px]">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create a channel</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Channel type
                </label>
                <div className="space-y-2">
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="channelType"
                      checked={!isPrivate}
                      onChange={() => setIsPrivate(false)}
                      className="h-4 w-5 text-blue-600"
                    />
                    <div className="flex items-center ml-8">
                      <FaHashtag className="text-gray-400 mr-3" />
                      <div>
                        <div className="font-medium text-gray-900">Public</div>
                        <div className="text-sm text-gray-500">Anyone in the workspace can join</div>
                      </div>
                    </div>
                  </label>
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="channelType"
                      checked={isPrivate}
                      onChange={() => setIsPrivate(true)}
                      className="h-4 w-5 text-blue-600"
                    />
                    <div className="flex items-center ml-8">
                      <FaLock className="text-gray-400 mr-3" />
                      <div>
                        <div className="font-medium text-gray-900">Private</div>
                        <div className="text-sm text-gray-500">Only invited people can join</div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Channel name
                </label>
                <div className="mt-1 relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    {isPrivate ? <FaLock /> : <FaHashtag />}
                  </span>
                  <input
                    type="text"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value.toLowerCase())}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. marketing"
                  />
                </div>
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="What's this channel about?"
                />
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Create Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
} 