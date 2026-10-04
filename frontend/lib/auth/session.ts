import type { AuthUser } from "@/lib/api/types";

// The backend issues bearer tokens in the response body (no cookies yet), so they live in
// localStorage. Move to httpOnly cookies once the API sets them.
export const ACCESS_KEY = "ps-access-token";
export const REFRESH_KEY = "ps-refresh-token";

function read(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export const getAccessToken = () => read(ACCESS_KEY);
export const getRefreshToken = () => read(REFRESH_KEY);

export function saveTokens(access: string, refresh: string) {
  try {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  } catch {
    // Storage blocked (private mode): the session lasts for this page only.
  }
}

export function clearTokens() {
  try {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  } catch {
    // Nothing stored, nothing to clear.
  }
}

/** Where a user lands after signing in: new students start with the onboarding chat. */
export function homeFor(user: Pick<AuthUser, "role" | "onboarding_completed">) {
  if (user.role === "admin") return "/admin";
  return user.role === "student" && !user.onboarding_completed ? "/onboarding" : "/dashboard";
}

// Any origin works as the base: only whether the result stays on it matters.
const NEXT_BASE = "https://prepsuccess.invalid";

/**
 * Only same-site paths are allowed as a post-login redirect, never another
 * origin. Browsers treat `\` like `/` and drop tabs and newlines from URLs, so
 * "/\evil.com" or "/<tab>/evil.com" would leave the site: reject those
 * outright, then let the URL parser have the final say.
 */
export function safeNext(next: string | null | undefined): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return null;
  if (/[\\\u0000-\u001f\u007f]/.test(next)) return null;
  try {
    const url = new URL(next, NEXT_BASE);
    if (url.origin !== NEXT_BASE) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export type SessionState =
  | { status: "loading"; user: null }
  | { status: "authenticated"; user: AuthUser }
  | { status: "unauthenticated"; user: null }
  /** Tokens are stored but the API can't be reached (offline, cold start, 5xx). */
  | { status: "unreachable"; user: null; retry: () => void };
