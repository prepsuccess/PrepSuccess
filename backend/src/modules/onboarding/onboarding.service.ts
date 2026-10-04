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
  followUpReply,
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
  completed: boolean,
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
    // The same source of truth as the dashboard and the signed-in user.
    completed,
    progress: { collected: items.filter((item) => item.done).length, total: items.length, items },
    profile,
    skill_options: skillOptions(),
  };
}

/**
 * Marks onboarding complete once every required detail is in the profile,
 * however it got there (this chat, or the profile page). Call it after any
 * profile write. Returns when onboarding was completed, or null if it isn't
 * yet. Never un-completes: removing a detail later doesn't send the student
 * back to the chat.
 */
export async function markOnboardingCompleteIfReady(
  tx: Prisma.TransactionClient,
  userId: string,
  profile: { profileData: unknown; onboardingCompletedAt: Date | null } | null,
): Promise<Date | null> {
  if (!profile) return null;
  if (profile.onboardingCompletedAt) return profile.onboardingCompletedAt;
  if (!isComplete(asProfile(profile.profileData))) return null;
  const completedAt = new Date();
  await tx.userProfile.updateMany({
    where: { userId, onboardingCompletedAt: null },
    data: { onboardingCompletedAt: completedAt },
  });
  return completedAt;
}

/** GET /ai/onboarding — the conversation so far (starting it if needed) and what's collected. */
export async function getOnboarding(userId: string) {
  const user = await loadUser(userId);
  const conversation = await getOrCreateConversation(userId, user.firstName);
  const completedAt = await markOnboardingCompleteIfReady(prisma, userId, user.profile);
  return toState(
    conversation.id,
    asMessages(conversation.messages),
    asProfile(user.profile?.profileData),
    completedAt !== null,
  );
}

/** Said instead of an AI reply when the profile already has everything. */
const allSetReply = (firstName: string) =>
  `Thanks, ${firstName}! I have everything I need, so your skill checks are next.`;

/**
 * POST /ai/onboarding/messages — one turn: the student's message goes to the
 * AI with the profile so far; facts it extracts are validated and merged; the
 * reply is saved. Nothing is saved if the AI call fails, so the student can
 * simply send again. If the profile is already complete (say, filled in on
 * the profile page) onboarding completes without an AI call.
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
  const picksPatch: ProfileData = picks.length ? { skills: picks } : {};
  const profile = mergeProfile(asProfile(user.profile?.profileData), picksPatch);
  const studentMessage: ChatMessage = {
    role: "user",
    content,
    created_at: new Date().toISOString(),
  };

  let replyText: string;
  let extracted: ProfileData = {};
  if (isComplete(profile)) {
    replyText = allSetReply(user.firstName);
  } else {
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
    extracted = sanitizeExtracted(turn.extracted);
    // The model may wrap up while a detail is still missing (say, it missed
    // the role). Then its "you're all set" would leave the student stuck, so
    // ask for the first missing detail instead.
    const followUp = turn.done
      ? followUpReply(user.firstName, mergeProfile(profile, extracted))
      : null;
    replyText = followUp ?? turn.reply;
  }

  const reply: ChatMessage = {
    role: "assistant",
    content: replyText,
    created_at: new Date().toISOString(),
  };
  const updatedMessages = [...messages, studentMessage, reply];

  const { updatedUser, merged } = await prisma.$transaction(async (tx) => {
    // Two sends at once: only the first to finish is saved. The other would
    // overwrite its turn, so it's refused and the student sends it again.
    const { count } = await tx.aIConversation.updateMany({
      where: { id: conversation.id, updatedAt: conversation.updatedAt },
      data: { messages: updatedMessages as Prisma.InputJsonArray },
    });
    if (count === 0) {
      throw new AppError(
        409,
        "ONBOARDING_BUSY",
        "Your last message is still being answered. Try again in a moment.",
      );
    }
    // Merged onto the profile as it is now, so an edit on the profile page
    // during the AI call isn't lost.
    const fresh = await tx.userProfile.findUnique({ where: { userId } });
    const latest = mergeProfile(
      mergeProfile(asProfile(fresh?.profileData ?? user.profile?.profileData), picksPatch),
      extracted,
    );
    const completedAt = fresh?.onboardingCompletedAt ?? (isComplete(latest) ? new Date() : null);
    const profileData = latest as Prisma.InputJsonObject;
    const saved = await tx.user.update({
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
    return { updatedUser: saved, merged: latest };
  });

  return {
    onboarding: toState(
      conversation.id,
      updatedMessages,
      merged,
      Boolean(updatedUser.profile?.onboardingCompletedAt),
    ),
    user: toAuthUser(updatedUser),
  };
}
