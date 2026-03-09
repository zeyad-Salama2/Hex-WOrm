"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useCreateCampaign } from "@/src/hooks/useCampaigns";

const audienceOptions = ["All Staff", "Finance", "HR", "Engineering", "Remote Teams"] as const;
const templateOptions = ["Credential Harvest", "Invoice Attachment", "VPN Reset"] as const;
const steps = ["Details", "Audience", "Template", "Schedule"] as const;

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="m9.6 16.2-3.8-3.8L4.4 14l5.2 5.2L20 8.8l-1.4-1.4-9 8.8z" fill="currentColor" />
    </svg>
  );
}

export default function NewCampaignPage() {
  const router = useRouter();
  const { create, isCreating, error } = useCreateCampaign();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [audience, setAudience] = useState<(typeof audienceOptions)[number]>("All Staff");
  const [template, setTemplate] = useState<(typeof templateOptions)[number]>("Credential Harvest");
  const [scheduleMode, setScheduleMode] = useState<"now" | "scheduled">("now");
  const [scheduledAt, setScheduledAt] = useState("");
  const [formError, setFormError] = useState("");

  const isLastStep = step === steps.length - 1;

  const stepContent = useMemo(() => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[color:var(--muted)]">Campaign Name</label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-2 w-full rounded-xl border border-[color:var(--border)] bg-white/5 px-4 py-3 text-sm text-[color:var(--text)] outline-none transition focus:border-cyan-400/30"
                placeholder="Q1 Credential Harvest Simulation"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[color:var(--muted)]">Description</label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={5}
                className="mt-2 w-full rounded-xl border border-[color:var(--border)] bg-white/5 px-4 py-3 text-sm text-[color:var(--text)] outline-none transition focus:border-cyan-400/30"
                placeholder="Optional notes for internal operators"
              />
            </div>
          </div>
        );
      case 1:
        return (
          <div>
            <label className="text-sm font-medium text-[color:var(--muted)]">Audience</label>
            <select
              value={audience}
              onChange={(event) => setAudience(event.target.value as (typeof audienceOptions)[number])}
              className="mt-2 w-full rounded-xl border border-[color:var(--border)] bg-white/5 px-4 py-3 text-sm text-[color:var(--text)] outline-none transition focus:border-cyan-400/30"
            >
              {audienceOptions.map((option) => (
                <option key={option} value={option} className="bg-slate-900">
                  {option}
                </option>
              ))}
            </select>
          </div>
        );
      case 2:
        return (
          <div>
            <label className="text-sm font-medium text-[color:var(--muted)]">Template</label>
            <select
              value={template}
              onChange={(event) => setTemplate(event.target.value as (typeof templateOptions)[number])}
              className="mt-2 w-full rounded-xl border border-[color:var(--border)] bg-white/5 px-4 py-3 text-sm text-[color:var(--text)] outline-none transition focus:border-cyan-400/30"
            >
              {templateOptions.map((option) => (
                <option key={option} value={option} className="bg-slate-900">
                  {option}
                </option>
              ))}
            </select>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setScheduleMode("now")}
                className={[
                  "rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors",
                  scheduleMode === "now"
                    ? "border-cyan-400/30 bg-cyan-500/10 text-cyan-300"
                    : "border-[color:var(--border)] bg-white/5 text-[color:var(--muted)] hover:bg-white/[0.04]",
                ].join(" ")}
              >
                Send Now
              </button>
              <button
                type="button"
                onClick={() => setScheduleMode("scheduled")}
                className={[
                  "rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors",
                  scheduleMode === "scheduled"
                    ? "border-cyan-400/30 bg-cyan-500/10 text-cyan-300"
                    : "border-[color:var(--border)] bg-white/5 text-[color:var(--muted)] hover:bg-white/[0.04]",
                ].join(" ")}
              >
                Schedule
              </button>
            </div>

            {scheduleMode === "scheduled" && (
              <div>
                <label className="text-sm font-medium text-[color:var(--muted)]">Schedule Date & Time</label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(event) => setScheduledAt(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-[color:var(--border)] bg-white/5 px-4 py-3 text-sm text-[color:var(--text)] outline-none transition focus:border-cyan-400/30"
                />
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  }, [step, name, description, audience, template, scheduleMode, scheduledAt]);

  const handleNext = async () => {
    if (step === 0 && !name.trim()) {
      setFormError("Campaign name is required.");
      return;
    }

    if (step === 3 && scheduleMode === "scheduled" && !scheduledAt) {
      setFormError("Please choose a schedule date and time.");
      return;
    }

    setFormError("");

    if (!isLastStep) {
      setStep((current) => current + 1);
      return;
    }

    try {
      await create({
        name: name.trim(),
        description: description.trim(),
        audience,
        template,
        scheduleMode,
        scheduledAt,
      });
      router.push("/campaigns?created=1");
    } catch {
      // Hook exposes the error state; nothing else needed here.
    }
  };

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-4xl font-semibold text-[color:var(--text)]">Create Campaign</h2>
        <p className="mt-3 text-base text-[color:var(--muted)]">
          Build a phishing simulation in four steps and prepare it for launch.
        </p>
      </div>

      <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--panel2)] p-6">
        <div className="grid gap-3 md:grid-cols-4">
          {steps.map((label, index) => {
            const isActive = index === step;
            const isComplete = index < step;

            return (
              <div
                key={label}
                className={[
                  "flex items-center gap-3 rounded-xl border px-4 py-3",
                  isActive
                    ? "border-cyan-400/30 bg-cyan-500/10"
                    : "border-[color:var(--border)] bg-white/[0.02]",
                ].join(" ")}
              >
                <div
                  className={[
                    "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold",
                    isComplete || isActive
                      ? "border-cyan-400/30 bg-cyan-500/10 text-cyan-300"
                      : "border-[color:var(--border)] text-[color:var(--muted)]",
                  ].join(" ")}
                >
                  {isComplete ? <CheckIcon className="h-4 w-4" /> : index + 1}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">Step {index + 1}</p>
                  <p className={isActive ? "text-sm font-medium text-[color:var(--text)]" : "text-sm font-medium text-[color:var(--muted)]"}>
                    {label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 rounded-xl border border-[color:var(--border)] bg-white/[0.02] p-6">
          {stepContent}

          {(formError || error) && (
            <p className="mt-4 rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              {formError || error}
            </p>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={() => {
                setFormError("");
                setStep((current) => Math.max(0, current - 1));
              }}
              disabled={step === 0 || isCreating}
              className="rounded-xl border border-[color:var(--border)] bg-white/5 px-4 py-2.5 text-sm font-semibold text-[color:var(--text)] transition-colors duration-200 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Back
            </button>

            <button
              type="button"
              onClick={() => void handleNext()}
              disabled={isCreating}
              className="rounded-xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-300 transition-colors duration-200 hover:border-cyan-400/30 hover:bg-cyan-500/15 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCreating ? "Creating..." : isLastStep ? "Create Campaign" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
