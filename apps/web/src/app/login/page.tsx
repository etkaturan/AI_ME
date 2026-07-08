"use client";

import { useState } from "react";

export default function Login() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  function validatePassword(pw: string): string | null {
    if (pw.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(pw)) return "Password must include an uppercase letter.";
    if (!/[0-9]/.test(pw)) return "Password must include a number.";
    return null;
  }

  function handleSubmit() {
    setError("");

    if (mode === "signup") {
      const pwError = validatePassword(password);
      if (pwError) {
        setError(pwError);
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    // Placeholder — real auth wiring comes once backend auth is built
    console.log("Submitting:", { mode, email, username, password });
  }

  return (
    <div className="min-h-screen bg-[#0A0C10] text-[#E6E9F2] flex items-center justify-center px-4">
      <div className="w-full max-w-sm border border-[#232838] rounded-lg p-8">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold mb-1">
          Aime
        </h1>
        <p className="text-sm text-[#8A90A6] mb-6">
          {mode === "signin" ? "Sign in to continue" : "Create your account"}
        </p>

        <button
          className="w-full border border-[#232838] rounded-md py-2.5 mb-4 text-sm hover:border-[#3DDC97] transition"
          onClick={() => console.log("Google OAuth placeholder")}
        >
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-[#232838]" />
          <span className="text-xs text-[#8A90A6]">or</span>
          <div className="flex-1 h-px bg-[#232838]" />
        </div>

        <div className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#12151C] border border-[#232838] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#3DDC97]"
          />

          {mode === "signup" && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#12151C] border border-[#232838] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#3DDC97]"
            />
          )}

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#12151C] border border-[#232838] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#3DDC97]"
          />

          {mode === "signup" && (
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-[#12151C] border border-[#232838] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#3DDC97]"
            />
          )}

          {mode === "signup" && (
            <p className="text-xs text-[#8A90A6]">
              Minimum 8 characters, one uppercase letter, one number.
            </p>
          )}

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            onClick={handleSubmit}
            className="w-full bg-[#3DDC97] text-[#0A0C10] font-medium rounded-md py-2.5 text-sm hover:opacity-90 transition"
          >
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </div>

        <p className="text-xs text-[#8A90A6] mt-6 text-center">
          {mode === "signin" ? (
            <>
              Don&apos;t have an account?{" "}
              <button className="text-[#3DDC97]" onClick={() => setMode("signup")}>
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button className="text-[#3DDC97]" onClick={() => setMode("signin")}>
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}