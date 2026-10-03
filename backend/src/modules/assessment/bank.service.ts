import { prisma } from "../../db/prisma.js";
import type { Prisma, Skill } from "../../generated/prisma/client.js";
import { generateJson } from "../../services/ai-agent/ai.service.js";
import {
  avoidList,
  buildQuestionPrompt,
  questionBatchSchema,
  toBankRows,
  type BankQuestion,
  type Difficulty,
} from "./assessment.logic.js";

/**
 * The shared question bank for skill checks (check_questions). Questions are
 * written by the AI in batches, de-duplicated, capped at BANK_TARGET per
 * skill, and reused by every student — so most checks need no AI call.
 */

const live = { isActive: true, isDeleted: false } as const;

/** A skill's live bank, oldest first. */
export async function loadBank(skillId: string): Promise<BankQuestion[]> {
  const rows = await prisma.checkQuestion.findMany({
    where: { skillId, ...live },
    orderBy: { createdAt: "asc" },
  });
  return rows.map((row) => ({
    id: row.id,
    difficulty: row.difficulty,
    question: row.question,
    options: Array.isArray(row.options) ? (row.options as string[]) : [],
    answerIndex: row.answerIndex,
    explanation: row.explanation,
    timesAsked: row.timesAsked,
  }));
}

/**
 * One AI call that adds new questions at `levels` to the skill's bank.
 * `system` is for the bulk fill script: it skips the per-student daily AI
 * limit (usage is still recorded against `userId`). Returns how many were
 * added; duplicates and anything past the per-level cap are dropped.
 */
export async function topUpBank(
  skill: Pick<Skill, "id" | "name" | "category" | "description">,
  levels: Difficulty[],
  userId: string,
  { system = false }: { system?: boolean } = {},
) {
  if (!levels.length) return 0;
  // Deleted questions still count as "known", so the AI isn't asked for them again.
  const existing = await prisma.checkQuestion.findMany({
    where: { skillId: skill.id },
    select: { difficulty: true, fingerprint: true, question: true, isDeleted: true },
    orderBy: { createdAt: "asc" },
  });

  const { data } = await generateJson(
    {
      userId,
      feature: "assessment",
      system: buildQuestionPrompt(skill, levels, avoidList(existing)),
      messages: [{ role: "user", content: `Write the new ${skill.name} questions now.` }],
      temperature: 0.8,
      maxOutputTokens: 12_000,
      // Aptitude answers must be computed, not pattern-matched.
      thinking: skill.category === "APTITUDE",
      timeoutMs: 90_000,
      systemCall: system,
    },
    questionBatchSchema,
  );

  const rows = toBankRows(
    data,
    existing.filter((q) => !q.isDeleted),
    existing.filter((q) => q.isDeleted).map((q) => q.fingerprint),
  ).filter(
    // Only fill the levels asked for, even if the model wrote others too.
    (row) => levels.includes(row.difficulty),
  );
  if (!rows.length) return 0;

  const { count } = await prisma.checkQuestion.createMany({
    data: rows.map((row) => ({
      skillId: skill.id,
      difficulty: row.difficulty,
      question: row.question,
      options: row.options as Prisma.InputJsonArray,
      answerIndex: row.answerIndex,
      explanation: row.explanation,
      fingerprint: row.fingerprint,
    })),
    // Two students topping up the same skill at once can't create duplicates.
    skipDuplicates: true,
  });
  return count;
}
