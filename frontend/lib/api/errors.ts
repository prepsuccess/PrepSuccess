import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

/**
 * Every failed API call surfaces as an `ApiError`, whatever went wrong: the
 * backend's `{ error: { code, message, details } }` envelope, a network
 * failure, or a non-JSON response. Components never see raw fetch errors.
 */
export interface ApiError {
  /** HTTP status, or 0 when the request never got a response. */
  status: number;
  code: string;
  message: string;
  details: unknown[];
}

const NETWORK_MESSAGE = "Couldn't reach PrepSuccess. Check your connection and try again.";

export function toApiError(error: FetchBaseQueryError): ApiError {
  if (typeof error.status === "number") {
    const body = error.data as { error?: Partial<ApiError> } | undefined;
    return {
      status: error.status,
      code: body?.error?.code ?? `HTTP_${error.status}`,
      message: body?.error?.message ?? "Something went wrong. Please try again.",
      details: body?.error?.details ?? [],
    };
  }
  if (error.status === "TIMEOUT_ERROR") {
    return {
      status: 0,
      code: "TIMEOUT",
      message: "PrepSuccess took too long to answer. Try again.",
      details: [],
    };
  }
  if (error.status === "PARSING_ERROR") {
    return {
      status: error.originalStatus,
      code: "BAD_RESPONSE",
      message: "Something went wrong. Please try again.",
      details: [],
    };
  }
  return { status: 0, code: "NETWORK_ERROR", message: NETWORK_MESSAGE, details: [] };
}

export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === "object" &&
    value !== null &&
    "code" in value &&
    "message" in value &&
    "status" in value
  );
}

/** A sentence to show the user for any thrown/returned error. */
export function errorMessage(error: unknown, fallback = "Something went wrong. Please try again.") {
  return isApiError(error) ? error.message : fallback;
}

/**
 * Field-level messages from a 422 validation error, keyed by the field name
 * (the last segment of each issue's path, e.g. `profile.mobile_no` → `mobile_no`).
 */
export function fieldErrors(error: unknown): Record<string, string> {
  if (!isApiError(error) || error.code !== "VALIDATION_ERROR") return {};
  const result: Record<string, string> = {};
  for (const issue of error.details) {
    const { path, message } = (issue ?? {}) as { path?: unknown[]; message?: string };
    const field = path?.[path.length - 1];
    if (typeof field === "string" && message && !(field in result)) result[field] = message;
  }
  return result;
}
