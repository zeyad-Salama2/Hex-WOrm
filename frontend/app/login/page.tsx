"use client";
// This page needs browser-only features (form events, router navigation, document.cookie),
// so we mark it as a Client Component.

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Zod schema defines the shape + rules for our login form data.
// - email must be a valid email format
// - password must be at least 6 characters
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

// Infer TypeScript type directly from schema so types stay in sync with validation rules.
type LoginForm = z.infer<typeof loginSchema>;

function setAuthCookie(token: string) {
  document.cookie = `token=${token}; path=/`;
}

function buildApiUrl(path: string) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:4000";

  return new URL(path, `${apiBaseUrl.replace(/\/$/, "")}/`).toString();
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegistered = searchParams.get("registered") === "1";
  const [submitError, setSubmitError] = useState("");

  // useForm manages form state for us.
  // - register: wires each input to React Hook Form
  // - handleSubmit: runs validation then calls onValidSubmit when data is valid
  // - formState.errors: contains field-level validation messages from Zod
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: "onChange", // Re-validate while typing so button state updates live.
    defaultValues: {
      email: "",
      password: "",
    },
  });


  // onValidSubmit is called when the form is valid , you can call your API here
  const onValidSubmit = async (data: LoginForm) => {
    setSubmitError("");
    try {
      const loginUrl = buildApiUrl("login");
      console.log("[login] NEXT_PUBLIC_API_URL:", process.env.NEXT_PUBLIC_API_URL);
      console.log("[login] final request URL:", loginUrl);

      const response = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      console.log("[login] response status:", response.status);

      if (!response.ok) {
        let errorMessage = "Login failed. Please try again.";
        try {
          const payload = (await response.json()) as { message?: string; msg?: string };
          console.log("[login] error payload:", payload);
          if (payload?.message || payload?.msg) {
            errorMessage = payload.message || payload.msg || errorMessage;
          }
        } catch {
          console.log("[login] error payload: unable to parse response body");
          // Ignore JSON parse errors and keep default message.
        }
        setSubmitError(errorMessage);
        return;
      }

      const payload = (await response.json()) as { token?: string };
      console.log("[login] success payload:", payload);
      if (!payload.token) {
        setSubmitError("Login failed. No token was returned.");
        return;
      }

      setAuthCookie(payload.token);
      router.push("/dashboard");
    } catch (error) {
      console.error("[login] request failed:", error);
      setSubmitError("Unable to reach the backend. Check that the API server is running.");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-slate-900 px-6 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30" />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl animate-[pulse_8s_ease-in-out_infinite]" />

      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl transition duration-300 hover:-translate-y-0.5">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
            <Image
              src="/logo.png"
              alt="HexWOrm logo"
              width={52}
              height={52}
              className="block"
              priority
            />
          </div>

          <div className="space-y-2">
            <p className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-300">
              Welcome back
            </p>
            <h1 className="text-2xl font-semibold text-white">Sign in to HexWOrm</h1>
            <p className="text-sm text-zinc-300">
              Use your admin credentials to access the phishing simulation dashboard.
            </p>
          </div>
        </div>

        {isRegistered && (
          <p className="mt-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
            Account created successfully. Please sign in.
          </p>
        )}

        <form onSubmit={handleSubmit(onValidSubmit)} className="mt-8 space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-zinc-200">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register("email")}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-zinc-400 transition hover:border-white/20 focus:border-emerald-400/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
              placeholder="admin@company.com"
              autoComplete="email"
            />
            {errors.email && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-zinc-200">
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register("password")}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-zinc-400 transition hover:border-white/20 focus:border-emerald-400/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
              placeholder="At least 6 characters"
              autoComplete="current-password"
            />
            {errors.password && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/10 transition duration-200 hover:scale-[1.01] hover:from-emerald-400 hover:to-cyan-400 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>

          {submitError && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {submitError}
            </p>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-zinc-300">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-emerald-300 transition hover:text-emerald-200">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
