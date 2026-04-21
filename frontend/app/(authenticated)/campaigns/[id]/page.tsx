"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  useCampaign,
  useDeleteCampaign,
  useSendTestEmail,
  useUpdateCampaign,
} from "@/src/hooks/useCampaigns";
import {
  formatDatetimeLocal,
  getScheduleWindow,
  validateScheduledAtValue,
} from "@/src/lib/campaignSchedule";
import type { Campaign, CampaignStatus, UpdateCampaignInput } from "@/src/lib/api/campaigns";

function getStatusClasses(status: CampaignStatus) {
  switch (status) {
    case "DRAFT":
      return "border-white/10 bg-white/5 text-slate-300";
    case "SCHEDULED":
      return "border-blue-400/20 bg-blue-500/10 text-blue-300";
    case "SENT":
      return "border-emerald-400/20 bg-emerald-500/10 text-emerald-300";
    default:
      return "border-white/10 bg-white/5 text-slate-300";
  }
}

function formatStatusLabel(status: CampaignStatus) {
  switch (status) {
    case "DRAFT":
      return "Draft";
    case "SCHEDULED":
      return "Scheduled";
    case "SENT":
      return "Sent";
    default:
      return status;
  }
}

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "Not scheduled";
  }

  return new Date(value).toLocaleString();
}

function toDatetimeLocal(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function toIsoString(value: string) {
  return new Date(value).toISOString();
}

const statusOptions: CampaignStatus[] = ["DRAFT", "SCHEDULED", "SENT"];

function CampaignEditor({
  campaign,
  onRefresh,
}: {
  campaign: Campaign;
  onRefresh: () => Promise<void>;
}) {
  const router = useRouter();
  const { update, isUpdating, error: updateError, successMessage: updateSuccessMessage } = useUpdateCampaign();
  const { remove, isDeleting, error: deleteError, successMessage: deleteSuccessMessage } = useDeleteCampaign();
  const { send, isSending, error: sendError, successMessage: sendSuccessMessage, previewUrl } = useSendTestEmail();
  const [name, setName] = useState(campaign.name);
  const [status, setStatus] = useState<CampaignStatus>(campaign.status);
  const [scheduledAt, setScheduledAt] = useState(toDatetimeLocal(campaign.scheduledAt));
  const [testEmailTo, setTestEmailTo] = useState(campaign.createdBy?.email ?? "");
  const [formError, setFormError] = useState("");
  const [scheduleError, setScheduleError] = useState("");
  const [sendFormError, setSendFormError] = useState("");
  const scheduleWindow = getScheduleWindow();

  const handleUpdate = async () => {
    const trimmedName = name.trim();
    const currentScheduledAt = toDatetimeLocal(campaign.scheduledAt);
    const scheduleChanged = scheduledAt !== currentScheduledAt;

    if (!trimmedName) {
      setFormError("Campaign name is required.");
      return;
    }

    if (!statusOptions.includes(status)) {
      setFormError("Please choose a valid campaign status.");
      return;
    }

    if (scheduleChanged || (status === "SCHEDULED" && status !== campaign.status)) {
      const scheduleValidation = validateScheduledAtValue(scheduledAt, {
        required: status === "SCHEDULED",
      });
      if (scheduleValidation.error) {
        setScheduleError(scheduleValidation.error);
        setFormError(scheduleValidation.error);
        return;
      }
    }

    const payload: UpdateCampaignInput = {};

    if (trimmedName !== campaign.name) {
      payload.name = trimmedName;
    }

    if (status !== campaign.status) {
      payload.status = status;
    }

    if (scheduledAt !== currentScheduledAt) {
      payload.scheduledAt = scheduledAt ? toIsoString(scheduledAt) : null;
    }

    if (Object.keys(payload).length === 0) {
      setFormError("Provide at least one change before saving.");
      return;
    }

    setFormError("");
    setScheduleError("");

    try {
      await update(campaign.id, payload);
      await onRefresh();
    } catch {
      // Hook exposes update error state.
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Delete this campaign permanently?");
    if (!confirmed) {
      return;
    }

    setFormError("");

    try {
      await remove(campaign.id);
      router.push("/campaigns?deleted=1");
    } catch {
      // Hook exposes deletion error state.
    }
  };

  const handleSendTestEmail = async () => {
    const trimmedTo = testEmailTo.trim();
    const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedTo);

    if (!trimmedTo) {
      setSendFormError("Recipient email is required.");
      return;
    }

    if (!looksLikeEmail) {
      setSendFormError("Please enter a valid recipient email.");
      return;
    }

    setSendFormError("");

    try {
      await send({ to: trimmedTo });
    } catch {
      // Hook exposes error state.
    }
  };

  return (
    <>
      {(updateError || deleteError || formError || sendError || sendFormError) && (
        <p className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {updateError || deleteError || formError || sendError || sendFormError}
        </p>
      )}

      {(updateSuccessMessage || deleteSuccessMessage || sendSuccessMessage) && (
        <p className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {updateSuccessMessage || deleteSuccessMessage || sendSuccessMessage}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
        <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--panel2)] p-6">
          <h3 className="text-lg font-semibold text-[color:var(--text)]">Campaign Settings</h3>
          <div className="mt-6 space-y-5">
            <div>
              <label htmlFor="campaign-name" className="text-sm font-medium text-[color:var(--muted)]">
                Campaign Name
              </label>
              <input
                id="campaign-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={isUpdating || isDeleting}
                className="mt-2 w-full rounded-xl border border-[color:var(--border)] bg-white/5 px-4 py-3 text-sm text-[color:var(--text)] outline-none transition focus:border-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Quarterly credential awareness simulation"
              />
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
                disabled={isUpdating || isDeleting}
                className="mt-2 w-full rounded-xl border border-[color:var(--border)] bg-white/5 px-4 py-3 text-sm text-[color:var(--text)] outline-none transition focus:border-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option} className="bg-slate-900">
                    {formatStatusLabel(option)}
                  </option>
                ))}
              </select>
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
                disabled={isUpdating || isDeleting}
                min={formatDatetimeLocal(scheduleWindow.min)}
                max={formatDatetimeLocal(scheduleWindow.max)}
                aria-invalid={scheduleError ? "true" : "false"}
                className="mt-2 w-full rounded-xl border border-[color:var(--border)] bg-white/5 px-4 py-3 text-sm text-[color:var(--text)] outline-none transition focus:border-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="mt-2 text-xs text-[color:var(--muted)]">
                Clear this field if you want the backend to store a null schedule. New schedules must be between now
                and 50 years ahead.
              </p>
              {scheduleError && (
                <p className="mt-2 text-xs text-rose-300">{scheduleError}</p>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={() => {
                setName(campaign.name);
                setStatus(campaign.status);
                setScheduledAt(toDatetimeLocal(campaign.scheduledAt));
                setFormError("");
                setScheduleError("");
              }}
              disabled={isUpdating || isDeleting}
              className="rounded-xl border border-[color:var(--border)] bg-white/5 px-4 py-2.5 text-sm font-semibold text-[color:var(--text)] transition-colors duration-200 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reset
            </button>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={isUpdating || isDeleting}
                className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-2.5 text-sm font-semibold text-rose-300 transition-colors duration-200 hover:border-rose-400/30 hover:bg-rose-500/15 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Campaign"}
              </button>

              <button
                type="button"
                onClick={() => void handleUpdate()}
                disabled={isUpdating || isDeleting}
                className="rounded-xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-300 transition-colors duration-200 hover:border-cyan-400/30 hover:bg-cyan-500/15 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUpdating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--panel2)] p-6">
            <h3 className="text-lg font-semibold text-[color:var(--text)]">Campaign Overview</h3>
            <dl className="mt-6 space-y-4">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">Created At</dt>
                <dd className="mt-2 text-sm text-[color:var(--text)]">{formatDateTime(campaign.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">Scheduled At</dt>
                <dd className="mt-2 text-sm text-[color:var(--text)]">{formatDateTime(campaign.scheduledAt)}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">Status</dt>
                <dd className="mt-2 text-sm text-[color:var(--text)]">{formatStatusLabel(campaign.status)}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--panel2)] p-6">
            <h3 className="text-lg font-semibold text-[color:var(--text)]">Ownership & Activity</h3>
            <dl className="mt-6 space-y-4">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">Created By</dt>
                <dd className="mt-2 text-sm text-[color:var(--text)]">{campaign.createdBy?.email ?? "Unavailable"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">Role</dt>
                <dd className="mt-2 text-sm text-[color:var(--text)]">{campaign.createdBy?.role ?? "Unavailable"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">Targets</dt>
                <dd className="mt-2 text-sm text-[color:var(--text)]">{campaign._count?.targets ?? 0}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">Events</dt>
                <dd className="mt-2 text-sm text-[color:var(--text)]">{campaign._count?.events ?? 0}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--panel2)] p-6">
            <h3 className="text-lg font-semibold text-[color:var(--text)]">Email Action</h3>
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              Send a backend-generated test email via <code>POST /send-test-email</code>.
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <label htmlFor="test-email-to" className="text-sm font-medium text-[color:var(--muted)]">
                  Recipient Email
                </label>
                <input
                  id="test-email-to"
                  value={testEmailTo}
                  onChange={(event) => setTestEmailTo(event.target.value)}
                  disabled={isSending}
                  placeholder="employee@company.com"
                  className="mt-2 w-full rounded-xl border border-[color:var(--border)] bg-white/5 px-4 py-3 text-sm text-[color:var(--text)] outline-none transition focus:border-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <button
                type="button"
                onClick={() => void handleSendTestEmail()}
                disabled={isSending}
                className="w-full rounded-xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-300 transition-colors duration-200 hover:border-cyan-400/30 hover:bg-cyan-500/15 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSending ? "Sending..." : "Send Test Email"}
              </button>
              {previewUrl && (
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex text-sm font-semibold text-cyan-300 transition-colors hover:text-cyan-200"
                >
                  Open Email Preview
                </a>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--panel2)] p-6">
            <h3 className="text-lg font-semibold text-[color:var(--text)]">Current Send Behavior</h3>
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              This backend sends campaign emails during campaign creation when status is <code>SENT</code> and
              target emails are provided.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default function CampaignDetailPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const campaignId = useMemo(() => {
    const parsed = Number(params.id);
    return Number.isNaN(parsed) ? null : parsed;
  }, [params.id]);
  const { data: campaign, isLoading, error, refetch } = useCampaign(campaignId);
  const showCreatedBanner = searchParams.get("created") === "1";

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-4xl font-semibold text-[color:var(--text)]">
              {isLoading ? "Loading campaign..." : campaign?.name ?? "Campaign"}
            </h2>
            {!isLoading && campaign?.status && (
              <span className={[
                "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold",
                getStatusClasses(campaign.status),
              ].join(" ")}>
                {formatStatusLabel(campaign.status)}
              </span>
            )}
          </div>
          <p className="mt-3 text-base text-[color:var(--muted)]">
            Review the campaign details, update its fields, or remove it entirely.
          </p>
        </div>

        <Link
          href="/campaigns"
          className="text-sm font-semibold text-cyan-300 transition-colors hover:text-cyan-200"
        >
          Back to Campaigns
        </Link>
      </div>

      {error && (
        <p className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </p>
      )}

      {showCreatedBanner && (
        <p className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          Campaign created successfully.
        </p>
      )}

      {isLoading && (
        <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--panel2)] p-6 text-sm text-[color:var(--muted)]">
          Loading campaign details...
        </div>
      )}

      {!isLoading && campaign && (
        <CampaignEditor key={campaign.id} campaign={campaign} onRefresh={refetch} />
      )}
    </section>
  );
}
