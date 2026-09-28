import type { AuthUser, UserRole } from "@/lib/api/auth";

// The backend issues bearer tokens in the response body (no cookies yet), so they live in
// localStorage. Move to httpOnly cookies once the API sets them.
const ACCESS_KEY = "ps-access-token";
const REFRESH_KEY = "ps-refresh-token";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(ACCESS_KEY);
  } catch {
    return null;
  }
}

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

/** Where a user lands after signing in. */
export function homeFor(role: UserRole) {
  return role === "admin" ? "/admin" : "/dashboard";
}

/** Only same-site paths are allowed as a post-login redirect, never another origin. */
export function safeNext(next: string | null | undefined): string | null {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : null;
}

export type SessionState =
  | { status: "loading"; user: null }
  | { status: "authenticated"; user: AuthUser }
  | { status: "unauthenticated"; user: null };
