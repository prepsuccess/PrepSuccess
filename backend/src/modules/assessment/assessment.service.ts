import { prisma } from "../../db/prisma.js";
import type { Assessment, AssessmentResult, Prisma, Skill } from "../../generated/prisma/client.js";
import { AppError } from "../../lib/http.js";
import { toSkill } from "../skills/skills.schemas.js";
import {
  START_DIFFICULTY,
  askedQuestions,
  currentQuestion,
  drawPool,
  levelsToTopUp,
  maxScoreFor,
  nextDifficulty,
  percentOf,
  pickQuestion,
  poolIsUsable,
  scoreOf,
  seenBankIds,
  verdict,
  type StoredQuestion,
} from "./assessment.logic.js";
import { loadBank, topUpBank } from "./bank.service.js";
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
    total_questions: assessment.questionCount,
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

/** At most this many AI calls to top up the bank before a check starts. */
const MAX_TOP_UPS = 2;

/**
 * POST /ai/assessment/start — resumes an unfinished check on the skill, or
 * starts one of `questionCount` questions drawn from the skill's shared bank,
 * preferring questions this student hasn't seen. If the bank is short of
 * fresh questions the AI adds a batch first (it only grows to 100), so most
 * checks start with no AI call at all. Nothing is saved if that call fails.
 */
export async function startAssessment(userId: string, skillId: string, questionCount: number) {
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

  const previous = await prisma.assessment.findMany({
    where: { userId, skillId },
    select: { questions: true },
  });
  const seen = seenBankIds(previous);

  let bank = await loadBank(skill.id);
  for (let call = 0; call < MAX_TOP_UPS; call++) {
    const levels = levelsToTopUp(bank, seen, questionCount);
    if (!levels.length) break;
    const added = await topUpBank(skill, levels, userId);
    bank = await loadBank(skill.id);
    if (!added) break;
  }

  const questions = drawPool(bank, seen, questionCount);
  if (!poolIsUsable(questions, questionCount)) {
    throw new AppError(
      503,
      "NOT_ENOUGH_QUESTIONS",
      "We couldn't gather enough questions for this check. Try a shorter one, or try again shortly.",
    );
  }
  const first = pickQuestion(questions, START_DIFFICULTY)!;
  first.asked_order = 1;

  const created = await prisma.assessment.create({
    data: {
      userId,
      skillId,
      questionCount,
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
  const finished = answeredCount >= assessment.questionCount;
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
    // Quality signals on the shared question.
    if (current.bank_id) {
      await tx.checkQuestion.updateMany({
        where: { id: current.bank_id },
        data: {
          timesAsked: { increment: 1 },
          ...(current.correct ? { timesCorrect: { increment: 1 } } : {}),
        },
      });
    }
    if (complete) {
      const score = scoreOf(questions);
      const maxScore = maxScoreFor(assessment.questionCount);
      await tx.assessmentResult.create({
        data: {
          assessmentId: assessment.id,
          score,
          maxScore,
          threshold: assessment.skill.masteryThreshold,
          masteryStatus: verdict(score, maxScore, assessment.skill.masteryThreshold).mastery,
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
