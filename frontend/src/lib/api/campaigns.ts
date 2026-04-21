import { requestJson } from "@/src/lib/api/client";

export type CampaignStatus = "DRAFT" | "SCHEDULED" | "SENT";
export type UserRole = "ADMIN" | "READ_ONLY";

export interface CampaignCount {
  targets: number;
  events: number;
}

export interface CampaignUser {
  id: number;
  email: string;
  role: UserRole;
}

export interface Campaign {
  id: number;
  name: string;
  status: CampaignStatus;
  scheduledAt: string | null;
  createdAt: string;
  createdById: number;
  createdBy?: CampaignUser;
  targets?: unknown[];
  events?: unknown[];
  _count?: CampaignCount;
}

export interface CreateCampaignInput {
  name: string;
  status?: CampaignStatus;
  scheduledAt?: string;
  targets?: string[];
}

export interface UpdateCampaignInput {
  name?: string;
  status?: CampaignStatus;
  scheduledAt?: string | null;
}

export interface SendTestEmailInput {
  to: string;
}

export async function listCampaigns(): Promise<Campaign[]> {
  const payload = await requestJson<{ campaigns: Campaign[] }>(
    "campaigns",
    { method: "GET" },
    { fallbackMessage: "Unable to load campaigns.", requiresAuth: true }
  );

  return payload.campaigns;
}

export async function getCampaignById(id: number): Promise<Campaign> {
  const payload = await requestJson<{ campaign: Campaign }>(
    `campaigns/${id}`,
    { method: "GET" },
    { fallbackMessage: "Unable to load the selected campaign.", requiresAuth: true }
  );

  return payload.campaign;
}

export async function createCampaign(input: CreateCampaignInput): Promise<Campaign> {
  const payload = await requestJson<{ campaign: Campaign }>(
    "campaigns",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
    { fallbackMessage: "Unable to create campaign.", requiresAuth: true }
  );

  return payload.campaign;
}

export async function updateCampaign(id: number, input: UpdateCampaignInput): Promise<Campaign> {
  const payload = await requestJson<{ campaign: Campaign }>(
    `campaigns/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
    { fallbackMessage: "Unable to update campaign.", requiresAuth: true }
  );

  return payload.campaign;
}

export async function deleteCampaign(id: number): Promise<string> {
  const payload = await requestJson<{ msg: string }>(
    `campaigns/${id}`,
    { method: "DELETE" },
    { fallbackMessage: "Unable to delete campaign.", requiresAuth: true }
  );

  return payload.msg;
}

export async function sendTestEmail(input: SendTestEmailInput): Promise<{
  message: string;
  messageId?: string;
  previewUrl?: string | null;
}> {
  return requestJson(
    "send-test-email",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
    { fallbackMessage: "Unable to send test email." }
  );
}
