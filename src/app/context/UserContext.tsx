"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface UserContextType {
  userId: string | null;
  setUserId: (id: string) => void;
  displayName: string | null;
  setDisplayName: (name: string) => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

console.log("🔄 Creating UserContext");

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayNameState] = useState<string | null>(null);

  // Load user data from localStorage on mount
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    
    if (storedUserId) {
      console.log("✅ Found stored userId:", storedUserId);
      setUserId(storedUserId);
      
      // Fetch display name from server
      fetch("http://localhost:4000/get-display-name", {
        headers: { "user-id": storedUserId },
      })
        .then(res => res.json())
        .then(data => {
          if (data.displayName) {
            console.log("✅ Loaded display name:", data.displayName);
            setDisplayNameState(data.displayName);
            localStorage.setItem("displayName", data.displayName);
          }
        })
        .catch(error => console.error("❌ Error fetching display name:", error));
    } else {
      console.log("⚠️ No userId found in localStorage");
    }
  }, []);

  const updateUserId = (id: string) => {
    console.log("✅ Updating userId:", id);
    setUserId(id);
    localStorage.setItem("userId", id);
  };

  const setDisplayName = async (name: string) => {
    const currentUserId = userId || localStorage.getItem("userId");
    console.log("📝 Attempting to set display name. Current userId:", currentUserId);
    
    if (!currentUserId) {
      console.error("❌ User ID is missing. Cannot update display name.");
      return;
    }

    try {
      console.log("🔄 Sending display name update request...");
      const response = await fetch("http://localhost:4000/set-display-name", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "user-id": currentUserId
        },
        body: JSON.stringify({ displayName: name }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Server responded with ${response.status}: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      if (data.message === "Display name updated successfully") {
        console.log("✅ Display name updated successfully:", name);
        setDisplayNameState(name);
        localStorage.setItem("displayName", name);
      }
    } catch (error) {
      console.error("❌ Error setting display name:", error);
      throw error; // Re-throw to handle in the UI
    }
  };

  const logout = () => {
    // Clear all user data from state
    setUserId(null);
    setDisplayNameState(null);
    
    // Clear localStorage
    localStorage.removeItem("userId");
    localStorage.removeItem("displayName");
    localStorage.removeItem("publicKey");
    
    // Clear IndexedDB (private key)
    const request = indexedDB.deleteDatabase("userKeys");
    request.onsuccess = () => {
      console.log("✅ IndexedDB cleared successfully");
    };

    // Redirect to login page
    window.location.href = "/login";
  };

  const contextValue = {
    userId,
    setUserId: updateUserId,
    displayName,
    setDisplayName,
    logout,
  };

  console.log("🔄 UserContext value:", contextValue);

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
