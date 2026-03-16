export type CampaignStatus = "Draft" | "Scheduled" | "Running" | "Completed";

export interface Campaign {
  id: string;
  name: string;
  audience: string;
  status: CampaignStatus;
  sentAt: string;
}

export interface CreateCampaignInput {
  name: string;
  description: string;
  audience: string;
  template: string;
  scheduleMode: "now" | "scheduled";
  scheduledAt?: string;
}

let campaignsStore: Campaign[] = [
  {
    id: "cmp-001",
    name: "Credential Harvest Simulation",
    audience: "All Staff",
    status: "Completed",
    sentAt: "2026-03-01T09:00:00Z",
  },
  {
    id: "cmp-002",
    name: "Invoice Attachment Test",
    audience: "Finance",
    status: "Running",
    sentAt: "2026-03-02T14:30:00Z",
  },
  {
    id: "cmp-003",
    name: "VPN Reset Lure",
    audience: "Remote Teams",
    status: "Scheduled",
    sentAt: "2026-03-04T08:15:00Z",
  },
];

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function listCampaigns(): Promise<Campaign[]> {
  await delay(300);
  return [...campaignsStore];
}

export async function createCampaign(input: CreateCampaignInput): Promise<Campaign> {
  await delay(300);

  const campaign: Campaign = {
    id: `cmp-${Date.now()}`,
    name: input.name,
    audience: input.audience,
    status: input.scheduleMode === "scheduled" ? "Scheduled" : "Draft",
    sentAt: input.scheduleMode === "scheduled"
      ? input.scheduledAt ?? new Date().toISOString()
      : new Date().toISOString(),
  };

  campaignsStore = [campaign, ...campaignsStore];
  return campaign;
}
