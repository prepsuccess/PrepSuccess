import { CodeChallengeMethod, OAuth2Client } from "google-auth-library";

import { env } from "../../config/env.js";

/**
 * Google OAuth 2.0 (authorization code + PKCE). The client secret and the
 * code exchange stay on the server; the browser only ever sees our own JWTs.
 * Must match "Authorized redirect URIs" in Google Cloud Console.
 */
export const GOOGLE_REDIRECT_URI = `${env.API_PUBLIC_URL}/api/v1/auth/google/callback`;

const client =
  env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
    ? new OAuth2Client({
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        redirectUri: GOOGLE_REDIRECT_URI,
      })
    : null;

export const isGoogleConfigured = () => client !== null;

export interface GoogleIdentity {
  googleId: string;
  email: string;
  emailVerified: boolean;
  firstName: string | null;
  lastName: string | null;
  picture: string | null;
}

/** Builds the consent-screen URL plus the PKCE verifier to keep until the callback. */
export async function createGoogleAuthRequest(state: string) {
  if (!client) throw new Error("Google OAuth is not configured");
  const { codeVerifier, codeChallenge } = await client.generateCodeVerifierAsync();
  const url = client.generateAuthUrl({
    scope: ["openid", "email", "profile"],
    state,
    code_challenge: codeChallenge,
    code_challenge_method: CodeChallengeMethod.S256,
    prompt: "select_account",
  });
  return { url, codeVerifier };
}

/** Exchanges the callback code and returns the verified identity from Google's ID token. */
export async function exchangeGoogleCode(
  code: string,
  codeVerifier: string,
): Promise<GoogleIdentity> {
  if (!client) throw new Error("Google OAuth is not configured");
  const { tokens } = await client.getToken({ code, codeVerifier });
  if (!tokens.id_token) throw new Error("Google returned no ID token");

  // Checks signature, expiry, issuer and that the token was minted for our client ID.
  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.email) throw new Error("Google ID token is missing sub or email");

  return {
    googleId: payload.sub,
    email: payload.email.trim().toLowerCase(),
    emailVerified: payload.email_verified === true,
    firstName: payload.given_name ?? null,
    lastName: payload.family_name ?? null,
    picture: payload.picture ?? null,
  };
}
