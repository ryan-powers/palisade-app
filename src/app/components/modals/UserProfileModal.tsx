import React, { useState, useEffect } from "react";
import { FaUser, FaPen, FaSignOutAlt } from "react-icons/fa";
import { useUserContext } from "../../context/UserContext";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const context = useUserContext(); // Get the full context

  const { userId, displayName, setDisplayName, logout } = context;
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState(displayName || '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUserDisplayName() {
      if (!userId) return;

      try {
        const res = await fetch("http://localhost:4000/get-display-name", {
          headers: { "user-id": userId },
        });

        const data = await res.json();
        if (data.displayName) {
          setNewDisplayName(data.displayName);
        }
      } catch (error) {
        console.error("❌ Error loading display name:", error);
      }
    }

    loadUserDisplayName();
  }, [userId]);

  const saveDisplayName = async () => {
    if (!newDisplayName.trim()) return;
    setError(null);

    try {
      await setDisplayName(newDisplayName);
      setIsNameModalOpen(false);
    } catch (error) {
      setError("Failed to update display name. Please try again.");
      console.error("❌ Error saving display name:", error);
    }
  };

  const handleLogout = () => {
    console.log("👋 Logout clicked"); // Debug log
    if (logout) {
      logout();
    } else {
      console.error("❌ Logout function is undefined");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80">
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Profile</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">&times;</button>
        </div>
        
        {/* Avatar & Photo Edit */}
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center mb-4">
            <span className="text-3xl">🕵️‍♂️</span>
          </div>
          <button className="text-blue-500 hover:underline mb-4">Edit photo</button>
        </div>

        <div className="border-t border-gray-200 my-4"></div>

        {/* Display Name */}
        <div className="flex flex-col items-left space-y-4">
          <div className="flex items-center space-x-2">
            <FaUser className="text-gray-500" />
            <p className="font-semibold cursor-pointer hover:underline" onClick={() => setIsNameModalOpen(true)}>
              {newDisplayName || 'Set display name'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <FaPen className="text-gray-500" />
            <p className="text-gray-500">About</p>
          </div>
        </div>

        {/* Added more spacing here */}
        <div className="border-t border-gray-200 my-4"></div>
        <p className="text-sm text-gray-500 text-center mb-6">
          Your profile and changes to it will be visible to people you message, contacts, and channels.
        </p> 

        {/* Simple Logout Button with more spacing */}
        <div className="mt-15 pt-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full py-3 px-4 bg-red-100 hover:bg-red-200 text-gray-900 rounded-lg transition-colors duration-200 font-medium"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Name Editing Modal */}
      {isNameModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Your Name</h2>
              <button onClick={() => setIsNameModalOpen(false)} className="text-gray-500 hover:text-gray-700">&times;</button>
            </div>
            <div className="flex flex-col space-y-4">
              <input
                className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="text"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                placeholder="Enter your display name"
              />
              <div className="flex justify-end space-x-2">
                <button 
                  onClick={() => setIsNameModalOpen(false)} 
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button 
                  onClick={saveDisplayName} 
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileModal;



