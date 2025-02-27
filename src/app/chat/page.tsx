"use client";

import { useEffect, useState } from "react";
import sodium from "libsodium-wrappers";
import { getPrivateKey } from "../login/page"; // Ensure this fetches from IndexedDB
import UserProfileModal from "../components/modals/UserProfileModal";
import { useUserContext } from "@/app/context/UserContext";
import React from "react";
import { FaCog } from "react-icons/fa";

interface Message {
  id: string;
  senderId: string;
  content: string;
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

  // 3. Send the encrypted message to the backend
  const sendMessage = async () => {
    if (!chatInput.trim()) return;

    try {
      // Fetch receiver's public key
      const publicKeyRes = await fetch(`http://localhost:4000/get-user-public-key?userId=${receiverId}`);
      const { receiverPublicKey } = await publicKeyRes.json();

      if (!receiverPublicKey) {
        throw new Error("No public key found for receiver");
      }

      console.log("🔐 Encrypting message...");
      const encryptionResult = await encryptMessage(chatInput.trim(), receiverPublicKey);
      if (!encryptionResult) throw new Error("Encryption failed");

      const { encryptedMessage, nonce } = encryptionResult;

      // Post to /send-message
      const sendRes = await fetch("http://localhost:4000/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: userId,
          receiverId,
          content: encryptedMessage,
          nonce
        }),
      });

      if (!sendRes.ok) {
        const data = await sendRes.json();
        throw new Error(data.error || "Send message failed");
      }

      console.log("📩 Message sent successfully!");
      setChatInput("");
      // Optionally refetch messages to see it appear
      fetchMessages();

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
            <li className="px-4 py-1 hover:bg-gray-700 transition-colors cursor-pointer">
              # general
            </li>
            <li className="px-4 py-1 hover:bg-gray-700 transition-colors cursor-pointer">
              # random
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Chat Section */}
      <main className="flex-1 flex flex-col bg-white">
        {/* Channel Header */}
        <header className="px-4 py-2 border-b border-gray-200 flex items-center justify-between">
          <div className="font-semibold"># general</div>
        </header>

        {/* Messages container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            const isOwnMessage = msg.senderId === userId;
            return (
              <ChatMessage
                key={msg.id}
                message={msg}
                isOwnMessage={isOwnMessage}
              />
            );
          })}
          {/* Add div ref for scrolling */}
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

      {/* Profile Icon */}
      <div className="absolute bottom-3 left-3 flex flex-col items-center">
        <button
          className="w-10 h-10 rounded-full bg-gray-300 hover:bg-gray-400 flex items-center justify-center cursor-pointer mb-2"
          onClick={() => setIsProfileModalOpen(true)}
        >
          <FaCog className="w-5 h-5 text-gray-700" />
        </button>
        <div
          className="w-10 h-10 rounded-full bg-gray-300 hover:bg-gray-400 flex items-center justify-center cursor-pointer"
        >
          <span className="text-xl font-semibold text-gray-700">+</span>
        </div>
      </div>

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        />
    </div>
  );
}

function ChatMessage({ message, isOwnMessage }: { message: Message; isOwnMessage: boolean }) {
  const { userId, displayName } = useUserContext();
  const senderDisplayName = message.senderId === userId 
    ? (displayName || 'You')
    : message.senderId.slice(0, 8);
  
  return (
    <div className="flex justify-start mb-4">
      <div className={`rounded-lg px-4 py-3 max-w-[70%] bg-gray-200`}>
        <div className="text-sm font-bold mb-2 text-black">
          {senderDisplayName}
        </div>
        <div className="text-gray-800">
          {message.content}
        </div>
      </div>
    </div>
  );
}

