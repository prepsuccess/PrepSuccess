import "dotenv/config";
import { z } from "zod";

/**
 * Validated, typed environment. The app refuses to boot with a bad config
 * instead of failing later on first use. Optional keys belong to features
 * that aren't built yet (AI) — tighten them as each one lands.
 * SMTP is optional outside production: without it, OTP emails are logged.
 * Google keys are optional: without them, /auth/google answers 503.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8000),
  CORS_ORIGINS: z
    .string()
    .default("http://localhost:3000")
    .transform((value) => value.split(",").map((origin) => origin.trim())),
  /** Public URL of this API (no trailing slash). Builds the Google OAuth redirect URI. */
  API_PUBLIC_URL: z.url().default("http://localhost:8000"),
  /** Public URL of the Next.js app (no trailing slash). Google sign-in redirects back here. */
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
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
  /** Serve Swagger UI at /docs. Defaults to on outside production. */
  API_DOCS_ENABLED: z.enum(["true", "false"]).optional(),
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
