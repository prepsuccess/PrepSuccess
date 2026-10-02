import { createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";

import { env } from "../config/env.js";

/**
 * Keyed hash for secrets we must look up but never store in plain text
 * (refresh tokens, OTP codes). HMAC rather than a bare SHA-256 so a leaked
 * database alone can't be brute-forced — a 6-digit OTP has only 1M values.
 */
export function hashSecret(value: string): string {
  return createHmac("sha256", env.JWT_REFRESH_SECRET).update(value).digest("hex");
}

export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

/** Opaque, URL-safe random token (refresh tokens). */
export function randomToken(bytes = 48): string {
  return randomBytes(bytes).toString("base64url");
}

/** Uniformly random 6-digit code, zero-padded. */
export function generateOtp(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

const UNIT_MS = { s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000 } as const;

/** Parses durations like "30m", "7d", "45s" (the JWT_*_TTL format) into milliseconds. */
export function durationToMs(value: string): number {
  const match = /^(\d+)([smhd])$/.exec(value.trim());
  if (!match) throw new Error(`Invalid duration "${value}" — use e.g. 30m, 12h, 7d.`);
  return Number(match[1]) * UNIT_MS[match[2] as keyof typeof UNIT_MS];
}
