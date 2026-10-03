import { z } from "zod";

import { SKILL_CATALOGUE } from "../skills/catalogue.js";
import { STACKS } from "../skills/stacks.js";
import { profileFields } from "../users/users.schemas.js";

/**
 * Pure onboarding rules — no database, no AI — so they're easy to test.
 * The AI asks and extracts; these functions decide what counts, what's still
 * missing, and when onboarding is complete (never the model).
 */

export type ProfileData = Record<string, unknown>;

/** Collected before onboarding counts as complete, asked in this order. */
export const REQUIRED_FIELDS = [
  "degree",
  "student_year",
  "skills",
  "target_role",
  "goals",
] as const;
/** Captured if the student mentions them, never pushed for. */
export const OPTIONAL_FIELDS = [
  "college",
  "branch",
  "graduation_year",
  "location",
  "interests",
  "experience",
] as const;

export const FIELD_LABELS: Record<(typeof REQUIRED_FIELDS)[number], string> = {
  degree: "What you're studying",
  student_year: "Year of study",
  skills: "Skills you know",
  target_role: "Role you're aiming for",
  goals: "Your goals",
};

/** Fields that accumulate across answers instead of being replaced. */
const LIST_FIELDS = new Set(["skills", "interests", "goals"]);

/** Hard cap on student turns, so one chat can't burn the shared AI quota. */
export const MAX_STUDENT_TURNS = 30;
/** Recent messages sent to the model; older ones are summarised by the known profile. */
export const HISTORY_WINDOW = 12;

function hasValue(value: unknown) {
  if (Array.isArray(value)) return value.length > 0;
  return value !== undefined && value !== null && value !== "";
}

export function missingFields(profile: ProfileData) {
  return REQUIRED_FIELDS.filter((field) => !hasValue(profile[field]));
}

export function isComplete(profile: ProfileData) {
  return missingFields(profile).length === 0;
}

/**
 * What the model returns each turn. Every field optional: it only fills in
 * what the student actually said in their latest message.
 */
export const aiTurnSchema = z.object({
  reply: z.string().min(1).max(800),
  extracted: z
    .object({
      college: z.string().optional(),
      degree: z.string().optional(),
      branch: z.string().optional(),
      student_year: z.number().int().optional(),
      graduation_year: z.number().int().optional(),
      target_role: z.string().optional(),
      location: z.string().optional(),
      skills: z.array(z.string()).optional(),
      interests: z.array(z.string()).optional(),
      goals: z.array(z.string()).optional(),
      experience: z.string().optional(),
    })
    .default({}),
  done: z.boolean(),
});
export type AiTurn = z.infer<typeof aiTurnSchema>;

const allowed = new Set<string>([...REQUIRED_FIELDS, ...OPTIONAL_FIELDS]);

/**
 * Keeps only extracted values that pass the same rules as a manual profile
 * edit (users.schemas). An invalid field is dropped on its own; it never
 * blocks the rest of the turn.
 */
export function sanitizeExtracted(extracted: Record<string, unknown>): ProfileData {
  const clean: ProfileData = {};
  for (const [key, value] of Object.entries(extracted)) {
    if (!allowed.has(key) || !hasValue(value)) continue;
    const rule = profileFields[key as keyof typeof profileFields];
    const parsed = rule.safeParse(value);
    if (parsed.success) clean[key] = parsed.data;
  }
  return clean;
}

/** Merges new facts in: lists are unioned (case-insensitive), everything else replaced. */
export function mergeProfile(current: ProfileData, extracted: ProfileData): ProfileData {
  const merged: ProfileData = { ...current };
  for (const [key, value] of Object.entries(extracted)) {
    if (LIST_FIELDS.has(key) && Array.isArray(value)) {
      const existing = Array.isArray(merged[key]) ? (merged[key] as string[]) : [];
      const seen = new Set(existing.map((item) => item.toLowerCase()));
      merged[key] = [...existing, ...value.filter((item: string) => !seen.has(item.toLowerCase()))];
    } else {
      merged[key] = value;
    }
  }
  return merged;
}

/** The chips the chat offers for skills: common stacks, then every skill by topic. */
export function skillOptions() {
  const nameOf = new Map(SKILL_CATALOGUE.map((s) => [s.slug, s.name]));
  const topics = new Map<string, string[]>();
  for (const skill of SKILL_CATALOGUE) {
    topics.set(skill.topic, [...(topics.get(skill.topic) ?? []), skill.name]);
  }
  return {
    stacks: STACKS.map((stack) => ({
      name: stack.name,
      skills: stack.skills.map((slug) => nameOf.get(slug) ?? slug),
    })),
    topics: [...topics].map(([topic, skills]) => ({ topic, skills })),
  };
}

const PICKABLE = new Map(
  [...STACKS.map((s) => s.name), ...SKILL_CATALOGUE.map((s) => s.name)].map((name) => [
    name.toLowerCase(),
    name,
  ]),
);

/** Keeps only picks that are real options, in their canonical spelling, without duplicates. */
export function cleanPicks(picks: string[]) {
  const names = picks.flatMap((pick) => PICKABLE.get(pick.trim().toLowerCase()) ?? []);
  return [...new Set(names)];
}

/** Fixed opening line — no AI call, so opening the chat costs nothing. */
export function greeting(firstName: string) {
  return `Hi ${firstName}! I'm your PrepSuccess coach. I'll ask a few quick questions so I can check the right skills for you. To start: what are you studying, and which year are you in?`;
}

export function buildSystemPrompt(firstName: string, profile: ProfileData) {
  const missing = missingFields(profile);
  const known = Object.fromEntries(Object.entries(profile).filter(([, value]) => hasValue(value)));
  return [
    `You are the PrepSuccess onboarding coach: friendly, brief and encouraging. You are chatting with ${firstName}, an Indian college student preparing for campus placements.`,
    "Your job is to learn enough about them that PrepSuccess can check their skills.",
    "",
    "How to talk:",
    "- Ask ONE short question at a time (at most two sentences). Plain, simple English. No markdown, no lists.",
    "- If they ask something off-topic, answer in one sentence, then steer back.",
    "- Never ask for their phone number, age, address or any password.",
    "",
    `Still needed, ask in this order: ${missing.length ? missing.join(", ") : "nothing — you have everything"}.`,
    `Already known (never ask again): ${JSON.stringify(known)}.`,
    `Optional, only if it comes up naturally: ${OPTIONAL_FIELDS.join(", ")}.`,
    "",
    "Extraction rules for `extracted`:",
    "- Take facts ONLY from the student's latest message. Never guess, assume or invent.",
    '- degree: e.g. "BCA", "B.Tech". student_year: a number 1-6. target_role: e.g. "Frontend developer", "SDE".',
    '- skills: concrete technologies or subjects, each a short name ("HTML", "SQL", "Data structures"). Only skills they say they know. Keep a stack name as one item ("MERN stack") rather than splitting it.',
    "- The student may pick skills from a list instead of typing; those are already saved, so just acknowledge them and move on.",
    "- goals and interests: short phrases. Leave out anything they didn't clearly say.",
    "",
    "Set done=true only when nothing is still needed. Then thank them, sum up what you learned in one sentence, and tell them their skill checks are next.",
  ].join("\n");
}
