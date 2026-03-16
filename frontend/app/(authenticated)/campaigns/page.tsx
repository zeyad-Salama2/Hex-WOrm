"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useCampaigns } from "@/src/hooks/useCampaigns";
import type { CampaignStatus } from "@/src/lib/api/campaigns";

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5z" fill="currentColor" />
    </svg>
  );
}

function DuplicateIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M8 7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2V7zm-4 4V6a2 2 0 0 1 2-2h6v2H6v5H4zm4 0h2v6h8v2h-8a2 2 0 0 1-2-2v-6z"
        fill="currentColor"
      />
    </svg>
  );
}

function getStatusClasses(status: CampaignStatus) {
  switch (status) {
    case "Draft":
      return "border-white/10 bg-white/5 text-slate-300";
    case "Scheduled":
      return "border-blue-400/20 bg-blue-500/10 text-blue-300";
    case "Running":
      return "border-cyan-400/20 bg-cyan-500/10 text-cyan-300";
    case "Completed":
      return "border-emerald-400/20 bg-emerald-500/10 text-emerald-300";
    default:
      return "border-white/10 bg-white/5 text-slate-300";
  }
}

function CampaignRowSkeleton() {
  return (
    <tr className="animate-pulse border-t border-[color:var(--border)]">
      <td className="px-5 py-4"><div className="h-4 w-40 rounded bg-white/5" /></td>
      <td className="px-5 py-4"><div className="h-4 w-24 rounded bg-white/5" /></td>
      <td className="px-5 py-4"><div className="h-6 w-24 rounded-full bg-white/5" /></td>
      <td className="px-5 py-4"><div className="h-4 w-32 rounded bg-white/5" /></td>
      <td className="px-5 py-4"><div className="h-4 w-24 rounded bg-white/5" /></td>
    </tr>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  return date.toLocaleString();
}

export default function CampaignsPage() {
  const router = useRouter();
  const { data, isLoading, error } = useCampaigns();
  const [showCreatedBanner, setShowCreatedBanner] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setShowCreatedBanner(params.get("created") === "1");
  }, []);

  const campaigns = useMemo(() => data ?? [], [data]);

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-4xl font-semibold text-[color:var(--text)]">Campaigns</h2>
          <p className="mt-3 text-base text-[color:var(--muted)]">
            Launch, schedule, and review phishing simulations across your organization.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/campaigns/new")}
          className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-300 transition-colors duration-200 hover:border-cyan-400/30 hover:bg-cyan-500/15"
        >
          <PlusIcon className="h-4 w-4" />
          Create Campaign
        </button>
      </div>

      {showCreatedBanner && (
        <p className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          Campaign created successfully.
        </p>
      )}

      {error && <p className="text-sm text-rose-300">{error}</p>}

      <div className="overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--panel2)]">
        {campaigns.length === 0 && !isLoading ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center px-6 py-12 text-center">
            <p className="text-lg font-semibold text-[color:var(--text)]">No campaigns yet</p>
            <p className="mt-2 max-w-md text-sm text-[color:var(--muted)]">
              Start with your first phishing simulation to begin tracking engagement and reporting behavior.
            </p>
            <button
              type="button"
              onClick={() => router.push("/campaigns/new")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-300 transition-colors duration-200 hover:border-cyan-400/30 hover:bg-cyan-500/15"
            >
              <PlusIcon className="h-4 w-4" />
              Create Campaign
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-white/[0.02] text-[color:var(--muted)]">
                <tr>
                  <th className="px-5 py-4 font-medium">Name</th>
                  <th className="px-5 py-4 font-medium">Audience</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium">Sent/Scheduled Date</th>
                  <th className="px-5 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 4 }).map((_, index) => <CampaignRowSkeleton key={index} />)
                  : campaigns.map((campaign) => (
                      <tr
                        key={campaign.id}
                        className="border-t border-[color:var(--border)] transition-colors duration-200 hover:bg-white/[0.02]"
                      >
                        <td className="px-5 py-4 font-medium text-[color:var(--text)]">{campaign.name}</td>
                        <td className="px-5 py-4 text-[color:var(--muted)]">{campaign.audience}</td>
                        <td className="px-5 py-4">
                          <span className={[
                            "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold",
                            getStatusClasses(campaign.status),
                          ].join(" ")}>
                            {campaign.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-[color:var(--muted)]">{formatDate(campaign.sentAt)}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-4">
                            <Link
                              href={`/campaigns/${campaign.id}`}
                              className="text-sm font-medium text-cyan-300 transition-colors hover:text-cyan-200"
                            >
                              View
                            </Link>
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 text-sm font-medium text-[color:var(--muted)] transition-colors hover:text-[color:var(--text)]"
                            >
                              <DuplicateIcon className="h-4 w-4" />
                              Duplicate
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
