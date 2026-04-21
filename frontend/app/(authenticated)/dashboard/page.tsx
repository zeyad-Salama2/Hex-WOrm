"use client";

import Panel from "@/src/components/ui/Panel";
import { useKpis } from "@/src/hooks/useDashboard";

function MailIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zm0 2v.2l8 5 8-5V8H4zm16 8V10.5l-7.5 4.7a1 1 0 0 1-1 0L4 10.5V16h16z"
        fill="currentColor"
      />
    </svg>
  );
}

function CursorIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M5 3.5a1 1 0 0 1 1.4-.9l10.3 4.5a1 1 0 0 1 0 1.8L13 10.5l3.7 7.8a1 1 0 0 1-.5 1.3l-1.8.8a1 1 0 0 1-1.3-.5L9.4 12 6.8 15a1 1 0 0 1-1.8-.7V3.5z"
        fill="currentColor"
      />
    </svg>
  );
}

function KeyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M14.5 3a6.5 6.5 0 0 0-5.9 9.2L2 18.8V22h3.2l1.5-1.5h2L10.2 19v-2l1.1-1.1A6.5 6.5 0 1 0 14.5 3zm0 3A3.5 3.5 0 1 1 11 9.5 3.5 3.5 0 0 1 14.5 6z"
        fill="currentColor"
      />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 2 4 5v6c0 5.3 3.4 9.9 8 11 4.6-1.1 8-5.7 8-11V5l-8-3zm1 5v5h3v2h-5V7h2z"
        fill="currentColor"
      />
    </svg>
  );
}

type KpiCardConfig = {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
};

const kpiCards: KpiCardConfig[] = [
  { id: "emails-sent", title: "Emails Sent", icon: MailIcon },
  { id: "click-rate", title: "Click Rate", icon: CursorIcon },
  { id: "credentials-submitted", title: "Credentials Submitted", icon: KeyIcon },
  { id: "reports", title: "Reports", icon: ShieldIcon },
];

function KpiSkeletonCard() {
  return (
    <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--panel2)] p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 rounded-lg bg-white/5" />
        <div className="flex-1 space-y-3">
          <div className="h-3 w-24 rounded bg-white/5" />
          <div className="h-8 w-20 rounded bg-white/10" />
          <div className="h-3 w-16 rounded bg-white/5" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading, isError } = useKpis();

  const kpiMap = new Map((data ?? []).map((item) => [item.id, item]));

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-4xl font-semibold text-[color:var(--text)]">Dashboard</h2>
        <p className="mt-3 text-base text-[color:var(--muted)]">
          Quick status checks for launches, performance, and deliverability.
        </p>
      </div>

      {isError && (
        <p className="text-sm text-rose-300">Unable to load KPI data right now.</p>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => <KpiSkeletonCard key={index} />)
          : kpiCards.map((card) => {
              const metric = kpiMap.get(card.id);
              const Icon = card.icon;
              const change = metric?.change ?? 0;
              const isPositive = change >= 0;

              return (
                <Panel
                  key={card.id}
                  className="border-[color:var(--border)] p-5 transition-colors duration-200 hover:border-cyan-400/30"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-[color:var(--accent)]">
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[color:var(--muted)]">{card.title}</p>
                      <p className="mt-2 text-3xl font-semibold text-[color:var(--text)]">
                        {metric?.value ?? "--"}
                      </p>
                      <p
                        className={[
                          "mt-2 text-xs font-medium",
                          isPositive ? "text-emerald-300" : "text-rose-300",
                        ].join(" ")}
                      >
                        {isPositive ? "+" : ""}
                        {change.toFixed(1)}% vs last run
                      </p>
                    </div>
                  </div>
                </Panel>
              );
            })}
      </div>

      <div className="min-h-[320px] rounded-2xl border border-dashed border-[color:var(--border)] bg-[color:var(--panel2)] p-8 text-base text-[color:var(--muted)]">
        soon
      </div>
    </section>
  );
}
