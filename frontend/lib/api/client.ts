import { getAccessToken } from "@/lib/auth/session";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = Omit<RequestInit, "body"> & { body?: unknown };

/**
 * Pulls a readable message out of an error body: the backend's `{ error: { message } }`
 * envelope, or a bare `detail` string/list from other services.
 */
function messageFrom(body: unknown, fallback: string): string {
  if (typeof body !== "object" || body === null) return fallback;
  const { detail, error } = body as { detail?: unknown; error?: { message?: unknown } };
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && typeof detail[0]?.msg === "string") return detail[0].msg;
  if (typeof error?.message === "string") return error.message;
  return fallback;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;
  const token = getAccessToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    let parsed: unknown = text;
    try {
      parsed = JSON.parse(text);
    } catch {
      // Not JSON — use the raw text below.
    }
    const fallback = text || response.statusText || "Something went wrong.";
    throw new ApiError(response.status, messageFrom(parsed, fallback));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  // The backend wraps every success in `{ success, data, request_id, timestamp }`; callers get `data`.
  const json: unknown = await response.json();
  if (typeof json === "object" && json !== null && "success" in json && "data" in json) {
    return (json as { data: T }).data;
  }
  return json as T;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),
};
