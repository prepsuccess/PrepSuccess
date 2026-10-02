import type { AuthUser } from "@/lib/api/types";

// The backend issues bearer tokens in the response body (no cookies yet), so they live in
// localStorage. Move to httpOnly cookies once the API sets them.
const ACCESS_KEY = "ps-access-token";
const REFRESH_KEY = "ps-refresh-token";

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

/** Only same-site paths are allowed as a post-login redirect, never another origin. */
export function safeNext(next: string | null | undefined): string | null {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : null;
}

export type SessionState =
  | { status: "loading"; user: null }
  | { status: "authenticated"; user: AuthUser }
  | { status: "unauthenticated"; user: null };
