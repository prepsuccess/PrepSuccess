import { prisma } from "../../db/prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";
import { AppError } from "../../lib/http.js";
import { generateJson } from "../../services/ai-agent/ai.service.js";
import { toAuthUser } from "../auth/auth.dto.js";
import {
  FIELD_LABELS,
  HISTORY_WINDOW,
  MAX_STUDENT_TURNS,
  REQUIRED_FIELDS,
  aiTurnSchema,
  buildSystemPrompt,
  cleanPicks,
  greeting,
  isComplete,
  mergeProfile,
  missingFields,
  sanitizeExtracted,
  skillOptions,
  type ProfileData,
} from "./onboarding.logic.js";
import type { ChatMessage, OnboardingState } from "./onboarding.schemas.js";

const withProfile = { profile: true } as const;

async function loadUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: withProfile });
  if (!user || !user.isActive || user.isDeleted) {
    throw new AppError(401, "UNAUTHORIZED", "Sign in to continue.");
  }
  return user;
}

function asProfile(value: unknown): ProfileData {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as ProfileData) : {};
}

function asMessages(value: unknown): ChatMessage[] {
  return Array.isArray(value) ? (value as ChatMessage[]) : [];
}

/** One onboarding conversation per student; created with a fixed greeting (no AI call). */
async function getOrCreateConversation(userId: string, firstName: string) {
  const existing = await prisma.aIConversation.findFirst({
    where: { userId, agentType: "ONBOARDING" },
    orderBy: { createdAt: "asc" },
  });
  if (existing) return existing;
  const opening: ChatMessage = {
    role: "assistant",
    content: greeting(firstName),
    created_at: new Date().toISOString(),
  };
  return prisma.aIConversation.create({
    data: { userId, agentType: "ONBOARDING", messages: [opening] as Prisma.InputJsonArray },
  });
}

function toState(
  conversationId: string,
  messages: ChatMessage[],
  profile: ProfileData,
): OnboardingState {
  const missing = new Set<string>(missingFields(profile));
  const items = REQUIRED_FIELDS.map((field) => ({
    field,
    label: FIELD_LABELS[field],
    done: !missing.has(field),
  }));
  return {
    conversation_id: conversationId,
    messages,
    completed: missing.size === 0,
    progress: { collected: items.filter((item) => item.done).length, total: items.length, items },
    profile,
    skill_options: skillOptions(),
  };
}

/** GET /ai/onboarding — the conversation so far (starting it if needed) and what's collected. */
export async function getOnboarding(userId: string) {
  const user = await loadUser(userId);
  const conversation = await getOrCreateConversation(userId, user.firstName);
  return toState(
    conversation.id,
    asMessages(conversation.messages),
    asProfile(user.profile?.profileData),
  );
}

/**
 * POST /ai/onboarding/messages — one turn: the student's message goes to the
 * AI with the profile so far; facts it extracts are validated and merged; the
 * reply is saved. Nothing is saved if the AI call fails, so the student can
 * simply send again.
 */
export async function sendMessage(userId: string, content: string, picked: string[] = []) {
  const user = await loadUser(userId);
  if (user.profile?.onboardingCompletedAt) {
    throw new AppError(
      409,
      "ONBOARDING_COMPLETE",
      "Your onboarding is already done. Edit your details on your profile.",
    );
  }

  const conversation = await getOrCreateConversation(userId, user.firstName);
  const messages = asMessages(conversation.messages);
  if (messages.filter((message) => message.role === "user").length >= MAX_STUDENT_TURNS) {
    throw new AppError(
      400,
      "ONBOARDING_TOO_LONG",
      "This chat is long enough. You can add anything else on your profile page.",
    );
  }

  // Picked skills are saved exactly as chosen, before the AI sees the turn —
  // the student, not the model, decides what's on the list.
  const picks = cleanPicks(picked);
  const profile = mergeProfile(
    asProfile(user.profile?.profileData),
    picks.length ? { skills: picks } : {},
  );
  const studentMessage: ChatMessage = {
    role: "user",
    content,
    created_at: new Date().toISOString(),
  };
  const history = [...messages, studentMessage]
    .slice(-HISTORY_WINDOW)
    .map(({ role, content: text }) => ({ role, content: text }));

  const { data: turn } = await generateJson(
    {
      userId,
      feature: "onboarding",
      system: buildSystemPrompt(user.firstName, profile),
      messages: history,
      temperature: 0.4,
      maxOutputTokens: 600,
    },
    aiTurnSchema,
  );

  const merged = mergeProfile(profile, sanitizeExtracted(turn.extracted));
  const completedAt = isComplete(merged) ? new Date() : null;
  const reply: ChatMessage = {
    role: "assistant",
    content: turn.reply,
    created_at: new Date().toISOString(),
  };
  const updatedMessages = [...messages, studentMessage, reply];
  const profileData = merged as Prisma.InputJsonObject;

  const updatedUser = await prisma.$transaction(async (tx) => {
    await tx.aIConversation.update({
      where: { id: conversation.id },
      data: { messages: updatedMessages as Prisma.InputJsonArray },
    });
    return tx.user.update({
      where: { id: userId },
      data: {
        profile: {
          upsert: {
            create: { profileData, onboardingCompletedAt: completedAt },
            update: { profileData, onboardingCompletedAt: completedAt },
          },
        },
      },
      include: withProfile,
    });
  });

  return {
    onboarding: toState(conversation.id, updatedMessages, merged),
    user: toAuthUser(updatedUser),
  };
}
