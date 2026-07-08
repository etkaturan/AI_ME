"use client";

import { useState } from "react";
import { sendChatMessage } from "@/lib/api";

const PERSON_ID = "2db71e8e-d499-4dfd-ae9e-81e22412c802"; // temporary hardcoded ID for testing

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const result = await sendChatMessage(PERSON_ID, input);
      setMessages((prev) => [...prev, { role: "assistant", content: result.response }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Error: could not reach the AI." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Chat with AI Etka</h1>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg max-w-[80%] ${
              msg.role === "user" ? "bg-blue-600 text-white ml-auto" : "bg-gray-200 text-black"
            }`}
          >
            {msg.content}
          </div>
        ))}
        {loading && <div className="text-gray-500 text-sm">Thinking...</div>}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 border rounded-lg p-2 text-black"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
}