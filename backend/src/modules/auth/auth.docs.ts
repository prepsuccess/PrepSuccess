import { z } from "zod";
import type { ZodOpenApiPathsObject } from "zod-openapi";

import { RATE_LIMIT_429, VALIDATION_422, bearerAuth, errors, ok } from "../../docs/helpers.js";
import {
  authUserSchema,
  forgotPasswordSchema,
  googleStartQuerySchema,
  resetPasswordSchema,
  loginSchema,
  messageSchema,
  refreshSchema,
  registerSchema,
  sendOtpResponseSchema,
  sendOtpSchema,
  tokenResponseSchema,
} from "./auth.schemas.js";

const json = <T>(schema: T) => ({ content: { "application/json": { schema } } });

export const authPaths: ZodOpenApiPathsObject = {
  "/api/v1/auth/send-otp": {
    post: {
      tags: ["Auth"],
      summary: "Email a signup verification code",
      description:
        "Step 1 of signup. Emails a 6-digit code valid for 10 minutes. Only the newest code works. " +
        "A new code can be requested once every 60 seconds.",
      requestBody: json(sendOtpSchema),
      responses: {
        ...ok(sendOtpResponseSchema, "Code sent."),
        ...errors({
          409: "`EMAIL_ALREADY_REGISTERED` — log in instead.",
          ...VALIDATION_422,
          429: "`OTP_RECENTLY_SENT` (60s cooldown) or `TOO_MANY_REQUESTS`.",
          503: "`EMAIL_SEND_FAILED` — try again.",
        }),
      },
    },
  },
  "/api/v1/auth/register": {
    post: {
      tags: ["Auth"],
      summary: "Create an account with the emailed code",
      description:
        "Step 2 of signup. Verifies the OTP (3 attempts), creates the user and their profile, and signs them in.",
      requestBody: json(registerSchema),
      responses: {
        ...ok(tokenResponseSchema, "Account created and signed in.", "201"),
        ...errors({
          400: "`OTP_INVALID`, `OTP_EXPIRED` or `OTP_TOO_MANY_ATTEMPTS`.",
          409: "`EMAIL_ALREADY_REGISTERED`.",
          ...VALIDATION_422,
          ...RATE_LIMIT_429,
        }),
      },
    },
  },
  "/api/v1/auth/login": {
    post: {
      tags: ["Auth"],
      summary: "Log in with email and password",
      requestBody: json(loginSchema),
      responses: {
        ...ok(tokenResponseSchema, "Signed in."),
        ...errors({
          401: "`INVALID_CREDENTIALS` — same message whether the email or the password is wrong.",
          403: "`ACCOUNT_DEACTIVATED`.",
          ...VALIDATION_422,
          ...RATE_LIMIT_429,
        }),
      },
    },
  },
  "/api/v1/auth/forgot-password": {
    post: {
      tags: ["Auth"],
      summary: "Email a password-reset code",
      description:
        "Step 1 of a password reset. Emails a 6-digit code valid for 10 minutes to an active account. " +
        "Always answers 200 with the same message, whether or not the email is registered and even " +
        "inside the 60-second resend cooldown, so it can't be used to discover accounts. The email " +
        "is sent in the background, so a mail failure doesn't change the answer either.",
      requestBody: json(forgotPasswordSchema),
      responses: {
        ...ok(sendOtpResponseSchema, "Code sent if the account exists."),
        ...errors({ ...VALIDATION_422, ...RATE_LIMIT_429 }),
      },
    },
  },
  "/api/v1/auth/reset-password": {
    post: {
      tags: ["Auth"],
      summary: "Set a new password with the emailed code",
      description:
        "Step 2. Verifies the code (3 attempts), sets the new password, signs the account out of " +
        "every other session and signs this one in. A Google-only account gains a password this way.",
      requestBody: json(resetPasswordSchema),
      responses: {
        ...ok(tokenResponseSchema, "Password changed and signed in."),
        ...errors({
          400: "`OTP_INVALID`, `OTP_EXPIRED` or `OTP_TOO_MANY_ATTEMPTS`.",
          ...VALIDATION_422,
          ...RATE_LIMIT_429,
        }),
      },
    },
  },
  "/api/v1/auth/refresh": {
    post: {
      tags: ["Auth"],
      summary: "Exchange a refresh token for a new token pair",
      description:
        "Rotates the refresh token: the one you send is revoked and a new pair is returned. " +
        "If the token was rotated less than 60 seconds ago (another tab refreshed at the same " +
        "moment), answers 409 and revokes nothing — retry with the newest token. Replaying a token " +
        "rotated longer ago signs the user out of every session.",
      requestBody: json(refreshSchema),
      responses: {
        ...ok(tokenResponseSchema, "New tokens issued."),
        ...errors({
          401: "`INVALID_REFRESH_TOKEN` — sign in again.",
          409: "`REFRESH_RACE` — another tab just refreshed; use its tokens or retry.",
          ...VALIDATION_422,
          ...RATE_LIMIT_429,
        }),
      },
    },
  },
  "/api/v1/auth/logout": {
    post: {
      tags: ["Auth"],
      summary: "Revoke a refresh token",
      description: "Always succeeds, even for an unknown or already-revoked token.",
      requestBody: json(refreshSchema),
      responses: { ...ok(messageSchema, "Signed out."), ...errors(VALIDATION_422) },
    },
  },
  "/api/v1/auth/me": {
    get: {
      tags: ["Auth"],
      summary: "Get the signed-in user",
      security: bearerAuth,
      responses: {
        ...ok(authUserSchema, "The current user."),
        ...errors({
          401:
            "`UNAUTHORIZED` (no token, or the account is deactivated/deleted) or " +
            "`INVALID_TOKEN` (expired/invalid).",
        }),
      },
    },
  },
  "/api/v1/auth/google": {
    get: {
      tags: ["Auth"],
      summary: "Start Google sign-in (browser redirect)",
      description:
        "Open this URL in the browser (a link, not fetch). Redirects to Google's consent screen. " +
        "Google then returns to `/api/v1/auth/google/callback`, which redirects to the frontend's " +
        "`/auth/callback#access_token=…&refresh_token=…&next=…&nonce=…`, or to " +
        "`/login?error=<code>` on failure. `nonce` is echoed back unchanged; the frontend must " +
        "check it matches the one it sent. Without Google keys on the server it redirects to " +
        "`/login?error=google_not_configured`; an invalid `nonce` redirects to `/login?error=google_failed`.",
      requestParams: { query: googleStartQuerySchema },
      responses: {
        302: { description: "Redirect to Google's consent screen, or to `/login?error=<code>`." },
        ...errors(RATE_LIMIT_429),
      },
    },
  },
  "/api/v1/auth/google/callback": {
    get: {
      tags: ["Auth"],
      summary: "Google OAuth callback (called by Google)",
      description:
        "Not called directly. Verifies `state` + PKCE, exchanges the code, then logs in the Google user, " +
        "links Google to an existing account with the same email, or creates a new account. " +
        "Error codes sent to `/login?error=`: `google_cancelled`, `google_failed`, `google_session_expired`, " +
        "`google_email_unverified`, `google_account_conflict`, `account_deactivated`.",
      requestParams: {
        query: z.object({
          code: z.string().optional(),
          state: z.string().optional(),
          error: z.string().optional(),
        }),
      },
      responses: {
        302: {
          description: "Redirect to the frontend with tokens (URL fragment) or an error code.",
        },
      },
    },
  },
};
