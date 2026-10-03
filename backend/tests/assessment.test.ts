import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  MAX_SCORE,
  nextDifficulty,
  pickQuestion,
  scoreOf,
  toStoredQuestions,
  verdict,
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
    },
    prisma: {
      user: {
        findUnique: vi.fn(async () => ({ createdAt: now })),
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
      assessmentResult: {
        create: vi.fn(async ({ data }) => (state.result = { ...data, createdAt: now })),
      },
      aiUsage: { count: vi.fn(async () => 0), create: vi.fn(async () => ({})) },
      $transaction: vi.fn(async (fn: (tx: unknown) => unknown) => fn(db.prisma)),
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
const pool = () => ({
  easy: [1, 2, 3, 4].map((n) => question("easy", n)),
  medium: [1, 2, 3, 4].map((n) => question("medium", n)),
  hard: [1, 2, 3, 4].map((n) => question("hard", n)),
});

const start = () =>
  request(app).post("/api/v1/ai/assessment/start").set(auth()).send({ skill_id: SKILL_ID });

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

  it("scores harder questions higher, as a percentage of a perfect run", () => {
    expect(MAX_SCORE).toBe(14); // medium + 4 hard
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
    expect(verdict(4, 40)).toEqual({ percent: 29, mastery: "NEEDS_REVISION" });
    expect(verdict(6, 40)).toEqual({ percent: 43, mastery: "MASTERED" });
    expect(verdict(14, 40)).toEqual({ percent: 100, mastery: "MASTERED" });
  });

  it("falls back to the nearest level when one runs out", () => {
    const questions = toStoredQuestions({ ...pool(), hard: [] } as never);
    expect(pickQuestion(questions, "HARD")!.difficulty).toBe("MEDIUM");
  });

  it("shuffles options but keeps the right answer, and drops ambiguous questions", () => {
    const p = pool();
    p.easy[0]!.options = ["same", "Same", "x", "y"];
    const stored = toStoredQuestions(p);
    expect(stored).toHaveLength(11);
    for (const q of stored) expect(q.options[q.answer_index]).toMatch(/^right/);
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
  it("generates a pool and asks a medium question, without revealing the answer", async () => {
    fakeAi.reply(pool());
    const res = await start();

    expect(res.status).toBe(200);
    const state = res.body.data;
    expect(state).toMatchObject({ status: "in_progress", total_questions: 5, answered: 0 });
    expect(state.current_question).toMatchObject({ number: 1, difficulty: "medium" });
    expect(state.current_question.options).toHaveLength(4);
    expect(JSON.stringify(state)).not.toContain("answer_index");
    expect(JSON.stringify(state)).not.toContain("correct_index");
    // The prompt is grounded in the skill and the student's profile.
    expect(fakeAi.calls[0]!.system).toContain("Data structures & algorithms");
    expect(fakeAi.calls[0]!.system).toContain("B.Tech, year 3");
  });

  it("resumes an unfinished check instead of paying for a new one", async () => {
    fakeAi.reply(pool());
    const first = await start();
    const again = await start();
    expect(again.body.data.id).toBe(first.body.data.id);
    expect(fakeAi.calls).toHaveLength(1);
  });

  it("saves nothing when the AI fails", async () => {
    fakeAi.fail();
    fakeAi.fail();
    fakeAi.fail();
    const res = await start();
    expect(res.status).toBe(503);
    expect(db.prisma.assessment.create).not.toHaveBeenCalled();
  });

  it("rejects a pool the model got wrong", async () => {
    fakeAi.reply({ easy: [], medium: [], hard: [] });
    fakeAi.reply({ easy: [], medium: [], hard: [] });
    fakeAi.reply({ easy: [], medium: [], hard: [] });
    const res = await start();
    expect(res.status).toBe(502);
    expect(res.body.error.code).toBe("AI_BAD_RESPONSE");
  });

  it("404s for an unknown skill and 403s for non-students", async () => {
    const unknown = await request(app)
      .post("/api/v1/ai/assessment/start")
      .set(auth())
      .send({ skill_id: ASSESSMENT_ID });
    expect(unknown.status).toBe(404);
    expect(unknown.body.error.code).toBe("SKILL_NOT_FOUND");

    const admin = await request(app)
      .post("/api/v1/ai/assessment/start")
      .set(auth("ADMIN"))
      .send({ skill_id: SKILL_ID });
    expect(admin.status).toBe(403);
  });
});

describe("POST /api/v1/ai/assessment/:id/answer", () => {
  it("adapts to each answer, then scores the check", async () => {
    fakeAi.reply(pool());
    let state = (await start()).body.data;

    // ✓ medium → hard ✓ → hard ✗ → medium ✓ → hard ✗
    const plan = [true, true, false, true, false];
    const levels: string[] = [];
    for (const right of plan) {
      const q = state.current_question;
      levels.push(q.difficulty);
      const correct = rightAnswer(q.id);
      const res = await answer(q.id, right ? correct : (correct + 1) % 4);
      expect(res.status).toBe(200);
      state = res.body.data;
    }

    expect(levels).toEqual(["medium", "hard", "hard", "medium", "hard"]);
    expect(state.status).toBe("completed");
    expect(state.current_question).toBeNull();
    expect(state.answers).toHaveLength(5);
    expect(state.answers[2]).toMatchObject({ correct: false, explanation: expect.any(String) });
    // 2 + 3 + 0 + 2 + 0 = 7 of 14
    expect(state.result).toEqual({
      score: 7,
      max_score: 14,
      percent: 50,
      threshold: 40,
      mastery: "mastered",
    });
    expect(db.prisma.assessmentResult.create).toHaveBeenCalledTimes(1);
    // No AI call after the pool: marking is done by the server.
    expect(fakeAi.calls).toHaveLength(1);
  });

  it("flags needs_revision below the pass mark", async () => {
    fakeAi.reply(pool());
    let state = (await start()).body.data;
    for (let i = 0; i < 5; i++) {
      const q = state.current_question;
      state = (await answer(q.id, (rightAnswer(q.id) + 1) % 4)).body.data;
    }
    expect(state.answers.map((a: { difficulty: string }) => a.difficulty)).toEqual([
      "medium",
      "easy",
      "easy",
      "easy",
      "easy",
    ]);
    expect(state.result).toMatchObject({ score: 0, percent: 0, mastery: "needs_revision" });
  });

  it("refuses a stale question id (double submit)", async () => {
    fakeAi.reply(pool());
    const q = (await start()).body.data.current_question;
    await answer(q.id, 0);
    const again = await answer(q.id, 1);
    expect(again.status).toBe(409);
    expect(again.body.error.code).toBe("QUESTION_ALREADY_ANSWERED");
  });

  it("refuses answers once the check is complete", async () => {
    fakeAi.reply(pool());
    let state = (await start()).body.data;
    for (let i = 0; i < 5; i++) state = (await answer(state.current_question.id, 0)).body.data;
    const res = await answer(state.answers[4].id, 0);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("ASSESSMENT_COMPLETE");
  });

  it("validates the choice", async () => {
    fakeAi.reply(pool());
    const q = (await start()).body.data.current_question;
    expect((await answer(q.id, 7)).status).toBe(422);
  });

  it("hides someone else's check", async () => {
    fakeAi.reply(pool());
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

  it("only points at real catalogue skills", () => {
    const slugs = new Set(SKILL_CATALOGUE.map((s) => s.slug));
    for (const stack of STACKS) {
      for (const slug of stack.skills) expect(slugs.has(slug), `${stack.name}: ${slug}`).toBe(true);
    }
  });
});
