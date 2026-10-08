import "dotenv/config";
import { z } from "zod";

/**
 * Validated, typed environment. The app refuses to boot with a bad config
 * instead of failing later on first use. Optional keys belong to features
 * that aren't fully built yet — tighten them as each one lands.
 * Without GEMINI_API_KEY, AI endpoints answer 503 AI_NOT_CONFIGURED.
 * SMTP is optional outside production: without it, OTP emails are logged.
 * Google and GitHub keys are optional: without them, /auth/google and
 * /auth/github send the browser back to /login with a *_not_configured error.
 */
const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(8000),
    CORS_ORIGINS: z
      .string()
      .default("http://localhost:3000")
      .transform((value) => value.split(",").map((origin) => origin.trim())),
    /** Public URL of this API (no trailing slash). Builds the Google and GitHub OAuth redirect URIs. */
    API_PUBLIC_URL: z.url().default("http://localhost:8000"),
    /** Public URL of the Next.js app (no trailing slash). Google/GitHub sign-in redirects back here. */
    FRONTEND_URL: z.url().default("http://localhost:3000"),
    DATABASE_URL: z.string().min(1),
    DIRECT_URL: z.string().optional(),
    JWT_ACCESS_SECRET: z.string().min(32, "Use at least 32 random characters."),
    /** Also keys the HMAC used to hash refresh tokens and OTP codes at rest. */
    JWT_REFRESH_SECRET: z.string().min(32, "Use at least 32 random characters."),
    JWT_ACCESS_TTL: z.string().default("30m"),
    JWT_REFRESH_TTL: z.string().default("7d"),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    /** GitHub OAuth App. Callback URL: `${API_PUBLIC_URL}/api/v1/auth/github/callback`. */
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    /** Inbox for student feedback emails. Defaults to SMTP_USER. */
    FEEDBACK_EMAIL: z.string().email().optional(),
    // ---- AI (services/ai-agent) ----
    /** "fake" returns scripted replies (tests); "gemini" calls Google. */
    AI_PROVIDER: z.enum(["gemini", "fake"]).default("gemini"),
    GEMINI_API_KEY: z.string().optional(),
    GEMINI_MODEL: z.string().min(1).default("gemini-3.5-flash"),
    /** Tried when the main model is overloaded or rate-limited. Empty disables it. */
    GEMINI_FALLBACK_MODEL: z.string().default("gemini-3.1-flash-lite"),
    AI_TIMEOUT_MS: z.coerce.number().int().positive().default(30_000),
    /** Free-trial length from signup. Metered from day one; only blocks when enforced. */
    AI_TRIAL_DAYS: z.coerce.number().int().positive().default(120),
    AI_TRIAL_ENFORCED: z.enum(["true", "false"]).default("false"),
    /** Successful AI calls per user per day — protects the shared free-tier quota. */
    AI_DAILY_REQUEST_LIMIT: z.coerce.number().int().positive().default(200),
    // ---- Monitoring ----
    /** Sentry project DSN. Empty disables error tracking. */
    SENTRY_DSN: z.string().optional(),
    /** Defaults to NODE_ENV; set "staging" on the staging service. */
    SENTRY_ENVIRONMENT: z.string().optional(),
    /** Share of requests traced for performance (0-1). Errors are always sent. */
    SENTRY_TRACES_SAMPLE_RATE: z.coerce.number().min(0).max(1).default(0),
    LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
    /** Serve Swagger UI at /docs. Defaults to on outside production. */
    API_DOCS_ENABLED: z.enum(["true", "false"]).optional(),
  })
  .superRefine((env, ctx) => {
    // The localhost defaults are for development. In production a missing URL would
    // send Google sign-in (and CORS) to localhost, so refuse to boot instead.
    if (env.NODE_ENV !== "production") return;
    const local = (url: string) => /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(url);
    for (const key of ["API_PUBLIC_URL", "FRONTEND_URL"] as const) {
      if (local(env[key])) {
        ctx.addIssue({
          code: "custom",
          path: [key],
          message: "Set the public URL for production.",
        });
      }
    }
    if (env.CORS_ORIGINS.some(local)) {
      ctx.addIssue({
        code: "custom",
        path: ["CORS_ORIGINS"],
        message: "Set the frontend's public origin for production.",
      });
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", z.flattenError(parsed.error).fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export const isProduction = env.NODE_ENV === "production";
export const apiDocsEnabled = env.API_DOCS_ENABLED
  ? env.API_DOCS_ENABLED === "true"
  : !isProduction;

/** True when both GitHub OAuth keys are set. */
export const isGithubConfigured = () => Boolean(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET);
