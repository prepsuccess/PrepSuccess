import { prisma } from "../../db/prisma.js";
import type { Assessment, AssessmentResult, Prisma, Skill } from "../../generated/prisma/client.js";
import { AppError } from "../../lib/http.js";
import { generateJson } from "../../services/ai-agent/ai.service.js";
import { toSkill } from "../skills/skills.schemas.js";
import {
  MAX_SCORE,
  QUESTIONS_PER_CHECK,
  START_DIFFICULTY,
  askedQuestions,
  buildQuestionPrompt,
  currentQuestion,
  nextDifficulty,
  percentOf,
  pickQuestion,
  poolIsUsable,
  questionPoolSchema,
  scoreOf,
  toStoredQuestions,
  verdict,
  type StoredQuestion,
} from "./assessment.logic.js";
import type { AssessmentState } from "./assessment.schemas.js";

type FullAssessment = Assessment & { skill: Skill; result: AssessmentResult | null };

const withSkillAndResult = { skill: true, result: true } as const;

function questionsOf(assessment: Assessment) {
  return (Array.isArray(assessment.questions)
    ? assessment.questions
    : []) as unknown as StoredQuestion[];
}

const lower = <T extends string>(value: T) => value.toLowerCase() as Lowercase<T>;

/** The API view of an attempt. answer_index is only revealed for answered questions. */
function toState(assessment: FullAssessment): AssessmentState {
  const questions = questionsOf(assessment);
  const asked = askedQuestions(questions);
  const current = currentQuestion(questions);
  const answered = asked.filter((q) => q.chosen_index !== null);
  const { result } = assessment;

  return {
    id: assessment.id,
    skill: toSkill(assessment.skill),
    status: assessment.status === "COMPLETED" ? "completed" : "in_progress",
    total_questions: QUESTIONS_PER_CHECK,
    answered: answered.length,
    current_question:
      current && assessment.status === "IN_PROGRESS"
        ? {
            id: current.id,
            number: current.asked_order!,
            difficulty: lower(current.difficulty),
            question: current.question,
            options: current.options,
          }
        : null,
    answers: answered.map((q) => ({
      id: q.id,
      number: q.asked_order!,
      difficulty: lower(q.difficulty),
      question: q.question,
      options: q.options,
      chosen_index: q.chosen_index!,
      correct_index: q.answer_index,
      correct: q.correct!,
      explanation: q.explanation,
    })),
    result: result
      ? {
          score: result.score,
          max_score: result.maxScore,
          percent: percentOf(result.score, result.maxScore),
          threshold: result.threshold,
          mastery: result.masteryStatus === "MASTERED" ? "mastered" : "needs_revision",
        }
      : null,
    started_at: assessment.startedAt.toISOString(),
    completed_at: assessment.completedAt?.toISOString() ?? null,
  };
}

async function loadOwn(userId: string, assessmentId: string) {
  const assessment = await prisma.assessment.findFirst({
    where: { id: assessmentId, userId },
    include: withSkillAndResult,
  });
  // Someone else's attempt looks exactly like a missing one.
  if (!assessment)
    throw new AppError(404, "ASSESSMENT_NOT_FOUND", "That skill check doesn't exist.");
  return assessment;
}

/**
 * POST /ai/assessment/start — resumes an unfinished check on the skill, or
 * generates a fresh question pool (one AI call) and asks the first question.
 * Nothing is saved if the AI call fails.
 */
export async function startAssessment(userId: string, skillId: string) {
  const skill = await prisma.skill.findFirst({
    where: { id: skillId, isActive: true, isDeleted: false },
  });
  if (!skill) throw new AppError(404, "SKILL_NOT_FOUND", "That skill isn't available.");

  const unfinished = await prisma.assessment.findFirst({
    where: { userId, skillId, status: "IN_PROGRESS" },
    include: withSkillAndResult,
    orderBy: { startedAt: "desc" },
  });
  if (unfinished) return toState(unfinished);

  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    select: { profileData: true },
  });
  const { data: pool } = await generateJson(
    {
      userId,
      feature: "assessment",
      system: buildQuestionPrompt(skill, (profile?.profileData ?? {}) as Record<string, unknown>),
      messages: [{ role: "user", content: `Write the ${skill.name} questions now.` }],
      temperature: 0.8,
      maxOutputTokens: 8000,
      // Aptitude answers must be computed, not pattern-matched.
      thinking: skill.category === "APTITUDE",
      // A dozen questions (with reasoning, for aptitude) can take ~30s.
      timeoutMs: 60_000,
    },
    questionPoolSchema,
  );

  const questions = toStoredQuestions(pool);
  if (!poolIsUsable(questions)) {
    throw new AppError(502, "AI_BAD_RESPONSE", "The AI gave an unusable answer. Please try again.");
  }
  const first = pickQuestion(questions, START_DIFFICULTY)!;
  first.asked_order = 1;

  const created = await prisma.assessment.create({
    data: {
      userId,
      skillId,
      questions: questions as unknown as Prisma.InputJsonArray,
    },
    include: withSkillAndResult,
  });
  return toState(created);
}

/** GET /ai/assessment/:id — the attempt so far, to resume or review. */
export async function getAssessment(userId: string, assessmentId: string) {
  return toState(await loadOwn(userId, assessmentId));
}

/**
 * POST /ai/assessment/:id/answer — marks the current question (server-side,
 * against the stored answer), then either asks the next one — harder after a
 * right answer, easier after a wrong one — or scores the check.
 */
export async function answerQuestion(
  userId: string,
  assessmentId: string,
  input: { question_id: string; choice_index: number },
) {
  const assessment = await loadOwn(userId, assessmentId);
  if (assessment.status !== "IN_PROGRESS") {
    throw new AppError(409, "ASSESSMENT_COMPLETE", "This skill check is already finished.");
  }

  const questions = questionsOf(assessment);
  const current = currentQuestion(questions);
  if (!current || current.id !== input.question_id) {
    throw new AppError(
      409,
      "QUESTION_ALREADY_ANSWERED",
      "That question was already answered. Reload to see the next one.",
    );
  }

  current.chosen_index = input.choice_index;
  current.correct = input.choice_index === current.answer_index;
  current.answered_at = new Date().toISOString();

  const answeredCount = askedQuestions(questions).length;
  const finished = answeredCount >= QUESTIONS_PER_CHECK;
  if (!finished) {
    const next = pickQuestion(questions, nextDifficulty(current.difficulty, current.correct));
    if (next) next.asked_order = answeredCount + 1;
  }
  // A pool that ran dry ends the check early rather than getting stuck.
  const complete = finished || currentQuestion(questions) === null;

  const saved = await prisma.$transaction(async (tx) => {
    // Only applies if nobody answered in between (double click, two tabs).
    const { count } = await tx.assessment.updateMany({
      where: { id: assessment.id, status: "IN_PROGRESS", updatedAt: assessment.updatedAt },
      data: {
        questions: questions as unknown as Prisma.InputJsonArray,
        ...(complete ? { status: "COMPLETED" as const, completedAt: new Date() } : {}),
      },
    });
    if (count === 0) {
      throw new AppError(
        409,
        "QUESTION_ALREADY_ANSWERED",
        "That question was already answered. Reload to see the next one.",
      );
    }
    if (complete) {
      const score = scoreOf(questions);
      await tx.assessmentResult.create({
        data: {
          assessmentId: assessment.id,
          score,
          maxScore: MAX_SCORE,
          threshold: assessment.skill.masteryThreshold,
          masteryStatus: verdict(score, assessment.skill.masteryThreshold).mastery,
        },
      });
    }
    return tx.assessment.findUniqueOrThrow({
      where: { id: assessment.id },
      include: withSkillAndResult,
    });
  });

  return toState(saved);
}
