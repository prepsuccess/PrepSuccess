import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { signedOut } from "@/lib/auth/authSlice";
import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from "@/lib/auth/session";
import { API_BASE_URL } from "./config";
import { toApiError, type ApiError } from "./errors";

/**
 * The one place the frontend talks HTTP. Every endpoint (lib/api/endpoints/*)
 * is injected into this API, so they all share:
 *  - the bearer token on every request
 *  - unwrapping of the `{ success, data }` envelope — endpoints receive `data`
 *  - one error shape (`ApiError`) for every failure
 *  - silent token refresh: a 401 triggers one `/auth/refresh` (concurrent
 *    requests wait for it), then the request is retried; if the server rejects
 *    the refresh token the user is signed out (the cache is cleared when the
 *    next session starts — see startSession — so the failing request still
 *    reports its 401). If the refresh can't get through at all, the user stays
 *    signed in and the request reports that error instead.
 */

const rawQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders(headers) {
    const token = getAccessToken();
    if (token && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

// A 401 from these means bad credentials, not an expired session — never refresh for them.
const NO_REFRESH = [
  "/auth/login",
  "/auth/register",
  "/auth/send-otp",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/refresh",
  "/auth/logout",
];

// The refresh endpoint answers these when the session itself is dead. Anything
// else — offline, a timeout, a 5xx, the 429 rate limit — says nothing about the
// session, so the student stays signed in and can simply retry.
const SESSION_REJECTED = [400, 401, 403];

type Refresh =
  | { outcome: "refreshed" }
  | { outcome: "rejected" }
  | {
      outcome: "failed";
      error: FetchBaseQueryError;
    };

let refreshing: Promise<Refresh> | null = null;

/** Exchanges the refresh token once, however many requests hit a 401 at the same time. */
function refreshSession(api: Parameters<BaseQueryFn>[1], extra: object): Promise<Refresh> {
  refreshing ??= (async (): Promise<Refresh> => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return { outcome: "rejected" };
    const result = await rawQuery(
      { url: "/api/v1/auth/refresh", method: "POST", body: { refresh_token: refreshToken } },
      api,
      extra,
    );
    if (result.error) {
      const status = result.error.status;
      return typeof status === "number" && SESSION_REJECTED.includes(status)
        ? { outcome: "rejected" }
        : { outcome: "failed", error: result.error };
    }
    const tokens = (result.data as { data?: { access_token: string; refresh_token: string } })
      ?.data;
    if (!tokens) return { outcome: "rejected" };
    saveTokens(tokens.access_token, tokens.refresh_token);
    return { outcome: "refreshed" };
  })().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

/** The envelope's pagination `meta`, for list endpoints that send one (read it in transformResponse). */
export interface ResponseMeta {
  pagination?: { page: number; limit: number; total: number };
}

const baseQuery: BaseQueryFn<string | FetchArgs, unknown, ApiError, object, ResponseMeta> = async (
  args,
  api,
  extra,
) => {
  if (refreshing) await refreshing;
  let result = await rawQuery(args, api, extra);

  const url = typeof args === "string" ? args : args.url;
  if (result.error?.status === 401 && !NO_REFRESH.some((path) => url.includes(path))) {
    const refresh = await refreshSession(api, extra);
    if (refresh.outcome === "refreshed") {
      result = await rawQuery(args, api, extra);
    } else if (refresh.outcome === "rejected") {
      clearTokens();
      api.dispatch(signedOut());
    } else {
      // Couldn't reach the refresh endpoint: report that (e.g. "check your
      // connection") rather than the 401, and keep the tokens for next time.
      return { error: toApiError(refresh.error) };
    }
  }

  if (result.error) return { error: toApiError(result.error as FetchBaseQueryError) };
  // 204s have no body; everything else is the success envelope.
  const envelope = result.data as { data?: unknown; meta?: ResponseMeta["pagination"] } | undefined;
  return {
    data: envelope && "data" in envelope ? envelope.data : envelope,
    meta: { pagination: envelope?.meta },
  };
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: [
    "Me",
    "AiStatus",
    "Onboarding",
    "MySkills",
    "Assessment",
    "Dashboard",
    "Insight",
    "Resources",
    "Tasks",
    "Task",
    "Notifications",
    "Coach",
    "AdminUsers",
    "AdminAnalytics",
    "AdminSkills",
    "AdminResources",
    "AdminTasks",
  ],
  endpoints: () => ({}),
});
