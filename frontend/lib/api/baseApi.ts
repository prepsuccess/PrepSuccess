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
 *    requests wait for it), then the request is retried; if refresh fails the
 *    user is signed out (the cache is cleared when the next session starts —
 *    see startSession — so the failing request still reports its 401).
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
  "/auth/refresh",
  "/auth/logout",
];

let refreshing: Promise<boolean> | null = null;

/** Exchanges the refresh token once, however many requests hit a 401 at the same time. */
function refreshSession(api: Parameters<BaseQueryFn>[1], extra: object): Promise<boolean> {
  refreshing ??= (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;
    const result = await rawQuery(
      { url: "/api/v1/auth/refresh", method: "POST", body: { refresh_token: refreshToken } },
      api,
      extra,
    );
    const tokens = (result.data as { data?: { access_token: string; refresh_token: string } })
      ?.data;
    if (!tokens) return false;
    saveTokens(tokens.access_token, tokens.refresh_token);
    return true;
  })().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

const baseQuery: BaseQueryFn<string | FetchArgs, unknown, ApiError> = async (args, api, extra) => {
  if (refreshing) await refreshing;
  let result = await rawQuery(args, api, extra);

  const url = typeof args === "string" ? args : args.url;
  if (result.error?.status === 401 && !NO_REFRESH.some((path) => url.includes(path))) {
    if (await refreshSession(api, extra)) {
      result = await rawQuery(args, api, extra);
    } else {
      clearTokens();
      api.dispatch(signedOut());
    }
  }

  if (result.error) return { error: toApiError(result.error as FetchBaseQueryError) };
  // 204s have no body; everything else is the success envelope.
  const envelope = result.data as { data?: unknown } | undefined;
  return { data: envelope && "data" in envelope ? envelope.data : envelope };
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: ["Me", "AiStatus", "Onboarding"],
  endpoints: () => ({}),
});
