import { env, isGithubConfigured } from "../../config/env.js";
import { AppError } from "../../lib/http.js";

export { isGithubConfigured };

/**
 * GitHub OAuth App (authorization code flow). The client secret and the code
 * exchange stay on the server; the browser only ever sees our own JWTs.
 * Must match "Authorization callback URL" in the GitHub OAuth App settings.
 */
export const GITHUB_REDIRECT_URI = `${env.API_PUBLIC_URL}/api/v1/auth/github/callback`;

const TIMEOUT_MS = 10_000;
const API_HEADERS = {
  Accept: "application/vnd.github+json",
  "User-Agent": "PrepSuccess",
  "X-GitHub-Api-Version": "2022-11-28",
};

export interface GithubIdentity {
  /** GitHub's numeric user id, as a string. */
  githubId: string;
  /** The primary, verified email — trimmed and lowercased. */
  email: string;
  name: string | null;
  login: string;
  avatarUrl: string | null;
}

/** The authorize URL the browser is sent to. */
export function createGithubAuthUrl(state: string) {
  if (!isGithubConfigured()) throw new Error("GitHub OAuth is not configured");
  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID!,
    redirect_uri: GITHUB_REDIRECT_URI,
    scope: "read:user user:email",
    state,
    allow_signup: "true",
  });
  // URLSearchParams writes spaces as "+"; GitHub documents them as %20.
  return `https://github.com/login/oauth/authorize?${params.toString().replace(/\+/g, "%20")}`;
}

async function getJson(url: string, init: RequestInit, what: string): Promise<unknown> {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
  // Only the status goes into the error — never tokens or response bodies.
  if (!res.ok) throw new Error(`GitHub ${what} failed with HTTP ${res.status}`);
  return res.json();
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Exchanges the callback code for an access token, then reads the user and
 * their emails. Only a primary, verified email is used; without one this
 * throws GITHUB_NO_EMAIL. Anything else that goes wrong is a plain Error.
 */
export async function exchangeGithubCode(code: string): Promise<GithubIdentity> {
  if (!isGithubConfigured()) throw new Error("GitHub OAuth is not configured");

  const token = await getJson(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: GITHUB_REDIRECT_URI,
      }),
    },
    "token exchange",
  );
  // A bad or reused code still answers 200, with { error: "bad_verification_code" }.
  if (!isRecord(token) || typeof token.access_token !== "string" || !token.access_token) {
    const reason = isRecord(token) && typeof token.error === "string" ? token.error : "no token";
    throw new Error(`GitHub token exchange failed: ${reason}`);
  }

  const headers = { ...API_HEADERS, Authorization: `Bearer ${token.access_token}` };
  const [user, emails] = await Promise.all([
    getJson("https://api.github.com/user", { headers }, "user lookup"),
    getJson("https://api.github.com/user/emails", { headers }, "email lookup"),
  ]);

  if (!isRecord(user) || typeof user.id !== "number" || typeof user.login !== "string") {
    throw new Error("GitHub user lookup returned an unexpected shape");
  }
  const primary = Array.isArray(emails)
    ? emails.find(
        (e): e is { email: string } =>
          isRecord(e) && e.primary === true && e.verified === true && typeof e.email === "string",
      )
    : undefined;
  if (!primary) {
    throw new AppError(
      403,
      "GITHUB_NO_EMAIL",
      "Your GitHub account has no verified primary email.",
    );
  }

  const name = typeof user.name === "string" && user.name.trim() ? user.name.trim() : null;
  return {
    githubId: String(user.id),
    email: primary.email.trim().toLowerCase(),
    name,
    login: user.login,
    avatarUrl: typeof user.avatar_url === "string" ? user.avatar_url : null,
  };
}
