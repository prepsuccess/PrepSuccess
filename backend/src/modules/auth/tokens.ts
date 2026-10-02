import jwt from "jsonwebtoken";

import { env } from "../../config/env.js";
import { prisma } from "../../db/prisma.js";
import type { Prisma, Role } from "../../generated/prisma/client.js";
import { durationToMs, hashSecret, randomToken } from "../../lib/crypto.js";

/**
 * Dual-token strategy (PRODUCTION_STANDARDS §3.1):
 * - access token: short-lived HS256 JWT with minimal claims (sub, role)
 * - refresh token: opaque random string, stored only as an HMAC hash so it
 *   can be revoked and rotated; reusing a rotated token revokes the family.
 */

const ACCESS_TTL_MS = durationToMs(env.JWT_ACCESS_TTL);
const REFRESH_TTL_MS = durationToMs(env.JWT_REFRESH_TTL);

export interface AccessClaims {
  sub: string;
  role: Role;
}

export function signAccessToken(userId: string, role: Role): string {
  return jwt.sign({ role }, env.JWT_ACCESS_SECRET, {
    algorithm: "HS256",
    subject: userId,
    expiresIn: Math.floor(ACCESS_TTL_MS / 1000),
  });
}

/** Throws on a bad signature, wrong algorithm or expiry. */
export function verifyAccessToken(token: string): AccessClaims {
  const payload = jwt.verify(token, env.JWT_ACCESS_SECRET, { algorithms: ["HS256"] });
  if (typeof payload === "string" || !payload.sub || typeof payload.role !== "string") {
    throw new Error("Malformed access token");
  }
  return { sub: payload.sub, role: payload.role as Role };
}

type Db = Prisma.TransactionClient | typeof prisma;

/** Creates and stores a new refresh token; returns the raw value for the client. */
export async function createRefreshToken(userId: string, db: Db = prisma): Promise<string> {
  const token = randomToken();
  await db.refreshToken.create({
    data: {
      userId,
      tokenHash: hashSecret(token),
      expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
    },
  });
  return token;
}

export async function issueTokens(userId: string, role: Role, db: Db = prisma) {
  return {
    access_token: signAccessToken(userId, role),
    refresh_token: await createRefreshToken(userId, db),
    token_type: "bearer" as const,
    expires_in: Math.floor(ACCESS_TTL_MS / 1000),
  };
}
