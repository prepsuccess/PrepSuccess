import { env } from "../../config/env.js";
import { prisma } from "../../db/prisma.js";

/**
 * AI free trial + daily quota (SCRUM-129). The trial runs AI_TRIAL_DAYS from
 * signup. While AI_TRIAL_ENFORCED is false (the current product decision) an
 * expired trial is only reported, never blocked — the daily limit always
 * applies, because every user shares one free-tier Gemini quota.
 */
const DAY_MS = 86_400_000;

export interface AiAccess {
  allowed: boolean;
  /** Why `allowed` is false: AI_TRIAL_ENDED or AI_DAILY_LIMIT. */
  reason: "AI_TRIAL_ENDED" | "AI_DAILY_LIMIT" | null;
  trial: { active: boolean; ends_at: string; days_left: number; enforced: boolean };
  today: { requests: number; limit: number };
}

/** Start of the current day in India (UTC+5:30), when the daily limit resets. */
export function startOfIndianDay(now = new Date()): Date {
  const IST_OFFSET_MS = 330 * 60_000;
  const local = new Date(now.getTime() + IST_OFFSET_MS);
  local.setUTCHours(0, 0, 0, 0);
  return new Date(local.getTime() - IST_OFFSET_MS);
}

export async function getAiAccess(
  userId: string,
  signedUpAt: Date,
  now = new Date(),
): Promise<AiAccess> {
  const endsAt = new Date(signedUpAt.getTime() + env.AI_TRIAL_DAYS * DAY_MS);
  const trialActive = now < endsAt;
  const enforced = env.AI_TRIAL_ENFORCED === "true";

  const requests = await prisma.aiUsage.count({
    where: { userId, success: true, createdAt: { gte: startOfIndianDay(now) } },
  });

  const reason =
    enforced && !trialActive
      ? "AI_TRIAL_ENDED"
      : requests >= env.AI_DAILY_REQUEST_LIMIT
        ? "AI_DAILY_LIMIT"
        : null;

  return {
    allowed: reason === null,
    reason,
    trial: {
      active: trialActive,
      ends_at: endsAt.toISOString(),
      days_left: Math.max(0, Math.ceil((endsAt.getTime() - now.getTime()) / DAY_MS)),
      enforced,
    },
    today: { requests, limit: env.AI_DAILY_REQUEST_LIMIT },
  };
}
