import { requestJson } from "@/src/lib/api/client";

export type CampaignStatus = "DRAFT" | "SCHEDULED" | "SENT";
export type UserRole = "ADMIN" | "READ_ONLY";
export type EmailDeliveryStatus = "skipped" | "sent" | "partial" | "timed_out" | "failed";

export interface CampaignCount {
  targets: number;
  events: number;
}

export interface CampaignUser {
  id: number;
  email: string;
  role: UserRole;
}

export interface CampaignTarget {
  id: number;
  email: string;
  token: string;
  campaignId: number;
}

export interface EmailDeliverySummary {
  status: EmailDeliveryStatus;
  attempted?: number;
  sent?: number;
  failed?: number;
  timedOut?: number;
  details?: Array<{
    email: string;
    status: "sent" | "timed_out" | "failed";
    message?: string;
    messageId?: string;
    previewUrl?: string | null;
  }>;
}

export interface Campaign {
  id: number;
  name: string;
  status: CampaignStatus;
  scheduledAt: string | null;
  createdAt: string;
  createdById: number;
  createdBy?: CampaignUser;
  targets?: CampaignTarget[];
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
  targets?: string[];
}

export interface SendTestEmailInput {
  to: string;
}

export interface CampaignMutationResult {
  campaign: Campaign;
  message?: string;
  emailDelivery?: EmailDeliverySummary;
}

export interface SendTestEmailResult {
  message: string;
  messageId?: string;
  previewUrl?: string | null;
  emailDelivery?: EmailDeliverySummary;
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

export async function createCampaign(input: CreateCampaignInput): Promise<CampaignMutationResult> {
  return requestJson(
    "campaigns",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
    { fallbackMessage: "Unable to create campaign.", requiresAuth: true }
  );
}

export async function updateCampaign(id: number, input: UpdateCampaignInput): Promise<CampaignMutationResult> {
  return requestJson(
    `campaigns/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
    { fallbackMessage: "Unable to update campaign.", requiresAuth: true }
  );
}

export async function deleteCampaign(id: number): Promise<string> {
  const payload = await requestJson<{ msg: string }>(
    `campaigns/${id}`,
    { method: "DELETE" },
    { fallbackMessage: "Unable to delete campaign.", requiresAuth: true }
  );

  return payload.msg;
}

export async function sendTestEmail(input: SendTestEmailInput): Promise<SendTestEmailResult> {
  return requestJson(
    "send-test-email",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
    { fallbackMessage: "Unable to send test email." }
  );
}
