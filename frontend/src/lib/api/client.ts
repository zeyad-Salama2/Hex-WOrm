export class ApiRequestError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

type ApiErrorPayload = {
  message?: string;
  msg?: string;
};

type RequestJsonOptions = {
  fallbackMessage?: string;
  requiresAuth?: boolean;
};

const DEFAULT_API_BASE_URL = "http://localhost:4000";

export function buildApiUrl(path: string) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.trim() || DEFAULT_API_BASE_URL;
  return new URL(path, `${apiBaseUrl.replace(/\/$/, "")}/`).toString();
}

export function getAuthTokenFromCookie() {
  if (typeof document === "undefined") {
    return "";
  }

  const tokenCookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith("token="));

  return tokenCookie ? decodeURIComponent(tokenCookie.slice("token=".length)) : "";
}

export function setAuthTokenCookie(token: string) {
  document.cookie = `token=${encodeURIComponent(token)}; path=/; SameSite=Lax`;
}

export function clearAuthTokenCookie() {
  document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
}

async function readErrorMessage(response: Response, fallbackMessage: string) {
  try {
    const payload = (await response.json()) as ApiErrorPayload;
    return payload.message || payload.msg || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

export async function requestJson<T>(
  path: string,
  init?: RequestInit,
  options?: RequestJsonOptions
): Promise<T> {
  const token = getAuthTokenFromCookie();
  const headers = new Headers(init?.headers);
  const fallbackMessage = options?.fallbackMessage || "Unable to complete the request.";
  const requiresAuth = options?.requiresAuth ?? false;

  if (!headers.has("Content-Type") && init?.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  } else if (requiresAuth) {
    throw new ApiRequestError("Your session has expired. Please sign in again.", 401);
  }

  let response: Response;
  try {
    response = await fetch(buildApiUrl(path), {
      ...init,
      headers,
    });
  } catch {
    throw new ApiRequestError("Unable to reach the backend. Check your network and API server.", 0);
  }

  if (!response.ok) {
    throw new ApiRequestError(
      await readErrorMessage(response, fallbackMessage),
      response.status
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
