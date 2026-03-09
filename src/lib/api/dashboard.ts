// mock API for dashboard data
// I got it online :)

export interface DashboardKpi {
  id: string;
  label: string;
  value: string;
  change: number;
}

export interface TrendPoint {
  label: string;
  openRate: number;
  clickRate: number;
  reportRate: number;
}

export interface DepartmentComparison {
  department: string;
  susceptibilityScore: number;
  reportingScore: number;
}

export interface RecentCampaign {
  id: string;
  name: string;
  audience: string;
  sentAt: string;
  status: "Draft" | "Scheduled" | "Running" | "Completed";
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getKpis(): Promise<DashboardKpi[]> {
  await delay(300);

  return [
    { id: "emails-sent", label: "Emails Sent", value: "24,860", change: 8.4 },
    { id: "click-rate", label: "Click Rate", value: "14.7%", change: -1.3 },
    { id: "credentials-submitted", label: "Credentials Submitted", value: "73", change: 2.1 },
    { id: "reports", label: "Reports", value: "312", change: 5.6 },
  ];
}

export async function getTrends(): Promise<TrendPoint[]> {
  await delay(300);

  return [
    { label: "Mon", openRate: 62, clickRate: 11, reportRate: 18 },
    { label: "Tue", openRate: 66, clickRate: 13, reportRate: 20 },
    { label: "Wed", openRate: 64, clickRate: 12, reportRate: 19 },
    { label: "Thu", openRate: 69, clickRate: 15, reportRate: 23 },
    { label: "Fri", openRate: 72, clickRate: 16, reportRate: 24 },
  ];
}

export async function getDepartmentComparison(): Promise<DepartmentComparison[]> {
  await delay(300);

  return [
    { department: "Finance", susceptibilityScore: 41, reportingScore: 79 },
    { department: "HR", susceptibilityScore: 33, reportingScore: 84 },
    { department: "Engineering", susceptibilityScore: 18, reportingScore: 91 },
    { department: "Operations", susceptibilityScore: 29, reportingScore: 76 },
  ];
}

export async function getRecentCampaigns(): Promise<RecentCampaign[]> {
  await delay(300);

  return [
    {
      id: "cmp-001",
      name: "Credential Harvest Simulation",
      audience: "All Staff",
      sentAt: "2026-03-01T09:00:00Z",
      status: "Completed",
    },
    {
      id: "cmp-002",
      name: "Invoice Attachment Test",
      audience: "Finance",
      sentAt: "2026-03-02T14:30:00Z",
      status: "Running",
    },
    {
      id: "cmp-003",
      name: "VPN Reset Lure",
      audience: "Remote Teams",
      sentAt: "2026-03-04T08:15:00Z",
      status: "Scheduled",
    },
  ];
}
