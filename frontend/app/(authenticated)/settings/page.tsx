"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePassword } from "@/src/lib/api/settings";
import {
  changePasswordSchema,
  MIN_PASSWORD_LENGTH,
  type ChangePasswordForm,
} from "@/src/lib/passwordValidation";

export default function SettingsPage() {
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onChange",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const onSubmit = async (data: ChangePasswordForm) => {
    setSubmitError("");
    setSuccessMessage("");

    try {
      const payload = await changePassword(data);
      setSuccessMessage(payload.message || "Password updated successfully.");
      reset();
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Unable to reach the backend. Check your network and API server.";
      setSubmitError(message);
    }
  };

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-4xl font-semibold text-[color:var(--text)]">Settings</h2>
        <p className="mt-3 text-base text-[color:var(--muted)]">
          Manage your account security and update your password without affecting your current session.
        </p>
      </div>

      <div className="max-w-3xl rounded-xl border border-[color:var(--border)] bg-[color:var(--panel2)] p-6">
        <div className="rounded-xl border border-[color:var(--border)] bg-white/[0.02] p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Account Security</p>
            <h3 className="mt-2 text-xl font-semibold text-[color:var(--text)]">Change Password</h3>
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              Enter your current password and choose a new one with at least {MIN_PASSWORD_LENGTH} characters.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
            <div>
              <label htmlFor="currentPassword" className="text-sm font-medium text-[color:var(--muted)]">
                Current Password
              </label>
              <input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                {...register("currentPassword")}
                disabled={isSubmitting}
                className="mt-2 w-full rounded-xl border border-[color:var(--border)] bg-white/5 px-4 py-3 text-sm text-[color:var(--text)] outline-none transition focus:border-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Enter your current password"
              />
              {errors.currentPassword && (
                <p className="mt-2 text-sm text-rose-300">{errors.currentPassword.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="newPassword" className="text-sm font-medium text-[color:var(--muted)]">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                {...register("newPassword")}
                disabled={isSubmitting}
                className="mt-2 w-full rounded-xl border border-[color:var(--border)] bg-white/5 px-4 py-3 text-sm text-[color:var(--text)] outline-none transition focus:border-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
              />
              {errors.newPassword && (
                <p className="mt-2 text-sm text-rose-300">{errors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmNewPassword" className="text-sm font-medium text-[color:var(--muted)]">
                Confirm New Password
              </label>
              <input
                id="confirmNewPassword"
                type="password"
                autoComplete="new-password"
                {...register("confirmNewPassword")}
                disabled={isSubmitting}
                className="mt-2 w-full rounded-xl border border-[color:var(--border)] bg-white/5 px-4 py-3 text-sm text-[color:var(--text)] outline-none transition focus:border-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Re-enter your new password"
              />
              {errors.confirmNewPassword && (
                <p className="mt-2 text-sm text-rose-300">{errors.confirmNewPassword.message}</p>
              )}
            </div>

            {submitError && (
              <p className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                {submitError}
              </p>
            )}

            {successMessage && (
              <p className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                {successMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="rounded-xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-300 transition-colors duration-200 hover:border-cyan-400/30 hover:bg-cyan-500/15 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Updating Password..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
