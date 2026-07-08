"use client";

import { useState } from "react";
import { sendChatMessage } from "@/lib/api";

const PERSON_ID = "2db71e8e-d499-4dfd-ae9e-81e22412c802"; // temporary hardcoded ID for testing

const PERSONAS = [
  { id: "private", label: "Private" },
  { id: "friends", label: "Friends" },
  { id: "professional", label: "Professional" },
];

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [persona, setPersona] = useState("private");
  const [mode, setMode] = useState<"text" | "voice">("text");

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
    <div className="flex flex-col h-screen bg-[#0A0C10] text-[#E6E9F2]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#232838]">
        <span className="font-[family-name:var(--font-display)] font-bold">Aime</span>

        <div className="flex items-center gap-2">
          {PERSONAS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPersona(p.id)}
              className={`text-xs px-3 py-1.5 rounded-md border transition ${
                persona === p.id
                  ? "border-[#3DDC97] text-[#3DDC97]"
                  : "border-[#232838] text-[#8A90A6] hover:border-[#3DDC97]/50"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 border border-[#232838] rounded-md p-1">
          <button
            onClick={() => setMode("text")}
            className={`text-xs px-3 py-1 rounded ${
              mode === "text" ? "bg-[#3DDC97] text-[#0A0C10]" : "text-[#8A90A6]"
            }`}
          >
            Text
          </button>
          <button
            onClick={() => setMode("voice")}
            className={`text-xs px-3 py-1 rounded ${
              mode === "voice" ? "bg-[#3DDC97] text-[#0A0C10]" : "text-[#8A90A6]"
            }`}
          >
            Voice + Face
          </button>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 max-w-2xl w-full mx-auto space-y-3">
        {mode === "voice" ? (
          <div className="flex flex-col items-center justify-center h-full text-[#8A90A6] text-sm">
            <div className="w-32 h-32 rounded-full border border-[#232838] flex items-center justify-center mb-4">
              <span className="text-xs">face/avatar placeholder</span>
            </div>
            Voice + face mode — coming soon
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg max-w-[80%] text-sm ${
                  msg.role === "user"
                    ? "bg-[#3DDC97] text-[#0A0C10] ml-auto"
                    : "bg-[#12151C] border border-[#232838]"
                }`}
              >
                {msg.content}
              </div>
            ))}
            {loading && <div className="text-[#8A90A6] text-sm">Thinking...</div>}
          </>
        )}
      </div>

      {/* Input */}
      {mode === "text" && (
        <div className="border-t border-[#232838] px-6 py-4">
          <div className="max-w-2xl mx-auto flex gap-2">
            <input
              className="flex-1 bg-[#12151C] border border-[#232838] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#3DDC97]"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
            />
            <button
              onClick={handleSend}
              className="bg-[#3DDC97] text-[#0A0C10] px-4 py-2 rounded-lg text-sm font-medium"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}