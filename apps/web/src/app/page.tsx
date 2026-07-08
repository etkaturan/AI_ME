"use client";

import { useEffect, useState } from "react";

const fragments = [
  "identity · initializing",
  "facts · versioned",
  "memories · embedded",
  "timeline · reconstructed",
  "persona · calibrated",
  "voice · synthesized",
  "identity · resolved",
];

export default function Landing() {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < fragments.length) {
        setVisibleLines((prev) => [...prev, fragments[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 350);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0C10] text-[#E6E9F2] flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-[#232838]">
        <span className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight">
          Aime
        </span>
        <a
          href="/login"
          className="text-sm border border-[#232838] px-4 py-2 rounded-md hover:border-[#3DDC97] transition"
        >
          Sign in
        </a>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center px-8 py-16 gap-12">
        <div className="font-mono text-sm text-[#8A90A6] space-y-2 w-full md:w-1/3 border-l border-[#232838] pl-4">
          {visibleLines.map((line, i) => (
            <div
              key={i}
              className="opacity-0 animate-[fadeIn_0.4s_ease-out_forwards]"
              style={{ color: i === visibleLines.length - 1 ? "#3DDC97" : undefined }}
            >
              {line}
            </div>
          ))}
          <span className="inline-block w-2 h-4 bg-[#3DDC97] animate-pulse" />
        </div>

        <div className="w-full md:w-2/3 max-w-xl">
          <h1 className="font-[family-name:var(--font-display)] text-5xl md:text-6xl font-bold tracking-tight">
            Aime
          </h1>
          <p className="mt-2 text-lg text-[#8A90A6]">
            A digital twin, built from real facts and memories — not invented ones.
          </p>
          <p className="mt-6 text-[#E6E9F2]/80 leading-relaxed">
            Aime is a personal AI system grounded in versioned, timestamped truth. Every
            answer traces back to a real, sourced fact or memory — never a guess. Build
            your own, or create a character entirely of your design.
          </p>
          <div className="mt-8 flex gap-4">
            <a
              href="/login"
              className="bg-[#3DDC97] text-[#0A0C10] font-medium px-5 py-2.5 rounded-md hover:opacity-90 transition"
            >
              Get started
            </a>
            <a
              href="/chat"
              className="border border-[#232838] text-[#E6E9F2] px-5 py-2.5 rounded-md hover:border-[#3DDC97] transition"
            >
              See a live demo
            </a>
          </div>
        </div>
      </div>

      {/* Feature strip */}
      <div className="border-t border-[#232838] px-8 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="font-mono text-xs text-[#3DDC97] mb-2">grounded</div>
          <p className="text-sm text-[#8A90A6]">
            No fabricated biography. Answers come from real, versioned facts and
            timestamped memories.
          </p>
        </div>
        <div>
          <div className="font-mono text-xs text-[#3DDC97] mb-2">flexible</div>
          <p className="text-sm text-[#8A90A6]">
            Text, voice, or an animated face — switch interfaces without switching who
            you're talking to.
          </p>
        </div>
        <div>
          <div className="font-mono text-xs text-[#3DDC97] mb-2">yours</div>
          <p className="text-sm text-[#8A90A6]">
            Build your own digital twin, or create an entirely original character.
          </p>
        </div>
      </div>
    </div>
  );
}