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

interface ApiErrorPayload {
  message?: string;
}

function getAuthToken() {
  if (typeof document === "undefined") {
    return "";
  }

  const tokenCookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith("token="));

  return tokenCookie ? decodeURIComponent(tokenCookie.slice("token=".length)) : "";
}

function buildApiUrl(path: string) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:4000";
  return new URL(path, `${apiBaseUrl.replace(/\/$/, "")}/`).toString();
}

async function readErrorMessage(response: Response, fallbackMessage: string) {
  try {
    const payload = (await response.json()) as ApiErrorPayload;
    return payload.message || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

async function requestJson<T>(path: string, init?: RequestInit, fallbackMessage?: string): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(init?.headers);

  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildApiUrl(path), {
    ...init,
    headers,
  });

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(
        response,
        fallbackMessage || "Unable to complete the campaign request."
      )
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function listCampaigns(): Promise<Campaign[]> {
  const payload = await requestJson<{ campaigns: Campaign[] }>(
    "campaigns",
    { method: "GET" },
    "Unable to load campaigns."
  );

  return payload.campaigns;
}

export async function getCampaignById(id: number): Promise<Campaign> {
  const payload = await requestJson<{ campaign: Campaign }>(
    `campaigns/${id}`,
    { method: "GET" },
    "Unable to load the selected campaign."
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
    "Unable to create campaign."
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
    "Unable to update campaign."
  );

  return payload.campaign;
}

export async function deleteCampaign(id: number): Promise<string> {
  const payload = await requestJson<{ msg: string }>(
    `campaigns/${id}`,
    { method: "DELETE" },
    "Unable to delete campaign."
  );

  return payload.msg;
}
