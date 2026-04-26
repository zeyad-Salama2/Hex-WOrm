"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCreateCampaign } from "@/src/hooks/useCampaigns";
import {
  formatDatetimeLocal,
  getScheduleWindow,
  validateScheduledAtValue,
} from "@/src/lib/campaignSchedule";
import type { CampaignStatus } from "@/src/lib/api/campaigns";

const statusOptions: Array<{
  value: CampaignStatus;
  label: string;
  description: string;
}> = [
  { value: "DRAFT", label: "Draft", description: "Create the campaign without a delivery schedule yet." },
  { value: "SCHEDULED", label: "Scheduled", description: "Save the campaign with a planned send time." },
  { value: "SENT", label: "Sent", description: "Create the campaign and attempt to send immediately." },
];

function toIsoString(value: string) {
  return new Date(value).toISOString();
}

export default function NewCampaignPage() {
  const router = useRouter();
  const { create, isCreating, error, successMessage } = useCreateCampaign();
  const [name, setName] = useState("");
  const [status, setStatus] = useState<CampaignStatus>("DRAFT");
  const [scheduledAt, setScheduledAt] = useState("");
  const [targets, setTargets] = useState("");
  const [formError, setFormError] = useState("");
  const [scheduleError, setScheduleError] = useState("");
  const scheduleWindow = getScheduleWindow();

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    const parsedTargets = targets
      .split(",")
      .map((email) => email.trim())
      .filter(Boolean);
    const uniqueTargets = Array.from(new Set(parsedTargets));

    if (!trimmedName) {
      setFormError("Campaign name is required.");
      return;
    }

    if (!statusOptions.some((option) => option.value === status)) {
      setFormError("Please choose a valid campaign status.");
      return;
    }

    const scheduleValidation = validateScheduledAtValue(scheduledAt, {
      required: status === "SCHEDULED",
    });
    if (scheduleValidation.error) {
      setScheduleError(scheduleValidation.error);
      setFormError(scheduleValidation.error);
      return;
    }

    if (status === "SENT" && parsedTargets.length === 0) {
      setFormError("A sent campaign needs at least one target email.");
      return;
    }

    if (uniqueTargets.some((email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
      setFormError("Target emails must be valid email addresses separated by commas.");
      return;
    }

    setFormError("");
    setScheduleError("");

    try {
      const result = await create({
        name: trimmedName,
        status,
        scheduledAt: scheduledAt ? toIsoString(scheduledAt) : undefined,
        targets: uniqueTargets,
      });

      const params = new URLSearchParams({ created: "1" });
      if (result.message) {
        params.set("message", result.message);
      }
      if (result.emailDelivery?.status) {
        params.set("emailStatus", result.emailDelivery.status);
      }

      router.push(`/campaigns/${result.campaign.id}?${params.toString()}`);
    } catch {
      // Hook exposes API error state for display.
    }
  };

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-4xl font-semibold text-[color:var(--text)]">Create Campaign</h2>
        <p className="mt-3 text-base text-[color:var(--muted)]">
          Create a phishing simulation campaign and set its initial status and schedule.
        </p>
      </div>

      <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--panel2)] p-6">
        <div className="rounded-xl border border-[color:var(--border)] bg-white/[0.02] p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Campaign Details</p>
            <h3 className="mt-2 text-xl font-semibold text-[color:var(--text)]">Set up the campaign</h3>
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              Give the campaign a clear internal name, choose its initial status, and optionally schedule it.
            </p>
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <label htmlFor="campaign-name" className="text-sm font-medium text-[color:var(--muted)]">
                Campaign Name
              </label>
              <input
                id="campaign-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={isCreating}
                className="mt-2 w-full rounded-xl border border-[color:var(--border)] bg-white/5 px-4 py-3 text-sm text-[color:var(--text)] outline-none transition focus:border-cyan-400/30"
                placeholder="Quarterly credential awareness simulation"
              />
            </div>

            <div>
              <label htmlFor="campaign-targets" className="text-sm font-medium text-[color:var(--muted)]">
                Target Emails
              </label>
              <textarea
                id="campaign-targets"
                value={targets}
                onChange={(event) => setTargets(event.target.value)}
                disabled={isCreating}
                rows={4}
                className="mt-2 w-full rounded-xl border border-[color:var(--border)] bg-white/5 px-4 py-3 text-sm text-[color:var(--text)] outline-none transition focus:border-cyan-400/30"
                placeholder="employee1@company.com, employee2@company.com"
              />
              <p className="mt-2 text-xs text-[color:var(--muted)]">
                Enter one or more target email addresses, separated by commas.
              </p>
            </div>

            <div>
              <label htmlFor="campaign-status" className="text-sm font-medium text-[color:var(--muted)]">
                Status
              </label>
              <select
                id="campaign-status"
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value as CampaignStatus);
                  if (scheduleError) {
                    setScheduleError("");
                  }
                }}
                disabled={isCreating}
                className="mt-2 w-full rounded-xl border border-[color:var(--border)] bg-white/5 px-4 py-3 text-sm text-[color:var(--text)] outline-none transition focus:border-cyan-400/30"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-slate-900">
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-[color:var(--muted)]">
                {statusOptions.find((option) => option.value === status)?.description}
              </p>
            </div>

            <div>
              <label htmlFor="campaign-scheduled-at" className="text-sm font-medium text-[color:var(--muted)]">
                Scheduled Date & Time
              </label>
              <input
                id="campaign-scheduled-at"
                type="datetime-local"
                value={scheduledAt}
                onChange={(event) => {
                  setScheduledAt(event.target.value);
                  if (scheduleError) {
                    setScheduleError("");
                  }
                }}
                disabled={isCreating}
                min={formatDatetimeLocal(scheduleWindow.min)}
                max={formatDatetimeLocal(scheduleWindow.max)}
                aria-invalid={scheduleError ? "true" : "false"}
                className="mt-2 w-full rounded-xl border border-[color:var(--border)] bg-white/5 px-4 py-3 text-sm text-[color:var(--text)] outline-none transition focus:border-cyan-400/30"
              />
              <p className="mt-2 text-xs text-[color:var(--muted)]">
                Leave this blank unless you want to schedule the campaign for a specific date and time. Scheduling is
                limited to now through 50 years ahead.
              </p>
              {scheduleError && (
                <p className="mt-2 text-xs text-rose-300">{scheduleError}</p>
              )}
            </div>
          </div>
        </div>

        {(formError || error) && (
          <p className="mt-6 rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {formError || error}
          </p>
        )}

        {successMessage && (
          <p className="mt-6 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {successMessage}
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={() => router.push("/campaigns")}
            disabled={isCreating}
            className="rounded-xl border border-[color:var(--border)] bg-white/5 px-4 py-2.5 text-sm font-semibold text-[color:var(--text)] transition-colors duration-200 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={isCreating}
            className="rounded-xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-300 transition-colors duration-200 hover:border-cyan-400/30 hover:bg-cyan-500/15 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCreating ? "Creating..." : "Create Campaign"}
          </button>
        </div>
      </div>
    </section>
  );
}
