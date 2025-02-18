"use client"; // 👈 Required for React hooks

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"; // 👈 Fix undefined error

export default function Home() {
    const [message, setMessage] = useState(""); // 👈 Keep this

    useEffect(() => {
        fetch(API_URL)
            .then((res) => res.json())
            .then((data) => setMessage(data.message)) // 👈 Updates state when data arrives
            .catch((err) => console.error("Error fetching data:", err));
    }, []);

    return (
        <div>
            <h1>Frontend Connected to Backend</h1>
            <p>Message from Fastify: {message}</p> {/* 👈 Displays the message */}
        </div>
    );
}



