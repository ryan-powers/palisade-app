"use client";

import { useEffect, useState } from "react";
import sodium from "libsodium-wrappers";
import { getPrivateKey } from "../login/page"; // Ensure this fetches from IndexedDB

export default function ChatPage() {
  const [messages, setMessages] = useState<{ id: string; senderId: string; text: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [userId, setUserId] = useState("e704ff7e-85b4-424d-ba19-cdc1c5a8fcf5"); // Simulate logged-in user
  const [receiverId, setReceiverId] = useState("e704ff7e-85b4-424d-ba19-cdc1c5a8fcf5"); // For testing, message yourself
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);

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
          text
        };
      })
    );
    console.log("✅ Decrypted Messages:", decrypted);
    setMessages(decrypted);
  }

  useEffect(() => {
    fetchMessages();
  }, []);

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

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.map((msg) => (
            <div key={msg.id} className="flex items-center space-x-2">
              <span className="font-bold text-blue-600">{msg.senderId}:</span>
              <span>{msg.text}</span>
            </div>
          ))}
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
      <div className="absolute bottom-3 left-3">
        <div className="w-10 h-10 rounded-full bg-gray-300 hover:bg-gray-400 flex items-center justify-center cursor-pointer">
          <span className="text-sm font-semibold text-gray-700">RP</span>
        </div>
      </div>
    </div>
  );
}

