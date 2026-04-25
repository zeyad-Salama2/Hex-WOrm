"use client";
// This page uses client-side form handling (React Hook Form), backend requests,
// and router navigation, so it must be a Client Component.

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { getAuthTokenFromCookie, requestJson } from "@/src/lib/api/client";

// Zod schema defines field rules and cross-field validation.
// - email: valid email format
// - password: minimum 8 chars, one uppercase letter, one number
// - confirmPassword: must match password
const registerSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, "Email is required.")
      .email("Please enter a valid email address."),
    password: z
      .string()
      .min(1, "Password is required.")
      .min(8, "Password must be at least 8 characters long.")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
      .regex(/\d/, "Password must contain at least one number."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

// Infer the TS type directly from schema so validation + types always stay in sync.
type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");
  const [isCheckingAuth] = useState(() => Boolean(getAuthTokenFromCookie()));

  useEffect(() => {
    if (isCheckingAuth) {
      router.replace("/dashboard");
    }
  }, [isCheckingAuth, router]);

  // useForm wires inputs to form state + validation.
  // - register: connects each input
  // - handleSubmit: runs validation before calling onValidSubmit
  // - formState.errors: contains per-field messages from Zod
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: "onChange", // Validate while typing so UI feedback and button state are live.
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onValidSubmit = async (data: RegisterForm) => {
    // Clear previous API error before a new attempt.
    setSubmitError("");
    try {
      await requestJson<{ createdUser: { id: number; email: string } }>(
        "register",
        {
          method: "POST",
          body: JSON.stringify({
            email: data.email,
            password: data.password,
          }),
        },
        { fallbackMessage: "Registration failed. Please try again." }
      );
    } catch (error: unknown) {
      const message = error instanceof Error
        ? error.message
        : "Unable to reach the backend. Check that the API server is running.";
      setSubmitError(message);
      return;
    }

    // Success path: keep it simple for now, then send user to login.
    router.push("/login?registered=1");
  };

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-slate-900 text-zinc-300">
        Checking session...
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-slate-900 px-6 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30" />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl animate-[pulse_8s_ease-in-out_infinite]" />

      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl transition duration-300 hover:-translate-y-0.5">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
              <Image
                src="/logo-20260324.png"
                alt="HexWOrm logo"
                width={52}
                height={52}
              className="block"
              priority
            />
          </div>

          <div className="space-y-2">
            <p className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-300">
              Create Account
            </p>
            <h1 className="text-2xl font-semibold text-white">Register for HexWOrm</h1>
            <p className="text-sm text-zinc-300">
              Create your admin account to access the phishing simulation dashboard.
            </p>
          </div>
        </div>

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
              placeholder="At least 8 characters, 1 uppercase, 1 number"
              autoComplete="new-password"
            />
            {errors.password && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-200">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword")}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-zinc-400 transition hover:border-white/20 focus:border-emerald-400/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
              placeholder="Re-enter password"
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/10 transition duration-200 hover:scale-[1.01] hover:from-emerald-400 hover:to-cyan-400 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>

          {submitError && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {submitError}
            </p>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-zinc-300">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-emerald-300 transition hover:text-emerald-200">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
