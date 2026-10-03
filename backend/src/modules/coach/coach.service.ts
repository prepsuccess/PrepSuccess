import { prisma } from "../../db/prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";
import { AppError } from "../../lib/http.js";
import { logger } from "../../lib/logger.js";
import { startOfIndianDay } from "../../services/ai-agent/access.js";
import { generateText } from "../../services/ai-agent/ai.service.js";
import { notify } from "../../services/notifications/notifications.service.js";
import { getDashboard } from "../dashboard/dashboard.service.js";
import {
  COACH_DAILY_LIMIT,
  HISTORY_WINDOW,
  MAX_STORED_MESSAGES,
  buildCoachPrompt,
  buildNudgePrompt,
  fallbackNudge,
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

/** Saves messages to the student's one coach conversation, keeping the latest. */
async function saveMessages(
  userId: string,
  conversationId: string | null,
  messages: CoachChatMessage[],
) {
  const kept = messages.slice(-MAX_STORED_MESSAGES) as unknown as Prisma.InputJsonArray;
  if (conversationId) {
    await prisma.aIConversation.update({ where: { id: conversationId }, data: { messages: kept } });
  } else {
    await prisma.aIConversation.create({ data: { userId, agentType: "COACH", messages: kept } });
  }
}

/** Successful coach replies today: a failed AI call never uses up a message. */
async function usage(userId: string, now = new Date()) {
  const start = startOfIndianDay(now);
  const used = await prisma.aiUsage.count({
    where: { userId, feature: "coach", success: true, createdAt: { gte: start } },
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

/**
 * POST /ai/coach/messages — one AI call with the student's live data in the
 * prompt. Nothing is saved if the AI fails, so the student can send again.
 */
export async function sendCoachMessage(userId: string, content: string) {
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
  const history = [...messages, question]
    .slice(-HISTORY_WINDOW)
    .map(({ role, content: body }) => ({ role, content: body }));

  const { data: reply } = await generateText({
    userId,
    feature: "coach",
    system: buildCoachPrompt(context),
    messages: history,
    temperature: 0.5,
    maxOutputTokens: 800,
  });

  const updated: CoachChatMessage[] = [
    ...messages,
    question,
    { role: "assistant", content: reply, created_at: new Date().toISOString() },
  ];
  await saveMessages(userId, conversation?.id ?? null, updated);
  return toState(userId, updated.slice(-MAX_STORED_MESSAGES), context);
}

/** DELETE /ai/coach — starts a fresh chat. Today's message count is unchanged. */
export async function clearCoach(userId: string) {
  const conversation = await getConversation(userId);
  if (conversation) await saveMessages(userId, conversation.id, []);
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

  await sendNudge(userId);
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

  const conversation = await getConversation(userId);
  await saveMessages(userId, conversation?.id ?? null, [
    ...asMessages(conversation?.messages),
    { role: "assistant", content: tip, created_at: new Date().toISOString(), nudge: true },
  ]);
  await notify(userId, { type: "COACH_NUDGE", title: "Your coach has a tip", body: tip });
}
