import { prisma } from "../../db/prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";
import { AppError } from "../../lib/http.js";
import { logger } from "../../lib/logger.js";
import { startOfIndianDay } from "../../lib/time.js";
import { generateText } from "../../services/ai-agent/ai.service.js";
import { notify } from "../../services/notifications/notifications.service.js";
import { getDashboard } from "../dashboard/dashboard.service.js";
import {
  COACH_DAILY_LIMIT,
  MAX_STORED_MESSAGES,
  buildCoachPrompt,
  buildNudgePrompt,
  fallbackNudge,
  historyWindow,
  suggestions,
  trackActivity,
  type CoachContext,
} from "./coach.logic.js";
import type { CoachChatMessage, CoachState } from "./coach.schemas.js";

const DAY_MS = 86_400_000;

function asMessages(value: unknown): CoachChatMessage[] {
  return Array.isArray(value) ? (value as CoachChatMessage[]) : [];
}

/** Everything the coach knows about the student: profile, dashboard and recent tasks. No AI. */
async function loadContext(userId: string): Promise<CoachContext> {
  const [user, dashboard, submissions] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, include: { profile: true } }),
    getDashboard(userId),
    prisma.userTaskSubmission.findMany({
      where: { userId },
      include: { task: { include: { skill: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);
  if (!user || !user.isActive || user.isDeleted) {
    throw new AppError(401, "UNAUTHORIZED", "Sign in to continue.");
  }
  const profile = user.profile?.profileData;
  return {
    firstName: user.firstName,
    profile:
      profile && typeof profile === "object" && !Array.isArray(profile)
        ? (profile as Record<string, unknown>)
        : {},
    dashboard,
    recentTasks: submissions.map((s) => ({
      title: s.task.title,
      skill: s.task.skill.name,
      percent: Math.round(s.score ?? 0),
      passed: s.passed ?? false,
    })),
  };
}

async function getConversation(userId: string) {
  return prisma.aIConversation.findFirst({
    where: { userId, agentType: "COACH" },
    orderBy: { createdAt: "asc" },
  });
}

/** The student's coach conversation, row-locked until the transaction ends. */
async function lockConversation(tx: Prisma.TransactionClient, userId: string) {
  const rows = await tx.$queryRaw<{ id: string; messages: unknown }[]>`
    SELECT id, messages FROM ai_conversations
    WHERE user_id = ${userId}::uuid AND agent_type = 'COACH'
    ORDER BY created_at ASC
    LIMIT 1
    FOR UPDATE`;
  return rows[0] ?? null;
}

/**
 * Saves to the student's one coach conversation, keeping the latest
 * MAX_STORED_MESSAGES. Appends to the messages as they are now (not the copy
 * read before the AI call), so a reply and a check-in landing together don't
 * overwrite each other. `replace` swaps the whole list (used to clear it).
 * Returns the saved messages.
 */
async function saveMessages(
  userId: string,
  messages: CoachChatMessage[],
  { replace = false }: { replace?: boolean } = {},
) {
  return prisma.$transaction(async (tx) => {
    let conversation = await lockConversation(tx, userId);
    if (!conversation && replace && messages.length === 0) return [];
    if (!conversation) {
      // First save: serialise creators so two first messages make one conversation.
      await tx.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(hashtext(${userId} || 'COACH'))`;
      conversation = await lockConversation(tx, userId);
    }
    const current = replace ? [] : asMessages(conversation?.messages);
    const kept = [...current, ...messages].slice(-MAX_STORED_MESSAGES);
    const json = kept as unknown as Prisma.InputJsonArray;
    if (conversation) {
      await tx.aIConversation.update({ where: { id: conversation.id }, data: { messages: json } });
    } else {
      await tx.aIConversation.create({ data: { userId, agentType: "COACH", messages: json } });
    }
    return kept;
  });
}

/** Successful coach replies today: a failed AI call never uses up a message. */
async function usage(userId: string, now = new Date()) {
  const start = startOfIndianDay(now);
  const used = await prisma.aiUsage.count({
    where: { userId, feature: "coach", success: true, system: false, createdAt: { gte: start } },
  });
  return {
    used,
    limit: COACH_DAILY_LIMIT,
    remaining: Math.max(0, COACH_DAILY_LIMIT - used),
    resets_at: new Date(start.getTime() + DAY_MS).toISOString(),
  };
}

async function toState(userId: string, messages: CoachChatMessage[], context?: CoachContext) {
  const [today, ctx] = await Promise.all([usage(userId), context ?? loadContext(userId)]);
  return { messages, usage: today, suggestions: suggestions(ctx) } satisfies CoachState;
}

/** GET /ai/coach — the conversation, today's allowance and starter questions. */
export async function getCoach(userId: string) {
  const conversation = await getConversation(userId);
  return toState(userId, asMessages(conversation?.messages));
}

/** Students with a coach message waiting on the AI (this process only). */
const inFlight = new Set<string>();

/**
 * POST /ai/coach/messages — one AI call with the student's live data in the
 * prompt. Nothing is saved if the AI fails, so the student can send again.
 */
export async function sendCoachMessage(userId: string, content: string) {
  // One message at a time per student: two in flight would both pass the daily count.
  if (inFlight.has(userId)) {
    throw new AppError(429, "COACH_BUSY", "Wait for the coach to answer your last message.");
  }
  inFlight.add(userId);
  try {
    return await answer(userId, content);
  } finally {
    inFlight.delete(userId);
  }
}

async function answer(userId: string, content: string) {
  const today = await usage(userId);
  if (today.remaining <= 0) {
    throw new AppError(
      429,
      "COACH_DAILY_LIMIT",
      `You've used today's ${COACH_DAILY_LIMIT} coach messages. They reset at midnight.`,
    );
  }

  const [context, conversation] = await Promise.all([loadContext(userId), getConversation(userId)]);
  const messages = asMessages(conversation?.messages);
  const question: CoachChatMessage = {
    role: "user",
    content,
    created_at: new Date().toISOString(),
  };
  const history = historyWindow([...messages, question]);

  const { data: reply } = await generateText({
    userId,
    feature: "coach",
    system: buildCoachPrompt(context),
    messages: history,
    temperature: 0.5,
    maxOutputTokens: 800,
  });

  const saved = await saveMessages(userId, [
    question,
    { role: "assistant", content: reply, created_at: new Date().toISOString() },
  ]);
  return toState(userId, saved, context);
}

/** DELETE /ai/coach — starts a fresh chat. Today's message count is unchanged. */
export async function clearCoach(userId: string) {
  await saveMessages(userId, [], { replace: true });
  return toState(userId, []);
}

/**
 * POST /ai/coach/ping — the app calls this every few minutes while the tab is
 * visible. Thirty minutes into a session, once a day, the coach checks in:
 * a short tip lands in the chat and as a notification (which the app toasts).
 */
export async function ping(userId: string, now = new Date()) {
  const previous = await prisma.userActivity.findUnique({ where: { userId } });
  const { activity, nudgeDue } = trackActivity(previous, now);
  await prisma.userActivity.upsert({
    where: { userId },
    create: { userId, ...activity },
    update: { sessionStartedAt: activity.sessionStartedAt, lastSeenAt: activity.lastSeenAt },
  });
  if (!nudgeDue) return { nudged: false };

  // Claim today's check-in atomically, so two open tabs can't both send it.
  const claimed = await prisma.userActivity.updateMany({
    where: {
      userId,
      OR: [{ lastNudgeAt: null }, { lastNudgeAt: { lt: startOfIndianDay(now) } }],
    },
    data: { lastNudgeAt: now },
  });
  if (claimed.count === 0) return { nudged: false };

  try {
    await sendNudge(userId);
  } catch (error) {
    // Release today's claim so a later ping can try again.
    logger.error({ err: error, userId }, "Coach check-in failed");
    await prisma.userActivity
      .updateMany({
        where: { userId, lastNudgeAt: now },
        data: { lastNudgeAt: previous?.lastNudgeAt ?? null },
      })
      .catch((err: unknown) => logger.error({ err, userId }, "Couldn't release the check-in"));
    return { nudged: false };
  }
  return { nudged: true };
}

async function sendNudge(userId: string) {
  const context = await loadContext(userId);
  let tip = fallbackNudge(context);
  try {
    const { data } = await generateText({
      userId,
      feature: "coach_nudge",
      system: buildNudgePrompt(context),
      messages: [{ role: "user", content: "Write the check-in." }],
      temperature: 0.6,
      maxOutputTokens: 200,
      // A check-in the student didn't ask for shouldn't use up their AI allowance.
      systemCall: true,
    });
    if (data && data.length <= 400) tip = data;
  } catch (error) {
    logger.warn({ err: error, userId }, "Coach check-in used the fallback");
  }

  await saveMessages(userId, [
    { role: "assistant", content: tip, created_at: new Date().toISOString(), nudge: true },
  ]);
  await notify(userId, { type: "COACH_NUDGE", title: "Your coach has a tip", body: tip });
}
