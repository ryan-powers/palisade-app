"use client";

import { useEffect, useState } from "react";
import sodium from "libsodium-wrappers";
import { getPrivateKey } from "../login/page"; // Ensure this fetches from IndexedDB
import UserProfileModal from "../components/modals/UserProfileModal";
import { useUserContext } from "@/app/context/UserContext";
import React from "react";
import { FaCog } from "react-icons/fa";
import ChatWindow from "../components/ChatWindow";
import Sidebar from "../components/Sidebar";
import PrototypeChatWindow from "../components/PrototypeChatWindow";
import PrivateChannelWindow from "../components/PrivateChannelWindow";
import NewChatWindow from "../components/NewChatWindow";
import DirectMessageSidebar from "../components/DirectMessageSidebar";
import SettingsSidebar from "../components/SettingsSidebar";

interface Message {
  id: string;
  senderId: string;
  content: string;
}

interface Channel {
  id: string;
  name: string;
  isPrivate: boolean;
  description: string;
}

interface DMUser {
  name: string;
  isOnline: boolean;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [userId, setUserId] = useState("52033aa0-42db-43ea-8f29-1af2c0145e78"); // Simulate logged-in user
  const [receiverId, setReceiverId] = useState("52033aa0-42db-43ea-8f29-1af2c0145e78"); // For testing, message yourself
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const { displayName, setUserId: setContextUserId } = useUserContext();
  const [selectedChannel, setSelectedChannel] = useState("general");
  const [currentChannel, setCurrentChannel] = useState<Channel>({
    id: "1",
    name: "general",
    isPrivate: false,
    description: "Channel for all-team announcements and questions."
  });
  const [selectedDM, setSelectedDM] = useState<DMUser | null>(null);
  const [showDMsPage, setShowDMsPage] = useState(false);

  // Add ref for the messages container
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Add scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load user data on mount
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      console.log("✅ Setting userId in ChatPage:", storedUserId);
      setUserId(storedUserId);
      setContextUserId(storedUserId);
    } else {
      console.log("⚠️ No userId found, redirecting to login...");
      window.location.href = "/login";
    }
  }, [setContextUserId]);

  useEffect(() => {
    async function fetchUserData() {
      const storedUserId = localStorage.getItem("userId");
      if (storedUserId) {
        setUserId(storedUserId);
        setContextUserId(storedUserId);
      }
      const storedPublicKey = localStorage.getItem("publicKey");
  
      if (storedPublicKey) setPublicKey(storedPublicKey);
    }
  
    fetchUserData();
  }, []);

  // 1. On page load, fetch user's private key & public key
  useEffect(() => {
    async function loadUserKeys() {
      await sodium.ready;
      const storedPrivateKey = await getPrivateKey(); 
      const storedPublicKey = localStorage.getItem("publicKey");

      console.log("🔑 Checking stored keys...");
      console.log("Stored Private Key:", storedPrivateKey);
      console.log("Stored Public Key:", storedPublicKey);

      if (!storedPrivateKey || !storedPublicKey) {
        console.error("🚨 No private key found, redirecting to login...");
        window.location.href = "/login";
        return;
      }
      setPrivateKey(storedPrivateKey);
      setPublicKey(storedPublicKey);
    }
    loadUserKeys();
  }, []);

  // 2. Function to encrypt the message
  async function encryptMessage(plainText: string, receiverPublicKey: string) {
    await sodium.ready;
    const privateKey = await getPrivateKey();
    if (!privateKey) {
      console.error("🚨 No private key found!");
      return null;
    }
    const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);
    const nonceBase64 = sodium.to_base64(nonce);
    const encrypted = sodium.crypto_box_easy(
      sodium.from_string(plainText),
      nonce,
      sodium.from_base64(receiverPublicKey),
      sodium.from_base64(privateKey)
    );
    return {
      encryptedMessage: sodium.to_base64(encrypted),
      nonce: nonceBase64
    };
  }

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    try {
      // Fetch receiver's public key
      const publicKeyRes = await fetch(`http://localhost:4000/get-user-public-key?userId=${receiverId}`);
      const { receiverPublicKey } = await publicKeyRes.json();

      if (!receiverPublicKey) {
        throw new Error("No public key found for receiver");
      }

      console.log("🔐 Encrypting message...");
      const encryptionResult = await encryptMessage(text, receiverPublicKey);
      if (!encryptionResult) throw new Error("Encryption failed");

      const { encryptedMessage, nonce } = encryptionResult;

      // Post to /send-message
      const response = await fetch("http://localhost:4000/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: userId,
          receiverId,
          content: encryptedMessage,
          nonce
        }),
      });

      if (response.ok) {
        console.log("📩 Message sent successfully!");
        setChatInput("");
        fetchMessages();
      } else {
        const data = await response.json();
        throw new Error(data.error || "Send message failed");
      }
    } catch (error) {
      console.error("❌ Error sending message:", error);
    }
  };

  // 4. Decrypt messages
  async function decryptMessage(encryptedMessage: string, senderPublicKey: string, nonce: string) {
    await sodium.ready;
    const privateKey = await getPrivateKey();
    if (!privateKey) {
      console.error("No private key found!");
      return "🔒 Encrypted Message";
    }
    try {
      const decrypted = sodium.crypto_box_open_easy(
        sodium.from_base64(encryptedMessage),
        sodium.from_base64(nonce),
        sodium.from_base64(senderPublicKey),
        sodium.from_base64(privateKey)
      );
      return new TextDecoder().decode(decrypted);
    } catch (err) {
      console.error("Decryption failed:", err);
      return "🔒 Encrypted Message";
    }
  }

  // 5. Fetch messages from backend & decrypt them
  async function fetchMessages() {
    const res = await fetch("http://localhost:4000/get-messages");
    const fetchedMessages = await res.json();

    console.log("📥 Raw Fetched Messages:", fetchedMessages);
    if (!Array.isArray(fetchedMessages)) {
      console.error("❌ Expected an array but got:", fetchedMessages);
      return;
    }

    const decrypted = await Promise.all(
      fetchedMessages.map(async (msg: any) => {
        const text = await decryptMessage(msg.content, msg.senderPublicKey, msg.nonce);
        return {
          id: msg.id,
          senderId: msg.senderId,
          content: text
        };
      })
    );
    console.log("✅ Decrypted Messages:", decrypted);
    setMessages(decrypted);
  }

  useEffect(() => {
    fetchMessages();
  }, []);

  const [displayNames, setDisplayNames] = useState<{ [key: string]: string }>({});

// Fetch display names when component loads
useEffect(() => {
  async function fetchDisplayNames() {
    const userIds = messages.map(msg => msg.senderId);
    const uniqueUserIds = [...new Set(userIds)];

    const nameMap: { [key: string]: string } = {};
    for (const id of uniqueUserIds) {
      try {
        const res = await fetch(`http://localhost:4000/get-display-name`, {
          headers: { "user-id": id },
        });
        const { displayName } = await res.json();
        if (displayName) nameMap[id] = displayName;
      } catch (error) {
        console.error("Error fetching display name for user:", id, error);
      }
    }

    setDisplayNames(nameMap);
  }

  fetchDisplayNames();
}, [messages]);

  // Add handler for channel selection
  const handleChannelChange = (channelId: string, channelName: string, description?: string) => {
    setSelectedChannel(channelName);
    setSelectedDM(null);
    setCurrentChannel(prev => ({
      ...prev,
      id: channelId,
      name: channelName,
      description: description || ''
    }));
  };

  // Add handler for DM selection
  const handleDMSelect = (userName: string, isOnline: boolean) => {
    setSelectedDM({ name: userName, isOnline });
    setSelectedChannel(""); // Clear channel selection
  };

  // Add handler for DMs button click
  const handleDMsClick = () => {
    setShowDMsPage(true);
    setSelectedDM(null);
    setSelectedChannel("");
  };

  // Add handler for Home button click
  const handleHomeClick = () => {
    setShowDMsPage(false);
    setSelectedDM(null);
    setSelectedChannel("general");
  };

  return (
    <div className="h-screen w-screen flex">
      <SettingsSidebar 
        workspaceName="Palisade"
        userInitial="R"
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onDMsClick={handleDMsClick}
        onHomeClick={handleHomeClick}
      />
      
      {/* Only show Sidebar when not in DMs page */}
      {!showDMsPage && (
        <Sidebar 
          onOpenProfile={() => setIsProfileModalOpen(true)} 
          onChannelSelect={handleChannelChange}
          onDMSelect={handleDMSelect}
        />
      )}
      
      {showDMsPage ? (
        <DirectMessageSidebar />
      ) : selectedChannel === "product" ? (
        <PrototypeChatWindow />
      ) : selectedChannel === "engineering" ? (
        <PrivateChannelWindow />
      ) : selectedChannel === "general" ? (
        <ChatWindow
          messages={messages}
          onSendMessage={handleSendMessage}
          userId={userId}
        />
      ) : (
        <NewChatWindow
          channelName={currentChannel.name}
          channelDescription={currentChannel.description}
          isPrivate={currentChannel.isPrivate}
        />
      )}

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
}

