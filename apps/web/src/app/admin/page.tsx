"use client";

import { useState } from "react";

const SECTIONS = [
  { id: "facts", label: "Facts" },
  { id: "memories", label: "Memories" },
  { id: "persona", label: "Persona & Behavior" },
  { id: "character", label: "Character & Voice" },
];

// Placeholder data — will be replaced by real API calls once admin endpoints exist
const MOCK_FACTS = [
  { category: "language", key: "german_proficiency", value: "B1" },
  { category: "education", key: "status", value: "graduate" },
];

const MOCK_MEMORIES = [
  { text: "I arrived in Germany to begin my studies.", timestamp: "2021-09-01" },
  { text: "I finished university and graduated with my Computer Science degree.", timestamp: "2026-04-30" },
];

export default function Admin() {
  const [activeSection, setActiveSection] = useState("facts");

  return (
    <div className="min-h-screen bg-[#0A0C10] text-[#E6E9F2] flex">
      {/* Sidebar */}
      <div className="w-56 border-r border-[#232838] p-4">
        <div className="font-[family-name:var(--font-display)] font-bold mb-6">Aime Admin</div>
        <div className="space-y-1">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`w-full text-left text-sm px-3 py-2 rounded-md transition ${
                activeSection === s.id
                  ? "bg-[#12151C] text-[#3DDC97] border border-[#232838]"
                  : "text-[#8A90A6] hover:text-[#E6E9F2]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-8">
        {activeSection === "facts" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-lg font-bold">Facts</h1>
              <button className="bg-[#3DDC97] text-[#0A0C10] text-sm px-4 py-2 rounded-md font-medium">
                Add fact
              </button>
            </div>
            <div className="border border-[#232838] rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#12151C] text-[#8A90A6] text-left">
                  <tr>
                    <th className="px-4 py-3 font-normal">Category</th>
                    <th className="px-4 py-3 font-normal">Key</th>
                    <th className="px-4 py-3 font-normal">Value</th>
                    <th className="px-4 py-3 font-normal"></th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_FACTS.map((f, i) => (
                    <tr key={i} className="border-t border-[#232838]">
                      <td className="px-4 py-3 font-mono text-xs text-[#8A90A6]">{f.category}</td>
                      <td className="px-4 py-3 font-mono text-xs">{f.key}</td>
                      <td className="px-4 py-3">{f.value}</td>
                      <td className="px-4 py-3 text-right">
                        <button className="text-xs text-[#3DDC97]">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === "memories" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-lg font-bold">Memories</h1>
              <button className="bg-[#3DDC97] text-[#0A0C10] text-sm px-4 py-2 rounded-md font-medium">
                Add memory
              </button>
            </div>
            <div className="space-y-3">
              {MOCK_MEMORIES.map((m, i) => (
                <div key={i} className="border border-[#232838] rounded-lg p-4">
                  <div className="font-mono text-xs text-[#3DDC97] mb-2">{m.timestamp}</div>
                  <p className="text-sm">{m.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === "persona" && (
          <div>
            <h1 className="text-lg font-bold mb-6">Persona & Behavior</h1>
            <p className="text-sm text-[#8A90A6]">
              Persona configuration (access levels, system prompt tuning) — coming once the
              backend persona layer is built.
            </p>
          </div>
        )}

        {activeSection === "character" && (
          <div>
            <h1 className="text-lg font-bold mb-6">Character & Voice</h1>
            <p className="text-sm text-[#8A90A6]">
              Avatar generation and voice selection — planned for a later phase, per the
              architecture roadmap.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}