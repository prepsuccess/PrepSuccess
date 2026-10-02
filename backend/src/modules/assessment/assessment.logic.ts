import { randomInt } from "node:crypto";

import { z } from "zod";

/**
 * Pure rules for the adaptive skill check — no database, no AI — so scoring
 * and mastery are deterministic and unit-testable (PRD-01 §5).
 *
 * One AI call at the start generates a pool of multiple-choice questions at
 * three difficulties. The check then asks QUESTIONS_PER_CHECK of them: it
 * starts at MEDIUM, steps up after a right answer and down after a wrong one.
 * The server marks every answer itself; the model never scores the student.
 */

export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export const QUESTIONS_PER_CHECK = 5;
export const START_DIFFICULTY: Difficulty = "MEDIUM";
/** Enough per level for any path: at most 4 EASY or 4 HARD, or 3 MEDIUM, get asked. */
export const POOL_PER_LEVEL = 4;

const LEVELS: Difficulty[] = ["EASY", "MEDIUM", "HARD"];

/** Points for a right answer; harder questions are worth more. */
export const POINTS: Record<Difficulty, number> = { EASY: 1, MEDIUM: 2, HARD: 3 };

/**
 * The best possible score: right at MEDIUM, then right at HARD every time.
 * Scores are a percentage of this, so a perfect run is 100.
 */
export const MAX_SCORE = POINTS[START_DIFFICULTY] + POINTS.HARD * (QUESTIONS_PER_CHECK - 1);

/** One question as stored in assessments.questions. answer_index stays on the server. */
export interface StoredQuestion {
  id: string;
  difficulty: Difficulty;
  question: string;
  options: string[];
  answer_index: number;
  explanation: string;
  /** 1-based position once asked; null while still in the pool. */
  asked_order: number | null;
  chosen_index: number | null;
  correct: boolean | null;
  answered_at: string | null;
}

export function nextDifficulty(current: Difficulty, wasCorrect: boolean): Difficulty {
  const index = LEVELS.indexOf(current) + (wasCorrect ? 1 : -1);
  return LEVELS[Math.max(0, Math.min(LEVELS.length - 1, index))]!;
}

/** Questions in the order they were asked. */
export function askedQuestions(questions: StoredQuestion[]) {
  return questions
    .filter((q) => q.asked_order !== null)
    .sort((a, b) => a.asked_order! - b.asked_order!);
}

/** The asked question still waiting for an answer, if any. */
export function currentQuestion(questions: StoredQuestion[]) {
  return askedQuestions(questions).find((q) => q.chosen_index === null) ?? null;
}

/**
 * An unasked question at `difficulty`, or the nearest level that still has
 * one (the pool is sized so this never needs to happen, but a short pool
 * must not end the check early).
 */
export function pickQuestion(questions: StoredQuestion[], difficulty: Difficulty) {
  const byDistance = [...LEVELS].sort(
    (a, b) =>
      Math.abs(LEVELS.indexOf(a) - LEVELS.indexOf(difficulty)) -
      Math.abs(LEVELS.indexOf(b) - LEVELS.indexOf(difficulty)),
  );
  for (const level of byDistance) {
    const found = questions.find((q) => q.asked_order === null && q.difficulty === level);
    if (found) return found;
  }
  return null;
}

export function scoreOf(questions: StoredQuestion[]) {
  return askedQuestions(questions).reduce(
    (total, q) => total + (q.correct ? POINTS[q.difficulty] : 0),
    0,
  );
}

export const percentOf = (score: number, maxScore: number) => Math.round((score / maxScore) * 100);

/** Score as a whole percentage of MAX_SCORE, and the verdict against the skill's pass mark. */
export function verdict(score: number, threshold: number) {
  const percent = percentOf(score, MAX_SCORE);
  return {
    percent,
    mastery: percent >= threshold ? ("MASTERED" as const) : ("NEEDS_REVISION" as const),
  };
}

// ---------------------------------------------------------------------------
// The question pool the model generates
// ---------------------------------------------------------------------------

const generatedQuestion = z.object({
  question: z.string().min(10).max(600),
  options: z.array(z.string().min(1).max(200)).length(4),
  answer_index: z.number().int().min(0).max(3),
  explanation: z.string().min(1).max(400),
});

const level = z
  .array(generatedQuestion)
  .min(POOL_PER_LEVEL)
  .max(POOL_PER_LEVEL + 2);

export const questionPoolSchema = z.object({ easy: level, medium: level, hard: level });
export type QuestionPool = z.infer<typeof questionPoolSchema>;

/** Moves the right answer to a random position — models put it first far too often. */
function shuffleOptions(options: string[], answerIndex: number) {
  const order = options.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [order[i], order[j]] = [order[j]!, order[i]!];
  }
  return { options: order.map((i) => options[i]!), answer_index: order.indexOf(answerIndex) };
}

/**
 * Turns the model's pool into stored questions: drops any with duplicate
 * options (ambiguous), shuffles answers, and gives each an id.
 */
export function toStoredQuestions(pool: QuestionPool): StoredQuestion[] {
  const stored: StoredQuestion[] = [];
  const entries: [Difficulty, QuestionPool["easy"]][] = [
    ["EASY", pool.easy],
    ["MEDIUM", pool.medium],
    ["HARD", pool.hard],
  ];
  for (const [difficulty, questions] of entries) {
    for (const q of questions) {
      const options = q.options.map((option) => option.trim());
      if (new Set(options.map((o) => o.toLowerCase())).size !== options.length) continue;
      stored.push({
        id: `q${stored.length + 1}`,
        difficulty,
        question: q.question.trim(),
        ...shuffleOptions(options, q.answer_index),
        explanation: q.explanation.trim(),
        asked_order: null,
        chosen_index: null,
        correct: null,
        answered_at: null,
      });
    }
  }
  return stored;
}

/** After cleaning, every level needs a question and there must be enough for a full check. */
export function poolIsUsable(questions: StoredQuestion[]) {
  return (
    questions.length >= QUESTIONS_PER_CHECK &&
    LEVELS.every((level) => questions.some((q) => q.difficulty === level))
  );
}

export interface SkillForPrompt {
  name: string;
  category: "TECHNICAL" | "SOFT" | "APTITUDE";
  description: string | null;
}

export function buildQuestionPrompt(skill: SkillForPrompt, profile: Record<string, unknown>) {
  const who = [
    typeof profile.degree === "string" ? profile.degree : null,
    typeof profile.student_year === "number" ? `year ${profile.student_year}` : null,
    typeof profile.target_role === "string" ? `aiming for ${profile.target_role}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  const style = {
    TECHNICAL:
      "Test real understanding, not trivia: concepts, reading a short code snippet, predicting output, choosing the right approach.",
    APTITUDE:
      "Placement-style aptitude questions with one exact answer. Work every calculation out step by step before writing the options, and double-check the answer.",
    SOFT: "Situational judgement: a short realistic workplace or college scenario, and four plausible responses where exactly one is clearly best.",
  }[skill.category];

  return [
    "You write multiple-choice questions for PrepSuccess, which checks Indian college students' skills before campus placements.",
    `Skill: ${skill.name}.${skill.description ? ` Covers: ${skill.description}` : ""}`,
    who ? `The student: ${who}.` : "",
    "",
    `Write ${POOL_PER_LEVEL} questions at each level — easy, medium and hard — all different, covering different parts of the skill.`,
    "- easy: core definitions and basics a beginner should know.",
    "- medium: applying the basics; what a placement interview would ask.",
    "- hard: deeper understanding, edge cases or combining ideas — still fair, never a trick.",
    style,
    "",
    "Rules:",
    "- Exactly 4 options, exactly one correct. Wrong options must be plausible but clearly wrong to someone who knows the topic.",
    "- No 'all of the above' or 'none of the above'. Options must be distinct.",
    "- answer_index is the 0-based position of the correct option.",
    "- Put code in the question inside a ``` fenced block, under 10 lines. Wrap short code in an option or explanation in single backticks.",
    "- explanation: one or two sentences on why the right answer is right.",
    "- Simple, clear English.",
  ]
    .filter((line, i, all) => line !== "" || all[i - 1] !== "")
    .join("\n");
}
