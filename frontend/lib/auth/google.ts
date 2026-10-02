import { API_BASE_URL } from "@/lib/api/client";

/**
 * Google sign-in is a full-page redirect through the backend (it keeps the
 * Google client secret), not a fetch call. The backend comes back to
 * /auth/callback with tokens in the URL fragment, or to /login?error=<code>.
 */
export function googleSignInUrl(next?: string | null) {
  const url = new URL("/api/v1/auth/google", API_BASE_URL);
  if (next) url.searchParams.set("next", next);
  return url.toString();
}

const ERROR_MESSAGES: Record<string, string> = {
  google_cancelled: "Google sign-in was cancelled.",
  google_session_expired: "Google sign-in took too long. Please try again.",
  google_email_unverified: "Your Google email isn't verified, so we can't use it to sign in.",
  google_account_conflict: "This email is linked to a different Google account.",
  google_not_configured: "Google sign-in isn't available right now. Use email instead.",
  account_deactivated: "This account has been deactivated.",
};

/** Turns a `?error=` code from the backend into a sentence, or null for no/unknown code. */
export function authErrorMessage(code: string | undefined): string | null {
  if (!code) return null;
  return ERROR_MESSAGES[code] ?? "Google sign-in didn't work. Please try again.";
}
