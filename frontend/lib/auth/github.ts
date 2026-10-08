import { API_BASE_URL } from "@/lib/api/config";

/**
 * GitHub sign-in works like Google's: a full-page redirect through the backend
 * (it keeps the GitHub client secret), back to the same /auth/callback with
 * tokens in the URL fragment, or to /login?error=<code>. It shares Google's
 * one-time nonce (createGoogleNonce), which the callback checks.
 */
export function githubSignInUrl(next?: string | null, nonce?: string | null) {
  const url = new URL("/api/v1/auth/github", API_BASE_URL);
  if (next) url.searchParams.set("next", next);
  if (nonce) url.searchParams.set("nonce", nonce);
  return url.toString();
}
