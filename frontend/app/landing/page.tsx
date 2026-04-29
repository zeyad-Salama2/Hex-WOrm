"use client";

import { FormEvent, useMemo, useState } from "react";
import { buildApiUrl } from "@/src/lib/api/client";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = useMemo(() => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(window.location.search);
    return params.get("token") || "";
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!token) {
      setMessage("Missing tracking token.");
      return;
    }

    if (!email.trim() || !password.trim()) {
      setMessage("Please enter both email and password.");
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage("");

      const response = await fetch(buildApiUrl("/track/submit"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit.");
      }

      setMessage("Login failed. Please contact your administrator.");
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-2xl font-semibold">Account Verification</h1>
        <p className="mt-2 text-sm text-slate-300">
          Please sign in to verify your account access.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm text-slate-300">Email</label>
            <input
              type="email"
              className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300">Password</label>
            <input
              type="password"
              className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-cyan-500 px-4 py-3 font-medium text-slate-950 disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Sign in"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-sm text-amber-300">{message}</p>
        )}
      </div>
    </main>
  );
}