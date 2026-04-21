import { requestJson } from "@/src/lib/api/client";
import type { Campaign } from "@/src/lib/api/campaigns";

export interface DashboardResponse {
  totalCampaigns: number;
  totalEmailsSent: number;
  totalOpens: number;
  totalClicks: number;
  totalSubmits: number;
  openRate: string;
  clickRate: string;
  submitRate: string;
  recentCampaigns: Campaign[];
}

export interface DashboardKpi {
  id: string;
  label: string;
  value: string;
  change: number;
}

export async function getKpis(): Promise<DashboardKpi[]> {
  const data = await requestJson<DashboardResponse>("/dashboard", undefined, {
    fallbackMessage: "Unable to load dashboard data.",
    requiresAuth: true,
  });

  return [
    {
      id: "emails-sent",
      label: "Emails Sent",
      value: String(data.totalEmailsSent),
      change: 0,
    },
    {
      id: "click-rate",
      label: "Click Rate",
      value: `${data.clickRate}%`,
      change: 0,
    },
    {
      id: "credentials-submitted",
      label: "Credentials Submitted",
      value: String(data.totalSubmits),
      change: 0,
    },
    {
      id: "reports",
      label: "Opens",
      value: String(data.totalOpens),
      change: 0,
    },
  ];
}