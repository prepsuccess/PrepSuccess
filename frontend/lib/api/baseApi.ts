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
 *    signed in and the request reports that error instead. Tabs share the
 *    tokens (localStorage), so refreshes are serialised across tabs too.
 */

const rawQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  // Long enough for a cold start of the API host; past it the request reports TIMEOUT.
  timeout: 30_000,
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

// Another tab is refreshing the same token right now (the backend rotates it
// once); that tab saves the new pair, so this one only has to pick it up.
const REFRESH_RACE = 409;

type Refresh =
  | { outcome: "refreshed" }
  /** `token` is the refresh token the server turned down (null: there was none). */
  | { outcome: "rejected"; token: string | null }
  | {
      outcome: "failed";
      error: FetchBaseQueryError;
    };

let refreshing: Promise<Refresh> | null = null;

/** One refresh attempt; runs under the cross-tab lock when the browser has one. */
async function exchangeRefreshToken(
  usedToken: string | null,
  api: Parameters<BaseQueryFn>[1],
  extra: object,
): Promise<Refresh> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return { outcome: "rejected", token: null };
  // The tokens changed since the request went out: another tab (or an earlier
  // refresh in this one) already rotated them, so just retry with the new ones.
  if (refreshToken !== usedToken) return { outcome: "refreshed" };
  const result = await rawQuery(
    { url: "/api/v1/auth/refresh", method: "POST", body: { refresh_token: refreshToken } },
    api,
    extra,
  );
  if (result.error) {
    const status = result.error.status;
    if (status === REFRESH_RACE) return { outcome: "refreshed" };
    return typeof status === "number" && SESSION_REJECTED.includes(status)
      ? { outcome: "rejected", token: refreshToken }
      : { outcome: "failed", error: result.error };
  }
  const tokens = (result.data as { data?: { access_token: string; refresh_token: string } })?.data;
  if (!tokens) return { outcome: "rejected", token: refreshToken };
  saveTokens(tokens.access_token, tokens.refresh_token);
  return { outcome: "refreshed" };
}

/**
 * Exchanges the refresh token once, however many requests hit a 401 at the
 * same time — in this tab (one shared promise) and across tabs (a Web Lock, so
 * two tabs never spend the same single-use refresh token).
 */
function refreshSession(
  usedToken: string | null,
  api: Parameters<BaseQueryFn>[1],
  extra: object,
): Promise<Refresh> {
  if (refreshing) return refreshing;
  const locks = typeof navigator === "undefined" ? undefined : navigator.locks;
  const attempt: Promise<Refresh> = locks
    ? // request() resolves with the callback's result once the lock is released;
      // its typings nest the promise, so `then` flattens it.
      locks
        .request("ps-refresh", () => exchangeRefreshToken(usedToken, api, extra))
        .then((result) => result)
    : exchangeRefreshToken(usedToken, api, extra);
  const shared = attempt.finally(() => {
    refreshing = null;
  });
  refreshing = shared;
  return shared;
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
  // The pair this request is sent with, to tell later whether another tab has rotated it.
  const usedToken = getRefreshToken();
  let result = await rawQuery(args, api, extra);

  const url = typeof args === "string" ? args : args.url;
  if (result.error?.status === 401 && !NO_REFRESH.some((path) => url.includes(path))) {
    const refresh = await refreshSession(usedToken, api, extra);
    if (refresh.outcome === "refreshed") {
      result = await rawQuery(args, api, extra);
    } else if (refresh.outcome === "rejected") {
      const stored = getRefreshToken();
      if (stored === refresh.token || !stored) {
        clearTokens();
        api.dispatch(signedOut());
      } else {
        // Another tab signed in or refreshed meanwhile: its tokens are good.
        result = await rawQuery(args, api, extra);
      }
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
    "Questions",
    "Question",
    "Progress",
    "PrepPdfs",
    "AdminQuestions",
    "AdminPrepPdfs",
    "AdminUsers",
    "AdminAnalytics",
    "AdminSkills",
    "AdminResources",
    "AdminTasks",
  ],
  endpoints: () => ({}),
});
