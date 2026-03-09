"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { useCampaigns } from "@/src/hooks/useCampaigns";
import type { CampaignStatus } from "@/src/lib/api/campaigns";

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

export default function CampaignDetailPage() {
  const params = useParams<{ id: string }>();
  const { data, isLoading, error } = useCampaigns();

  const campaign = useMemo(
    () => (data ?? []).find((item) => item.id === params.id),
    [data, params.id]
  );

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
                {campaign.status}
              </span>
            )}
          </div>
          <p className="mt-3 text-base text-[color:var(--muted)]">
            Review high-level information for this phishing simulation.
          </p>
        </div>

        <Link
          href="/campaigns"
          className="text-sm font-semibold text-cyan-300 transition-colors hover:text-cyan-200"
        >
          Back to Campaigns
        </Link>
      </div>

      {error && <p className="text-sm text-rose-300">{error}</p>}

      <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--panel2)] p-6 text-[color:var(--muted)]">
        Details coming soon
      </div>
    </section>
  );
}
