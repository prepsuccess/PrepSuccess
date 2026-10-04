import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  LEVEL_TARGET,
  drawPool,
  fingerprint,
  levelsToTopUp,
  maxScoreFor,
  maxScoreForPool,
  nextDifficulty,
  pickQuestion,
  scoreOf,
  seenBankIds,
  toBankRows,
  verdict,
  type BankQuestion,
  type StoredQuestion,
} from "../src/modules/assessment/assessment.logic.js";
import { SKILL_CATALOGUE } from "../src/modules/skills/catalogue.js";
import { matchClaims, normalizeSkillName } from "../src/modules/skills/skills.logic.js";
import { STACKS } from "../src/modules/skills/stacks.js";

const USER_ID = "4b7a3c1e-2f0d-4a6b-9c8e-1d2f3a4b5c6d";
const SKILL_ID = "5c8b4d2f-3a1e-4b7c-8d9f-2e3a4b5c6d7e";
const ASSESSMENT_ID = "6d9c5e3a-4b2f-4c8d-9eaf-3f4b5c6d7e8f";

// In-memory stand-ins for the rows a skill check touches.
const db = vi.hoisted(() => {
  const now = new Date("2026-10-03T10:00:00.000Z");
  const skill = {
    id: "5c8b4d2f-3a1e-4b7c-8d9f-2e3a4b5c6d7e",
    slug: "dsa",
    name: "Data structures & algorithms",
    category: "TECHNICAL",
    topic: "CS fundamentals",
    subtopic: null,
    description: "Arrays, trees and graphs.",
    masteryThreshold: 40,
    isActive: true,
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
  };
  const state = {
    assessment: null as null | Record<string, unknown>,
    result: null as null | Record<string, unknown>,
    profileData: {} as Record<string, unknown>,
    tick: 0,
    bank: [] as Record<string, unknown>[],
    role: "STUDENT",
  };
  const full = () =>
    state.assessment ? { ...state.assessment, skill, result: state.result } : null;
  return {
    skill,
    state,
    reset() {
      state.assessment = null;
      state.result = null;
      state.profileData = { degree: "B.Tech", student_year: 3, skills: ["DSA basics", "Kotlin"] };
      state.tick = 0;
      state.bank = [];
      state.role = "STUDENT";
    },
    prisma: {
      user: {
        findUnique: vi.fn(async () => ({
          createdAt: now,
          role: state.role,
          isActive: true,
          isDeleted: false,
        })),
      },
      userProfile: {
        findUnique: vi.fn(async () => ({ profileData: state.profileData })),
      },
      skill: {
        findFirst: vi.fn(async ({ where }) => (where.id === skill.id ? skill : null)),
        findMany: vi.fn(async () => [skill]),
      },
      assessment: {
        findFirst: vi.fn(async ({ where }) => {
          const a = state.assessment;
          if (!a || a.userId !== where.userId) return null;
          if (where.id && where.id !== a.id) return null;
          if (where.status && where.status !== a.status) return null;
          return full();
        }),
        findMany: vi.fn(async () => (full() ? [full()] : [])),
        create: vi.fn(async ({ data }) => {
          state.assessment = {
            id: "6d9c5e3a-4b2f-4c8d-9eaf-3f4b5c6d7e8f",
            userId: data.userId,
            skillId: data.skillId,
            mode: "DIAGNOSTIC",
            status: "IN_PROGRESS",
            questionCount: data.questionCount,
            questions: data.questions,
            startedAt: now,
            completedAt: null,
            createdAt: now,
            updatedAt: new Date(now.getTime() + state.tick++),
          };
          return full();
        }),
        updateMany: vi.fn(async ({ where, data }) => {
          const a = state.assessment!;
          const fresh =
            a.status === where.status &&
            (a.updatedAt as Date).getTime() === (where.updatedAt as Date).getTime();
          if (!fresh) return { count: 0 };
          Object.assign(a, data, { updatedAt: new Date(now.getTime() + ++state.tick) });
          return { count: 1 };
        }),
        findUniqueOrThrow: vi.fn(async () => full()),
      },
      checkQuestion: {
        findMany: vi.fn(async ({ where }) =>
          state.bank.filter(
            (q) => q.skillId === where.skillId && (where.isDeleted === undefined || !q.isDeleted),
          ),
        ),
        createMany: vi.fn(async ({ data }) => {
          for (const row of data) {
            state.bank.push({
              id: `00000000-0000-4000-9000-${String(state.bank.length + 1).padStart(12, "0")}`,
              timesAsked: 0,
              timesCorrect: 0,
              isActive: true,
              isDeleted: false,
              createdAt: new Date(now.getTime() + state.bank.length),
              ...row,
            });
          }
          return { count: data.length };
        }),
        updateMany: vi.fn(async () => ({ count: 1 })),
      },
      assessmentResult: {
        create: vi.fn(async ({ data }) => (state.result = { ...data, createdAt: now })),
      },
      aiUsage: { count: vi.fn(async () => 0), create: vi.fn(async () => ({})) },
      $transaction: vi.fn(async (fn: (tx: unknown) => unknown) => fn(db.prisma)),
      $executeRaw: vi.fn(async () => 1),
    },
  };
});

vi.mock("../src/db/prisma.js", () => ({ prisma: db.prisma }));

const { createApp } = await import("../src/app.js");
const { signAccessToken } = await import("../src/modules/auth/tokens.js");
const { fakeAi } = await import("../src/services/ai-agent/providers/fake.provider.js");

const app = createApp();
const auth = (role: "STUDENT" | "ADMIN" = "STUDENT") => ({
  Authorization: `Bearer ${signAccessToken(USER_ID, role)}`,
});

const question = (level: string, n: number) => ({
  question: `${level} question number ${n}?`,
  options: [`right ${level} ${n}`, `wrong a ${n}`, `wrong b ${n}`, `wrong c ${n}`],
  answer_index: 0,
  explanation: `Because ${level} ${n}.`,
});
let batchNo = 0;
/** What the model returns for one top-up: 8 new questions per level. */
const batch = () => {
  const from = ++batchNo * 100;
  const eight = (level: string) => Array.from({ length: 8 }, (_, i) => question(level, from + i));
  return { easy: eight("easy"), medium: eight("medium"), hard: eight("hard") };
};
/** A full bank (34/33/33) for the skill, so a check needs no AI call. */
function fillBank(counts: Record<string, number> = LEVEL_TARGET) {
  for (const [level, n] of Object.entries(counts)) {
    for (let i = 0; i < n; i++) {
      const q = question(level.toLowerCase(), i);
      db.state.bank.push({
        id: `10000000-0000-4000-9000-${String(db.state.bank.length + 1).padStart(12, "0")}`,
        skillId: SKILL_ID,
        difficulty: level,
        question: q.question,
        options: q.options,
        answerIndex: 0,
        explanation: q.explanation,
        fingerprint: fingerprint(q.question),
        timesAsked: 0,
        isActive: true,
        isDeleted: false,
      });
    }
  }
}

const start = (questionCount?: number) =>
  request(app)
    .post("/api/v1/ai/assessment/start")
    .set(auth())
    .send({ skill_id: SKILL_ID, ...(questionCount ? { question_count: questionCount } : {}) });

/** The stored right answer for a question — the client never sees it before answering. */
function rightAnswer(questionId: string) {
  const stored = db.state.assessment!.questions as StoredQuestion[];
  return stored.find((q) => q.id === questionId)!.answer_index;
}

const answer = (questionId: string, choice: number) =>
  request(app)
    .post(`/api/v1/ai/assessment/${ASSESSMENT_ID}/answer`)
    .set(auth())
    .send({ question_id: questionId, choice_index: choice });

beforeEach(() => {
  vi.clearAllMocks();
  db.reset();
  fakeAi.reset();
});

describe("adaptive rules", () => {
  it("steps up after a right answer and down after a wrong one, within bounds", () => {
    expect(nextDifficulty("MEDIUM", true)).toBe("HARD");
    expect(nextDifficulty("HARD", true)).toBe("HARD");
    expect(nextDifficulty("MEDIUM", false)).toBe("EASY");
    expect(nextDifficulty("EASY", false)).toBe("EASY");
  });

  it("scores harder questions higher, as a percentage of a perfect run of any length", () => {
    expect(maxScoreFor(5)).toBe(14); // medium + 4 hard: checks from before the bank
    expect(maxScoreFor(10)).toBe(29);
    expect(maxScoreFor(30)).toBe(89);
    const asked = (difficulty: StoredQuestion["difficulty"], correct: boolean, order: number) =>
      ({ difficulty, correct, asked_order: order }) as StoredQuestion;
    // medium ✓, hard ✗, medium ✓, hard ✗, medium ✗ = 4 points
    const run = [
      asked("MEDIUM", true, 1),
      asked("HARD", false, 2),
      asked("MEDIUM", true, 3),
      asked("HARD", false, 4),
      asked("MEDIUM", false, 5),
    ];
    expect(scoreOf(run)).toBe(4);
    expect(verdict(4, 14, 40)).toEqual({ percent: 29, mastery: "NEEDS_REVISION" });
    expect(verdict(6, 14, 40)).toEqual({ percent: 43, mastery: "MASTERED" });
    expect(verdict(29, 29, 40)).toEqual({ percent: 100, mastery: "MASTERED" });
  });

  const bankQ = (
    id: string,
    difficulty: BankQuestion["difficulty"],
    timesAsked = 0,
  ): BankQuestion => ({
    id,
    difficulty,
    question: `Question ${id}?`,
    options: [`right ${id}`, "b", "c", "d"],
    answerIndex: 0,
    explanation: "x",
    timesAsked,
  });

  it("draws unseen questions first, then the least-asked repeats, with shuffled options", () => {
    const bank = [
      bankQ("e1", "EASY"),
      bankQ("e2", "EASY", 5),
      bankQ("e3", "EASY", 1),
      bankQ("m1", "MEDIUM"),
      bankQ("h1", "HARD"),
    ];
    const pool = drawPool(bank, new Set(["e2", "e3"]), 2);
    const easy = pool.filter((q) => q.difficulty === "EASY").map((q) => q.bank_id);
    expect(easy).toEqual(["e1", "e3"]); // unseen e1, then e3 (asked once) before e2 (5 times)
    for (const q of pool) expect(q.options[q.answer_index]).toMatch(/^right/);
    expect(new Set(pool.map((q) => q.id)).size).toBe(pool.length);
  });

  it("knows what this student has already been asked", () => {
    const seen = seenBankIds([
      {
        questions: [
          { bank_id: "a", asked_order: 1 },
          { bank_id: "b", asked_order: null },
          { asked_order: 2 },
        ],
      },
    ]);
    expect([...seen]).toEqual(["a"]);
  });

  it("tops up only levels short of fresh questions with room left", () => {
    const bank = [
      ...Array.from({ length: 6 }, (_, i) => bankQ(`e${i}`, "EASY")),
      ...Array.from({ length: 2 }, (_, i) => bankQ(`m${i}`, "MEDIUM")),
      ...Array.from({ length: 33 }, (_, i) => bankQ(`h${i}`, "HARD")),
    ];
    // 10 questions need 5 fresh per level: easy has 6, medium 2, hard is full and fresh.
    expect(levelsToTopUp(bank, new Set(), 10)).toEqual(["MEDIUM"]);
    // Every hard one seen, but the hard share is full: nothing more to write there.
    const seenHard = new Set(bank.filter((q) => q.difficulty === "HARD").map((q) => q.id));
    expect(levelsToTopUp(bank, seenHard, 10)).toEqual(["MEDIUM"]);
  });

  it("cleans a batch for the bank: no duplicates, no ambiguous options, capped per level", () => {
    const b = batch();
    b.easy[0]!.options = ["same", "Same", "x", "y"];
    b.medium[1] = { ...b.medium[0]!, question: `  ${b.medium[0]!.question.toUpperCase()}  ` };
    const existing = Array.from({ length: LEVEL_TARGET.HARD - 3 }, (_, i) => ({
      difficulty: "HARD" as const,
      fingerprint: `h${i}`,
    }));
    const rows = toBankRows(b, existing, [fingerprint(b.easy[1]!.question)]);
    const count = (d: string) => rows.filter((r) => r.difficulty === d).length;
    expect(count("EASY")).toBe(6); // 8 − ambiguous − retired
    expect(count("MEDIUM")).toBe(7); // 8 − same question reworded in case/spacing
    expect(count("HARD")).toBe(3); // only 3 places left in the hard share
  });

  it("counts deactivated questions as taking up their level's share", () => {
    const bank = Array.from({ length: 4 }, (_, i) => bankQ(`e${i}`, "EASY"));
    // Only 4 live easy questions, but 30 more are hidden by an admin: the
    // easy share is full, so asking the AI for more would add nothing.
    expect(levelsToTopUp(bank, new Set(), 10, { EASY: 34, MEDIUM: 33, HARD: 33 })).toEqual([]);
    expect(levelsToTopUp(bank, new Set(), 10, { EASY: 4, MEDIUM: 33, HARD: 33 })).toEqual(["EASY"]);
  });

  it("scores a perfect run as 100% even when the pool is short of hard questions", () => {
    const pool = (easy: number, medium: number, hard: number) =>
      drawPool(
        [
          ...Array.from({ length: easy }, (_, i) => bankQ(`e${i}`, "EASY")),
          ...Array.from({ length: medium }, (_, i) => bankQ(`m${i}`, "MEDIUM")),
          ...Array.from({ length: hard }, (_, i) => bankQ(`h${i}`, "HARD")),
        ],
        new Set(),
        10,
      );
    expect(maxScoreForPool(pool(10, 10, 10), 10)).toBe(maxScoreFor(10));
    // medium, hard, hard, then the nearest level left: medium every time.
    expect(maxScoreForPool(pool(10, 10, 2), 10)).toBe(2 + 3 + 3 + 7 * 2);
    // No medium either: medium (1 left), hard ×2, then easy.
    expect(maxScoreForPool(pool(10, 1, 2), 10)).toBe(2 + 3 + 3 + 7 * 1);
  });

  it("falls back to the nearest level when one runs out", () => {
    const questions = drawPool([bankQ("m1", "MEDIUM"), bankQ("e1", "EASY")], new Set(), 5);
    expect(pickQuestion(questions, "HARD")!.difficulty).toBe("MEDIUM");
  });
});

describe("matching onboarding claims to the catalogue", () => {
  it("matches common names and aliases, and reports the rest", () => {
    expect(normalizeSkillName("DSA basics")).toBe("dsa");
    expect(
      matchClaims(["DSA basics", "React.js", "OOPs concepts", "C programming", "c++", "Kotlin"]),
    ).toEqual({ slugs: ["dsa", "react", "oop", "c", "cpp"], unmatched: ["Kotlin"] });
  });
});

describe("GET /api/v1/skills/mine", () => {
  it("marks the skills the student claimed in onboarding", async () => {
    const res = await request(app).get("/api/v1/skills/mine").set(auth());
    expect(res.status).toBe(200);
    expect(res.body.data.skills[0]).toMatchObject({
      slug: "dsa",
      category: "technical",
      claimed: true,
      in_progress_id: null,
      last_result: null,
      attempts: 0,
    });
    expect(res.body.data.unmatched_claims).toEqual(["Kotlin"]);
  });
});

describe("POST /api/v1/ai/assessment/start", () => {
  it("fills an empty bank once, then asks a medium question without revealing the answer", async () => {
    fakeAi.reply(batch());
    const res = await start();

    expect(res.status).toBe(200);
    const state = res.body.data;
    expect(state).toMatchObject({ status: "in_progress", total_questions: 10, answered: 0 });
    expect(state.current_question).toMatchObject({ number: 1, difficulty: "medium" });
    expect(state.current_question.options).toHaveLength(4);
    expect(JSON.stringify(state)).not.toContain("answer_index");
    expect(JSON.stringify(state)).not.toContain("correct_index");
    // One AI call wrote 24 questions into the shared bank.
    expect(fakeAi.calls).toHaveLength(1);
    expect(db.state.bank).toHaveLength(24);
    expect(fakeAi.calls[0]!.system).toContain("Data structures & algorithms");
    // Shared across students, so not tailored to this one's profile.
    expect(fakeAi.calls[0]!.system).not.toContain("B.Tech");
  });

  it("makes no AI call when the bank already has fresh questions", async () => {
    fillBank();
    const res = await start(20);
    expect(res.status).toBe(200);
    expect(res.body.data.total_questions).toBe(20);
    expect(fakeAi.calls).toHaveLength(0);
    // The pool is up to 20 per level, all from the bank.
    const stored = db.state.assessment!.questions as StoredQuestion[];
    expect(stored.every((q) => q.bank_id)).toBe(true);
    expect(stored.filter((q) => q.difficulty === "EASY")).toHaveLength(20);
  });

  it("lets the student choose 10 to 30 questions", async () => {
    fillBank();
    expect((await start(9)).status).toBe(422);
    expect((await start(31)).status).toBe(422);
    const ok = await start(30);
    expect(ok.status).toBe(200);
    expect(ok.body.data.total_questions).toBe(30);
  });

  it("resumes an unfinished check instead of starting another", async () => {
    fakeAi.reply(batch());
    const first = await start();
    const again = await start(25);
    expect(again.body.data.id).toBe(first.body.data.id);
    expect(again.body.data.total_questions).toBe(10);
    expect(fakeAi.calls).toHaveLength(1);
  });

  it("saves nothing when the AI fails and the bank is empty", async () => {
    fakeAi.fail();
    fakeAi.fail();
    fakeAi.fail();
    const res = await start();
    expect(res.status).toBe(503);
    expect(db.prisma.assessment.create).not.toHaveBeenCalled();
  });

  it("starts from the bank when topping it up fails but the bank can fill the check", async () => {
    fillBank({ EASY: 4, MEDIUM: 4, HARD: 4 }); // short of fresh questions: wants a top-up
    fakeAi.fail();
    fakeAi.fail();
    fakeAi.fail();
    const res = await start();
    expect(res.status).toBe(200);
    expect(fakeAi.calls.length).toBeGreaterThan(0);
    expect(db.prisma.assessment.create).toHaveBeenCalledTimes(1);
  });

  it("starts from the bank when the student is at today's AI limit", async () => {
    fillBank({ EASY: 4, MEDIUM: 4, HARD: 4 });
    db.prisma.aiUsage.count.mockResolvedValueOnce(10_000);
    const res = await start();
    expect(res.status).toBe(200);
    expect(fakeAi.calls).toHaveLength(0);
  });

  it("still returns the AI's error when the bank can't fill the check without it", async () => {
    fillBank({ EASY: 2, MEDIUM: 2, HARD: 2 });
    db.prisma.aiUsage.count.mockResolvedValueOnce(10_000);
    const res = await start();
    expect(res.status).toBe(429);
    expect(res.body.error.code).toBe("AI_DAILY_LIMIT");
    expect(db.prisma.assessment.create).not.toHaveBeenCalled();
  });

  it("doesn't ask the AI to refill a level an admin has hidden questions in", async () => {
    fillBank();
    for (const q of db.state.bank.filter((row) => row.difficulty === "EASY").slice(4)) {
      q.isActive = false;
    }
    const res = await start();
    expect(res.status).toBe(200);
    expect(fakeAi.calls).toHaveLength(0);
    const stored = db.state.assessment!.questions as StoredQuestion[];
    expect(stored.filter((q) => q.difficulty === "EASY")).toHaveLength(4);
  });

  it("resumes the other tab's check when two starts race", async () => {
    fillBank();
    const first = await start();
    vi.clearAllMocks();
    // The second request passed the first unfinished-check lookup before the
    // first one saved; inside the lock it finds that check and resumes it.
    db.prisma.assessment.findFirst.mockResolvedValueOnce(null);
    const second = await start(20);
    expect(second.status).toBe(200);
    expect(second.body.data.id).toBe(first.body.data.id);
    expect(second.body.data.total_questions).toBe(10);
    expect(db.prisma.$executeRaw).toHaveBeenCalledTimes(1);
    expect(db.prisma.assessment.create).not.toHaveBeenCalled();
  });

  it("explains when there aren't enough questions to start", async () => {
    fakeAi.reply({ easy: [], medium: [], hard: [] });
    const res = await start();
    expect(res.status).toBe(503);
    expect(res.body.error.code).toBe("NOT_ENOUGH_QUESTIONS");
    expect(db.prisma.assessment.create).not.toHaveBeenCalled();
  });

  it("404s for an unknown skill and 403s for non-students", async () => {
    const unknown = await request(app)
      .post("/api/v1/ai/assessment/start")
      .set(auth())
      .send({ skill_id: ASSESSMENT_ID });
    expect(unknown.status).toBe(404);
    expect(unknown.body.error.code).toBe("SKILL_NOT_FOUND");

    db.state.role = "ADMIN";
    const admin = await request(app)
      .post("/api/v1/ai/assessment/start")
      .set(auth("ADMIN"))
      .send({ skill_id: SKILL_ID });
    expect(admin.status).toBe(403);
  });
});

describe("POST /api/v1/ai/assessment/:id/answer", () => {
  it("adapts to each answer, then scores the check out of its own length", async () => {
    fillBank();
    let state = (await start(10)).body.data;

    const plan = [true, true, false, true, false, false, true, true, true, true];
    const levels: string[] = [];
    for (const right of plan) {
      const q = state.current_question;
      levels.push(q.difficulty);
      const correct = rightAnswer(q.id);
      const res = await answer(q.id, right ? correct : (correct + 1) % 4);
      expect(res.status).toBe(200);
      state = res.body.data;
    }

    expect(levels).toEqual([
      "medium",
      "hard",
      "hard",
      "medium",
      "hard",
      "medium",
      "easy",
      "medium",
      "hard",
      "hard",
    ]);
    expect(state.status).toBe("completed");
    expect(state.current_question).toBeNull();
    expect(state.answers).toHaveLength(10);
    // 2+3+0+2+0+0+1+2+3+3 = 16 of 29
    expect(state.result).toEqual({
      score: 16,
      max_score: 29,
      percent: 55,
      threshold: 40,
      mastery: "mastered",
    });
    expect(db.prisma.assessmentResult.create).toHaveBeenCalledTimes(1);
    // Every answer updated its bank question's stats; marking needed no AI.
    expect(db.prisma.checkQuestion.updateMany).toHaveBeenCalledTimes(10);
    expect(fakeAi.calls).toHaveLength(0);
  });

  it("flags needs_revision below the pass mark", async () => {
    fillBank();
    let state = (await start()).body.data;
    for (let i = 0; i < 10; i++) {
      const q = state.current_question;
      state = (await answer(q.id, (rightAnswer(q.id) + 1) % 4)).body.data;
    }
    expect(state.answers.slice(0, 3).map((a: { difficulty: string }) => a.difficulty)).toEqual([
      "medium",
      "easy",
      "easy",
    ]);
    expect(state.result).toMatchObject({ score: 0, percent: 0, mastery: "needs_revision" });
  });

  it("scores a perfect run out of what the pool allowed when hard questions ran short", async () => {
    fillBank({ EASY: 10, MEDIUM: 10, HARD: 2 });
    fakeAi.fail("AI_HTTP_400", false); // the hard top-up fails; the bank still fills 10
    let state = (await start()).body.data;
    expect(state.status).toBe("in_progress");
    for (let i = 0; i < 10; i++) {
      const q = state.current_question;
      state = (await answer(q.id, rightAnswer(q.id))).body.data;
    }
    // medium, hard, hard, then medium ×7: 22 is the best this pool could give.
    expect(state.result).toMatchObject({
      score: 22,
      max_score: 22,
      percent: 100,
      mastery: "mastered",
    });
  });

  it("refuses a stale question id (double submit)", async () => {
    fillBank();
    const q = (await start()).body.data.current_question;
    await answer(q.id, 0);
    const again = await answer(q.id, 1);
    expect(again.status).toBe(409);
    expect(again.body.error.code).toBe("QUESTION_ALREADY_ANSWERED");
  });

  it("refuses answers once the check is complete", async () => {
    fillBank();
    let state = (await start()).body.data;
    for (let i = 0; i < 10; i++) state = (await answer(state.current_question.id, 0)).body.data;
    const res = await answer(state.answers[9].id, 0);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("ASSESSMENT_COMPLETE");
  });

  it("validates the choice", async () => {
    fillBank();
    const q = (await start()).body.data.current_question;
    expect((await answer(q.id, 7)).status).toBe(422);
  });

  it("hides someone else's check", async () => {
    fillBank();
    await start();
    db.state.assessment!.userId = "00000000-0000-4000-8000-000000000000";
    const res = await request(app).get(`/api/v1/ai/assessment/${ASSESSMENT_ID}`).set(auth());
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("ASSESSMENT_NOT_FOUND");
  });
});

describe("stacks", () => {
  it("expands a stack into its catalogue skills, however it's written", () => {
    const mern = ["mongodb", "expressjs", "react", "nodejs", "javascript"];
    expect(matchClaims(["MERN stack"]).slugs).toEqual(mern);
    expect(matchClaims(["mern"]).slugs).toEqual(mern);
    expect(matchClaims(["MERN developer"]).slugs).toEqual(mern);
    expect(matchClaims(["Full Stack", "frontend"]).slugs).toEqual([
      "html",
      "css",
      "javascript",
      "react",
      "nodejs",
      "expressjs",
      "sql",
    ]);
  });

  it("lets an exact stack name win over a single-skill alias, and keeps single skills single", () => {
    expect(matchClaims(["Data analytics"]).slugs).toEqual([
      "excel",
      "sql",
      "python",
      "data-analysis-python",
    ]);
    expect(matchClaims(["data analysis"]).slugs).toEqual(["data-analysis-python"]);
    expect(matchClaims(["React"]).slugs).toEqual(["react"]);
    expect(matchClaims(["MERN stack", "Kotlin"]).unmatched).toEqual(["Kotlin"]);
  });

  it("doesn't expand a stack from a plain word inside an unrelated claim", () => {
    expect(matchClaims(["Statistics (mean, median)"])).toEqual({
      slugs: [],
      unmatched: ["Statistics (mean, median)"],
    });
    expect(matchClaims(["Some backend work at my internship"]).slugs).toEqual([]);
    expect(matchClaims(["Learning full stack slowly"]).slugs).toEqual([]);
    // A whole claim that is a stack, however it's dressed up, still expands…
    expect(matchClaims(["MEAN"]).slugs).toContain("typescript");
    expect(matchClaims(["Backend developer"]).slugs).toEqual([
      "nodejs",
      "expressjs",
      "rest-apis",
      "sql",
    ]);
    expect(matchClaims(["Full stack developer"]).slugs).toHaveLength(7);
    // …and a distinctive name counts anywhere in the claim.
    expect(matchClaims(["Built two MERN apps"]).slugs).toEqual([
      "mongodb",
      "expressjs",
      "react",
      "nodejs",
      "javascript",
    ]);
    expect(matchClaims(["Projects in the MEAN stack"]).slugs).toContain("typescript");
  });

  it("only points at real catalogue skills", () => {
    const slugs = new Set(SKILL_CATALOGUE.map((s) => s.slug));
    for (const stack of STACKS) {
      for (const slug of stack.skills) expect(slugs.has(slug), `${stack.name}: ${slug}`).toBe(true);
    }
  });
});
