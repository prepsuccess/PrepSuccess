import { createHash, randomInt } from "node:crypto";

import { z } from "zod";

/**
 * Pure rules for the adaptive skill check — no database, no AI — so scoring
 * and mastery are deterministic and unit-testable (PRD-01 §5).
 *
 * Questions come from a per-skill bank (check_questions, up to BANK_TARGET),
 * which the AI fills in batches and every student shares. A check draws a
 * pool of questions the student hasn't seen, then asks the number they
 * chose: it starts at MEDIUM, steps up after a right answer and down after a
 * wrong one. The server marks every answer itself; the model never scores.
 */

export type Difficulty = "EASY" | "MEDIUM" | "HARD";

/** Lengths a student can choose; 10 is the minimum. */
export const QUESTION_COUNTS = [10, 15, 20, 25, 30] as const;
export const MIN_QUESTIONS = 10;
export const MAX_QUESTIONS = 30;
export const DEFAULT_QUESTIONS = 10;
export const START_DIFFICULTY: Difficulty = "MEDIUM";

export const LEVELS: Difficulty[] = ["EASY", "MEDIUM", "HARD"];

/** Points for a right answer; harder questions are worth more. */
export const POINTS: Record<Difficulty, number> = { EASY: 1, MEDIUM: 2, HARD: 3 };

/**
 * The best possible score for a check of `count` questions: right at MEDIUM,
 * then right at HARD every time. Scores are a percentage of this, so a
 * perfect run is 100 whatever the length.
 */
export const maxScoreFor = (count: number) => POINTS[START_DIFFICULTY] + POINTS.HARD * (count - 1);

// ---------------------------------------------------------------------------
// The bank
// ---------------------------------------------------------------------------

/** Questions kept per skill; the bank stops growing here. */
export const BANK_TARGET = 100;
/** How the target splits across levels (sums to BANK_TARGET). */
export const LEVEL_TARGET: Record<Difficulty, number> = { EASY: 34, MEDIUM: 33, HARD: 33 };
/** Questions the AI writes per level in one call. */
export const BATCH_PER_LEVEL = 8;

/** One bank question, as the draw needs it. */
export interface BankQuestion {
  id: string;
  difficulty: Difficulty;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  timesAsked: number;
}

/** Same question, however it's spaced or punctuated, gets the same fingerprint. */
export function fingerprint(question: string) {
  const normal = question
    .toLowerCase()
    .replace(/```[\s\S]*?```/g, (code) => code.replace(/\s+/g, " "))
    .replace(/[^a-z0-9+#]+/g, " ")
    .trim();
  return createHash("sha256").update(normal).digest("hex");
}

/**
 * Whether a check of `count` questions needs the AI to add to the bank first:
 * true when some level has fewer unseen questions than a run could ask
 * there (about half the check) and that level's share of the bank isn't full.
 */
export function levelsToTopUp(
  bank: BankQuestion[],
  seen: Set<string>,
  count: number,
): Difficulty[] {
  const need = Math.ceil(count / 2);
  return LEVELS.filter((level) => {
    const atLevel = bank.filter((q) => q.difficulty === level);
    const unseen = atLevel.filter((q) => !seen.has(q.id)).length;
    return unseen < need && atLevel.length < LEVEL_TARGET[level];
  });
}

/** One question as stored in assessments.questions. answer_index stays on the server. */
export interface StoredQuestion {
  id: string;
  /** The check_questions row it came from (absent on checks from before the bank). */
  bank_id?: string;
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

/** Bank ids this student has already been asked, across all their checks on the skill. */
export function seenBankIds(attempts: { questions: unknown }[]) {
  const seen = new Set<string>();
  for (const attempt of attempts) {
    const questions = Array.isArray(attempt.questions)
      ? (attempt.questions as StoredQuestion[])
      : [];
    for (const q of questions) if (q.bank_id && q.asked_order !== null) seen.add(q.bank_id);
  }
  return seen;
}

/** Fisher–Yates with a crypto RNG. */
function shuffled<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

/** Moves the right answer to a random position, fresh for every check. */
function shuffleOptions(options: string[], answerIndex: number) {
  const order = shuffled(options.map((_, i) => i));
  return { options: order.map((i) => options[i]!), answer_index: order.indexOf(answerIndex) };
}

/**
 * A check's pool: up to `count` questions per level, unseen ones first in
 * random order, then — only if the bank is exhausted — the least-asked seen
 * ones. Options are shuffled per check.
 */
export function drawPool(bank: BankQuestion[], seen: Set<string>, count: number): StoredQuestion[] {
  const pool: StoredQuestion[] = [];
  for (const level of LEVELS) {
    const atLevel = bank.filter((q) => q.difficulty === level);
    const fresh = shuffled(atLevel.filter((q) => !seen.has(q.id)));
    const repeats = atLevel
      .filter((q) => seen.has(q.id))
      .sort((a, b) => a.timesAsked - b.timesAsked);
    for (const q of [...fresh, ...repeats].slice(0, count)) {
      pool.push({
        id: `q${pool.length + 1}`,
        bank_id: q.id,
        difficulty: q.difficulty,
        question: q.question,
        ...shuffleOptions(q.options, q.answerIndex),
        explanation: q.explanation,
        asked_order: null,
        chosen_index: null,
        correct: null,
        answered_at: null,
      });
    }
  }
  return pool;
}

/** Enough questions for the whole check, and every level represented. */
export function poolIsUsable(questions: StoredQuestion[], count: number) {
  return (
    questions.length >= count &&
    LEVELS.every((level) => questions.some((q) => q.difficulty === level))
  );
}

// ---------------------------------------------------------------------------
// Running a check
// ---------------------------------------------------------------------------

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
 * one, so a level running out never ends the check early.
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

/** Score as a whole percentage of the best possible, and the verdict against the pass mark. */
export function verdict(score: number, maxScore: number, threshold: number) {
  const percent = percentOf(score, maxScore);
  return {
    percent,
    mastery: percent >= threshold ? ("MASTERED" as const) : ("NEEDS_REVISION" as const),
  };
}

// ---------------------------------------------------------------------------
// What the model writes
// ---------------------------------------------------------------------------

const generatedQuestion = z.object({
  question: z.string().min(10).max(600),
  options: z.array(z.string().min(1).max(200)).length(4),
  answer_index: z.number().int().min(0).max(3),
  explanation: z.string().min(1).max(400),
});

const level = z
  .array(generatedQuestion)
  .max(BATCH_PER_LEVEL + 2)
  .default([]);

export const questionBatchSchema = z.object({ easy: level, medium: level, hard: level });
export type QuestionBatch = z.infer<typeof questionBatchSchema>;

export interface NewBankQuestion {
  difficulty: Difficulty;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  fingerprint: string;
}

/**
 * Cleans a batch for the bank: drops questions with duplicate options
 * (ambiguous) or already in the bank (by fingerprint), keeps only levels that
 * still have room, and never lets a level go past its share of BANK_TARGET.
 * `retired` are fingerprints of deleted questions: never re-added, but they
 * don't take up room.
 */
export function toBankRows(
  batch: QuestionBatch,
  existing: { difficulty: Difficulty; fingerprint: string }[],
  retired: string[] = [],
): NewBankQuestion[] {
  const known = new Set([...existing.map((q) => q.fingerprint), ...retired]);
  const room = Object.fromEntries(
    LEVELS.map((lvl) => [
      lvl,
      LEVEL_TARGET[lvl] - existing.filter((q) => q.difficulty === lvl).length,
    ]),
  ) as Record<Difficulty, number>;

  const rows: NewBankQuestion[] = [];
  const entries: [Difficulty, QuestionBatch["easy"]][] = [
    ["EASY", batch.easy],
    ["MEDIUM", batch.medium],
    ["HARD", batch.hard],
  ];
  for (const [difficulty, questions] of entries) {
    for (const q of questions) {
      if (room[difficulty] <= 0) break;
      const options = q.options.map((option) => option.trim());
      if (new Set(options.map((o) => o.toLowerCase())).size !== options.length) continue;
      const print = fingerprint(q.question);
      if (known.has(print)) continue;
      known.add(print);
      room[difficulty] -= 1;
      rows.push({
        difficulty,
        question: q.question.trim(),
        options,
        answerIndex: q.answer_index,
        explanation: q.explanation.trim(),
        fingerprint: print,
      });
    }
  }
  return rows;
}

export interface SkillForPrompt {
  name: string;
  category: "TECHNICAL" | "SOFT" | "APTITUDE";
  description: string | null;
}

/**
 * Asks for a batch for the shared bank — not tailored to one student, since
 * every student checking the skill draws from it. `avoid` lists questions
 * already in the bank so the model covers new ground.
 */
export function buildQuestionPrompt(skill: SkillForPrompt, levels: Difficulty[], avoid: string[]) {
  const style = {
    TECHNICAL:
      "Test real understanding, not trivia: concepts, reading a short code snippet, predicting output, choosing the right approach.",
    APTITUDE:
      "Placement-style aptitude questions with one exact answer. Work every calculation out step by step before writing the options, and double-check the answer.",
    SOFT: "Situational judgement: a short realistic workplace or college scenario, and four plausible responses where exactly one is clearly best.",
  }[skill.category];
  const wanted = levels.map((l) => l.toLowerCase()).join(", ");

  return [
    "You write multiple-choice questions for PrepSuccess, which checks Indian college students' skills before campus placements.",
    `Skill: ${skill.name}.${skill.description ? ` Covers: ${skill.description}` : ""}`,
    "",
    `Write ${BATCH_PER_LEVEL} new questions for each of these levels: ${wanted}. Leave the other levels empty.`,
    "- easy: core definitions and basics a beginner should know.",
    "- medium: applying the basics; what a placement interview would ask.",
    "- hard: deeper understanding, edge cases or combining ideas — still fair, never a trick.",
    "Spread them across different parts of the skill.",
    style,
    avoid.length
      ? `Already in the bank — do NOT repeat or lightly reword any of these:\n${avoid.map((q) => `- ${q}`).join("\n")}`
      : "",
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

/** The first line of each bank question, for the prompt's "don't repeat" list. */
export function avoidList(questions: { question: string }[], limit = 60) {
  return questions
    .slice(-limit)
    .map((q) => q.question.split("\n")[0]!.slice(0, 120).trim())
    .filter(Boolean);
}
