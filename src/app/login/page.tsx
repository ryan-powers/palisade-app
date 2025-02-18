"use client"; // Needed to use React hooks & state in Next.js App Router

import { useState } from "react";

export default function LoginPage() {
  // State management
  const [phone, setPhone] = useState("+1");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"enter-phone" | "enter-code">("enter-phone");
  const [message, setMessage] = useState("");

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    // If user backspaces the prefix, re-add it
    if (!val.startsWith("+1")) {
      setPhone("+1" + val.replace(/^\+/, ""));
    } else {
      setPhone(val);
    }
  }

  // Sends OTP
  const sendOtp = async () => {
    if (!phone) return setMessage("Please enter a valid phone number.");
    try {
      const res = await fetch("http://localhost:4000/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setMessage("OTP sent! Check your phone.");
      setStep("enter-code");
    } catch (err: any) {
      setMessage("Error: " + err.message);
    }
  };

  // Verifies OTP
  const verifyOtp = async () => {
    if (!phone || !code) return setMessage("Please provide both phone & code.");
    try {
      const res = await fetch("http://localhost:4000/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setMessage(`Success! Your phone is verified. User ID: ${data.userId}`);
    } catch (err: any) {
      setMessage("Error: " + err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-800 to-gray-600 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-lg p-6">
        {/* Header / Branding */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black-700 mb-2">Palisade</h1>
          <p className="text-gray-600"></p>
        </div>

        {/* Form Steps */}
        {step === "enter-phone" && (
          <>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Enter Phone Number
            </label>
            <input
              className="block w-full mb-4 rounded border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              placeholder="+1 555-123-4567"
              value={phone}
              onChange={handlePhoneChange}
            />

            <button
              onClick={sendOtp}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Send OTP
            </button>
          </>
        )}

        {step === "enter-code" && (
          <>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Enter Code
            </label>
            <input
              className="block w-full mb-4 rounded border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />

            <button
              onClick={verifyOtp}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Verify OTP
            </button>
          </>
        )}

        {/* Status / Message */}
        {message && (
          <div className="mt-4 text-sm text-center text-gray-700">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

