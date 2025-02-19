"use client";

import { useEffect, useState } from "react";
import sodium from "libsodium-wrappers";
import { getPrivateKey } from "../login/page";

export default function ChatPage() {
  const [messages, setMessages] = useState<
    { id: string; senderId: string; text: string }[]
  >([]);
  const [chatInput, setChatInput] = useState("");
  const [userId, setUserId] = useState(""); // Simulate logged-in user
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [recipientPublicKey, setRecipientPublicKey] = useState<string | null>(
    null
  );

  // ✅ Simulate loading user details (Replace this with actual auth/user fetching

  useEffect(() => {
    async function loadUserKeys() {
      await sodium.ready;
      const storedPrivateKey = await getPrivateKey(); // ✅ Now fetching from IndexedDB
      const storedPublicKey = localStorage.getItem("publicKey");

      console.log("🔑 Checking stored keys...");
      console.log("Stored Private Key:", storedPrivateKey);
      console.log("Stored Public Key:", storedPublicKey);
  
      if (!storedPrivateKey || !storedPublicKey) {
        console.error("🚨 No private key found, redirecting to login...");
        
        // ❗ Force a pause before redirect
        alert("Redirecting to login! Open Console (F12) and check logs.");
        debugger; // ❗ This stops execution so you can inspect state
  
        setTimeout(() => {
          window.location.href = "/login"; // Delayed redirect
        }, 5000); // ❗ 5-second delay to ensure logs remain visible
  
        return;
      }
  
      setPrivateKey(storedPrivateKey);
      setPublicKey(storedPublicKey);
    }
  
    loadUserKeys();
  }, []);

  // ✅ Encrypt a message before sending
  async function encryptMessage(message: string, recipientPublicKey: string) {
    await sodium.ready;
    const publicKey = sodium.from_base64(recipientPublicKey);
    const encryptedMessage = sodium.crypto_box_seal(message, publicKey);
    return sodium.to_base64(encryptedMessage);
  }

  // ✅ Send an encrypted message
  async function sendMessage() {
    if (!chatInput.trim() || !recipientPublicKey) return;

    const encryptedText = await encryptMessage(chatInput, recipientPublicKey);

    const res = await fetch("http://localhost:4000/send-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senderId: userId,
        receiverId: userId, // TODO: Replace with actual recipient
        encryptedMessage: encryptedText,
      }),
    });

    const data = await res.json();
    console.log("Message sent:", data);

    setMessages([...messages, { id: data.messageId, senderId: userId, text: chatInput }]);
    setChatInput("");
  }

  // ✅ Decrypt messages before displaying them
  async function decryptMessage(encryptedMessage: string) {
    if (!privateKey) return "🔒 Encrypted Message";

    await sodium.ready;
    const encryptedBytes = sodium.from_base64(encryptedMessage);
    const decryptedMessage = sodium.crypto_box_seal_open(
      encryptedBytes,
      sodium.from_base64(privateKey)
    );

    return new TextDecoder().decode(decryptedMessage);
  }

  // ✅ Fetch messages from backend & decrypt them
  async function fetchMessages() {
    try {
      const res = await fetch("http://localhost:4000/get-messages");
      const fetchedMessages = await res.json();
  
      console.log("📥 Raw Fetched Messages:", fetchedMessages); // Debugging log
  
      if (!Array.isArray(fetchedMessages)) {
        console.error("❌ Expected an array but got:", fetchedMessages);
        return;
      }
  
      const decryptedMessages = await Promise.all(
        fetchedMessages.map(async (msg: any) => ({
          id: msg.id,
          senderId: msg.senderId,
          text: await decryptMessage(msg.content),
        }))
      );
  
      console.log("✅ Decrypted Messages:", decryptedMessages);
      setMessages(decryptedMessages);
    } catch (error) {
      console.error("❌ Error fetching messages:", error);
    }
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

