import { API_BASE_URL } from "@/lib/api/config";

/**
 * Google sign-in is a full-page redirect through the backend (it keeps the
 * Google client secret), not a fetch call. The backend comes back to
 * /auth/callback with tokens in the URL fragment, or to /login?error=<code>.
 */
export function googleSignInUrl(next?: string | null, nonce?: string | null) {
  const url = new URL("/api/v1/auth/google", API_BASE_URL);
  if (next) url.searchParams.set("next", next);
  if (nonce) url.searchParams.set("nonce", nonce);
  return url.toString();
}

const NONCE_KEY = "ps-google-nonce";

/**
 * A one-time value tying the callback to a sign-in this tab started. The
 * backend echoes it back with the tokens; without the check, a crafted
 * callback link could sign the visitor into someone else's account (login CSRF).
 */
export function createGoogleNonce(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  // 24 bytes → exactly 32 base64url characters, no padding.
  const nonce = btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  try {
    sessionStorage.setItem(NONCE_KEY, nonce);
  } catch {
    // Storage blocked: the callback can't match it and asks the user to try again.
  }
  return nonce;
}

/** The nonce this tab is waiting for, removed so it can only be used once. */
export function takeGoogleNonce(): string | null {
  try {
    const nonce = sessionStorage.getItem(NONCE_KEY);
    sessionStorage.removeItem(NONCE_KEY);
    return nonce;
  } catch {
    return null;
  }
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
