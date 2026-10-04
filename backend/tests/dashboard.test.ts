import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildNextSteps,
  categoryScores,
  groundInsight,
  latestPerSkill,
  readinessHistory,
  readinessScore,
  type FinishedCheck,
} from "../src/modules/dashboard/dashboard.logic.js";

const USER_ID = "4b7a3c1e-2f0d-4a6b-9c8e-1d2f3a4b5c6d";

const uuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const SKILLS = {
  dsa: { id: uuid(1), slug: "dsa", name: "Data structures & algorithms", category: "TECHNICAL" },
  sql: { id: uuid(2), slug: "sql", name: "SQL", category: "TECHNICAL" },
  java: { id: uuid(3), slug: "java", name: "Java", category: "TECHNICAL" },
  quant: {
    id: uuid(4),
    slug: "quantitative-aptitude",
    name: "Quantitative aptitude",
    category: "APTITUDE",
  },
};

// In-memory stand-ins for what the dashboard reads.
const db = vi.hoisted(() => {
  const state = {
    profile: null as null | Record<string, unknown>,
    assessments: [] as Record<string, unknown>[],
    conversation: null as null | { id: string; messages: unknown },
    tasks: [] as { id: string; title: string; skillId: string }[],
    submissions: [] as { taskId: string; passed: boolean }[],
    role: "STUDENT",
  };
  return {
    state,
    prisma: {
      user: {
        findUnique: vi.fn(async () => ({
          id: "4b7a3c1e-2f0d-4a6b-9c8e-1d2f3a4b5c6d",
          firstName: "Asha",
          role: state.role,
          isActive: true,
          isDeleted: false,
          createdAt: new Date("2026-10-01T00:00:00.000Z"),
          profile: state.profile,
        })),
      },
      assessment: { findMany: vi.fn(async () => state.assessments) },
      skill: { findMany: vi.fn(async () => []) },
      aIConversation: {
        findFirst: vi.fn(async () => state.conversation),
        create: vi.fn(async ({ data }) => (state.conversation = { id: "conv", ...data })),
        update: vi.fn(async ({ data }) => (state.conversation = { id: "conv", ...data })),
      },
      aiUsage: { count: vi.fn(async () => 0), create: vi.fn(async () => ({})) },
      practicalTask: {
        findMany: vi.fn(async ({ where }: { where: { skillId: { in: string[] } } }) =>
          state.tasks.filter((t) => where.skillId.in.includes(t.skillId)),
        ),
      },
      userTaskSubmission: { findMany: vi.fn(async () => state.submissions) },
    },
  };
});

vi.mock("../src/db/prisma.js", () => ({ prisma: db.prisma }));

const { createApp } = await import("../src/app.js");
const { signAccessToken } = await import("../src/modules/auth/tokens.js");
const { fakeAi } = await import("../src/services/ai-agent/providers/fake.provider.js");
const { resetModelCooldowns } = await import("../src/services/ai-agent/ai.service.js");

const app = createApp();
const auth = (role: "STUDENT" | "ADMIN" = "STUDENT") => ({
  Authorization: `Bearer ${signAccessToken(USER_ID, role)}`,
});

let seq = 100;
/** A finished check on `skill` scoring `score` of 14 points, `minutesAgo`. */
function finished(
  skill: (typeof SKILLS)[keyof typeof SKILLS],
  score: number,
  minutesAgo: number,
  threshold = 40,
) {
  const at = new Date(Date.now() - minutesAgo * 60_000);
  return {
    id: uuid(++seq),
    status: "COMPLETED",
    startedAt: at,
    completedAt: at,
    skill: { ...skill, isActive: true },
    result: {
      score,
      maxScore: 14,
      threshold,
      masteryStatus: (score / 14) * 100 >= threshold ? "MASTERED" : "NEEDS_REVISION",
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  fakeAi.reset();
  resetModelCooldowns();
  db.state.profile = {
    onboardingCompletedAt: new Date(),
    profileData: {
      degree: "B.Tech",
      student_year: 3,
      target_role: "Backend developer",
      skills: ["SQL", "DSA", "Java"],
    },
  };
  db.state.assessments = [];
  db.state.conversation = null;
  db.state.tasks = [];
  db.state.submissions = [];
  db.state.role = "STUDENT";
  db.prisma.skill.findMany.mockResolvedValue(
    Object.values(SKILLS).map((s) => ({ ...s, isActive: true })) as never,
  );
});

describe("readiness rules", () => {
  const check = (
    skillId: string,
    category: FinishedCheck["skill"]["category"],
    percent: number,
    minutesAgo: number,
  ): FinishedCheck => ({
    assessmentId: `${skillId}-${minutesAgo}`,
    skill: { id: skillId, slug: skillId, name: skillId, category },
    percent,
    threshold: 40,
    mastered: percent >= 40,
    completedAt: new Date(Date.now() - minutesAgo * 60_000),
  });

  it("keeps the latest attempt per skill, with attempts and the change since last time", () => {
    const results = latestPerSkill([
      check("sql", "technical", 50, 10),
      check("sql", "technical", 21, 50),
      check("sql", "technical", 14, 90),
      check("dsa", "technical", 29, 40),
    ]);
    expect(results).toEqual([
      expect.objectContaining({ slug: "sql", percent: 50, attempts: 3, change: 29 }),
      expect.objectContaining({ slug: "dsa", percent: 29, attempts: 1, change: null }),
    ]);
  });

  it("weights technical 50, aptitude 30, soft 20 — over the categories checked so far", () => {
    const results = latestPerSkill([
      check("python", "technical", 79, 1),
      check("dsa", "technical", 29, 2),
      check("quant", "aptitude", 64, 3),
      check("communication", "soft", 86, 4),
    ]);
    const categories = categoryScores(results);
    expect(categories).toEqual([
      { category: "technical", score: 54, checked: 2 },
      { category: "aptitude", score: 64, checked: 1 },
      { category: "soft", score: 86, checked: 1 },
    ]);
    // (54×50 + 64×30 + 86×20) / 100 = 63.4
    expect(readinessScore(categories)).toBe(63);
    // Only technical checked: readiness is just the technical score.
    expect(readinessScore(categoryScores(results.slice(0, 2)))).toBe(54);
    expect(readinessScore(categoryScores([]))).toBeNull();
  });

  it("replays readiness after each check, oldest first", () => {
    const history = readinessHistory([
      check("sql", "technical", 50, 10), // retake replaces the 21
      check("quant", "aptitude", 64, 30),
      check("sql", "technical", 21, 50),
    ]);
    expect(history.map((p) => p.score)).toEqual([
      21, // technical 21 only
      37, // (21×50 + 64×30) / 80 = 37.1
      55, // SQL retaken at 50: (50×50 + 64×30) / 80 = 55.3
    ]);
    expect(history.at(-1)).toMatchObject({ skill: "sql", percent: 50 });
  });

  it("orders next steps: onboarding, unfinished check, weakest skill, unchecked claims", () => {
    const results = latestPerSkill([check("dsa", "technical", 29, 1)]);
    const steps = buildNextSteps({
      onboardingCompleted: false,
      inProgress: [{ assessmentId: "a1", name: "SQL" }],
      claimedUnchecked: [{ name: "Java" }],
      results,
      limit: 10,
    });
    expect(steps.map((s) => s.kind)).toEqual([
      "onboarding",
      "resume",
      "revise",
      "check",
      "aptitude",
    ]);
    expect(steps[1]!.href).toBe("/assessment/a1");
    expect(steps[2]!.href).toBe("/learn/dsa");
  });

  it("suggests a practical task last, once the rest is done", () => {
    const steps = buildNextSteps({
      onboardingCompleted: true,
      inProgress: [],
      claimedUnchecked: [],
      results: latestPerSkill([check("quant", "aptitude", 80, 1)]),
      suggestedTasks: [
        { taskId: "t1", title: "Three word problems", skillName: "Quant" },
        { taskId: "t2", title: "Another", skillName: "Quant" },
      ],
    });
    expect(steps).toEqual([
      expect.objectContaining({ kind: "task", href: "/tasks/t1", title: "Try a Quant task" }),
    ]);
  });

  it("drops AI gaps about skills the student wasn't checked on or already mastered", () => {
    const results = latestPerSkill([
      check("dsa", "technical", 29, 1),
      check("sql", "technical", 79, 2),
    ]);
    const grounded = groundInsight(
      {
        summary: " Good start. ",
        gaps: [
          { skill: "dsa", why: "w", how: "h" },
          { skill: "kubernetes", why: "invented", how: "h" },
          { skill: "sql", why: "mastered already", how: "h" },
          { skill: "dsa", why: "duplicate", how: "h" },
        ],
        plan: [{ title: "Revise DSA", detail: "d" }],
      },
      results,
    );
    expect(grounded.summary).toBe("Good start.");
    expect(grounded.gaps).toEqual([{ skillId: "dsa", name: "dsa", why: "w", how: "h" }]);
  });

  it("drops plan steps that name a skill the student wasn't checked on and didn't claim", () => {
    const results = latestPerSkill([check("sql", "technical", 29, 1)]);
    const grounded = groundInsight(
      {
        summary: "s",
        gaps: [],
        plan: [
          { title: "Revise SQL joins", detail: "Redo the questions you missed." },
          { title: "Learn Kotlin", detail: "Not in the catalogue, so not checkable here." },
          { title: "Start Java", detail: "Java is everywhere." }, // claimed: kept
          { title: "Pick up React", detail: "Build a small app." }, // never mentioned: dropped
          { title: "Try JavaScript", detail: "Not Java." }, // "Java" isn't in "JavaScript"
          { title: "Practise daily", detail: "Little and often." },
        ],
      },
      results,
      ["java"],
    );
    expect(grounded.plan.map((p) => p.title)).toEqual([
      "Revise SQL joins",
      "Learn Kotlin",
      "Start Java",
      "Practise daily",
    ]);
  });
});

describe("GET /api/v1/dashboard", () => {
  it("is empty but useful before any check", async () => {
    const res = await request(app).get("/api/v1/dashboard").set(auth());

    expect(res.status).toBe(200);
    expect(res.body.data.readiness.score).toBeNull();
    expect(res.body.data.counts).toMatchObject({ checked: 0, claimed: 3, claimed_checked: 0 });
    expect(res.body.data.next_steps.map((s: { title: string }) => s.title)).toEqual([
      "Check your SQL",
      "Check your Data structures & algorithms",
      "Take an aptitude check",
    ]);
  });

  it("scores the latest result per skill, weakest first", async () => {
    db.state.assessments = [
      finished(SKILLS.sql, 7, 10), // 50%, retake
      finished(SKILLS.quant, 9, 30), // 64%
      finished(SKILLS.dsa, 4, 40), // 29%
      finished(SKILLS.sql, 3, 50), // 21%, first attempt
    ];
    const res = await request(app).get("/api/v1/dashboard").set(auth());
    const data = res.body.data;

    expect(data.skills.map((s: { slug: string; percent: number }) => [s.slug, s.percent])).toEqual([
      ["dsa", 29],
      ["sql", 50],
      ["quantitative-aptitude", 64],
    ]);
    expect(data.skills[1]).toMatchObject({ attempts: 2, change: 29, mastery: "mastered" });
    expect(data.readiness.categories[0]).toEqual({ category: "technical", score: 40, checked: 2 });
    // (40×50 + 64×30) / 80 = 49
    expect(data.readiness.score).toBe(49);
    // The history ends at today's score; `change` is its last step.
    expect(data.readiness.history.map((p: { score: number }) => p.score).at(-1)).toBe(49);
    expect(data.readiness.change).toBe(49 - data.readiness.history.at(-2).score);
    expect(data.counts).toMatchObject({
      checked: 3,
      mastered: 2,
      needs_revision: 1,
      claimed: 3,
      claimed_checked: 2,
    });
    expect(data.gaps.map((g: { slug: string }) => g.slug)).toEqual(["dsa"]);
    expect(data.next_steps[0]).toMatchObject({
      kind: "revise",
      title: "Revise Data structures & algorithms",
      href: "/learn/dsa",
    });
  });

  it("counts practical tasks and suggests an unpassed one on a mastered skill", async () => {
    db.state.assessments = [finished(SKILLS.quant, 9, 30), finished(SKILLS.sql, 9, 20)];
    db.state.tasks = [
      { id: uuid(901), title: "Word problems", skillId: SKILLS.quant.id },
      { id: uuid(902), title: "Top earners", skillId: SKILLS.sql.id },
    ];
    db.state.submissions = [
      { taskId: uuid(901), passed: false },
      { taskId: uuid(901), passed: true },
      { taskId: uuid(902), passed: false },
    ];
    // Claims checked, aptitude done: the task suggestion has room to show.
    db.state.profile!.profileData = { skills: ["SQL"] };

    const data = (await request(app).get("/api/v1/dashboard").set(auth())).body.data;
    expect(data.counts).toMatchObject({ tasks_attempted: 2, tasks_passed: 1 });
    expect(data.next_steps).toEqual([
      expect.objectContaining({ kind: "task", href: `/tasks/${uuid(902)}` }),
    ]);
  });

  it("shows each result's own pass mark, as scored", async () => {
    db.state.assessments = [finished(SKILLS.sql, 7, 10, 60)]; // 50% against a 60% pass mark
    const data = (await request(app).get("/api/v1/dashboard").set(auth())).body.data;
    expect(data.skills[0]).toMatchObject({ slug: "sql", percent: 50, threshold: 60 });
    expect(data.skills[0].mastery).toBe("needs_revision");
    expect(data.gaps[0].threshold).toBe(60);
  });

  it("lists every check date of the last year for the calendar, not just the last 20", async () => {
    db.state.assessments = [
      ...Array.from({ length: 30 }, (_, i) => finished(SKILLS.sql, 7, i * 24 * 60 + 5)),
      finished(SKILLS.dsa, 7, 400 * 24 * 60), // over a year ago
    ];
    const data = (await request(app).get("/api/v1/dashboard").set(auth())).body.data;
    expect(data.readiness.history).toHaveLength(20);
    expect(data.check_dates).toHaveLength(30);
    expect(data.check_dates[0]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect([...data.check_dates].sort()).toEqual(data.check_dates);
  });

  it("is for students only", async () => {
    db.state.role = "ADMIN";
    expect((await request(app).get("/api/v1/dashboard").set(auth("ADMIN"))).status).toBe(403);
    expect((await request(app).get("/api/v1/dashboard")).status).toBe(401);
  });
});

describe("GET /api/v1/ai/insight", () => {
  const insight = {
    summary: "You're close for a backend role; DSA is the gap.",
    gaps: [{ skill: "dsa", why: "Interviews lean on it.", how: "Practise arrays and trees." }],
    plan: [{ title: "Revise DSA", detail: "Go through your missed answers." }],
  };

  it("makes no AI call before the first check", async () => {
    const res = await request(app).get("/api/v1/ai/insight").set(auth());
    expect(res.body.data).toMatchObject({ status: "empty", summary: null });
    expect(fakeAi.calls).toHaveLength(0);
  });

  it("generates once from the student's real results, then serves the cache", async () => {
    db.state.assessments = [finished(SKILLS.dsa, 4, 40), finished(SKILLS.sql, 9, 30)];
    fakeAi.reply(insight);

    const first = await request(app).get("/api/v1/ai/insight").set(auth());
    expect(first.status).toBe(200);
    expect(first.body.data).toMatchObject({
      status: "ready",
      summary: insight.summary,
      gaps: [{ skill_id: SKILLS.dsa.id, name: "Data structures & algorithms" }],
    });
    // Grounded: the prompt carries the real scores and the target role.
    expect(fakeAi.calls[0]!.system).toContain('"score_percent":29');
    expect(fakeAi.calls[0]!.system).toContain('"pass_mark_percent":40');
    expect(fakeAi.calls[0]!.system).not.toContain("Pass mark is 40%");
    expect(fakeAi.calls[0]!.system).toContain("Backend developer");

    const again = await request(app).get("/api/v1/ai/insight").set(auth());
    expect(again.body.data.summary).toBe(insight.summary);
    expect(fakeAi.calls).toHaveLength(1);
  });

  it("regenerates when a result changes", async () => {
    db.state.assessments = [finished(SKILLS.dsa, 4, 40)];
    fakeAi.reply(insight);
    await request(app).get("/api/v1/ai/insight").set(auth());

    db.state.assessments = [finished(SKILLS.dsa, 10, 1), ...db.state.assessments];
    fakeAi.reply({ ...insight, summary: "DSA is now mastered.", gaps: [] });
    const res = await request(app).get("/api/v1/ai/insight").set(auth());

    expect(res.body.data.summary).toBe("DSA is now mastered.");
    expect(fakeAi.calls).toHaveLength(2);
  });

  it("keeps showing the previous take, marked stale, when a refresh fails", async () => {
    db.state.assessments = [finished(SKILLS.dsa, 4, 40)];
    fakeAi.reply(insight);
    await request(app).get("/api/v1/ai/insight").set(auth());

    db.state.assessments = [finished(SKILLS.dsa, 10, 1), ...db.state.assessments];
    fakeAi.fail();
    fakeAi.fail();
    fakeAi.fail();
    const res = await request(app).get("/api/v1/ai/insight").set(auth());
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ status: "ready", summary: insight.summary, stale: true });
  });

  it("reports an AI failure without caching anything", async () => {
    db.state.assessments = [finished(SKILLS.dsa, 4, 40)];
    fakeAi.fail();
    fakeAi.fail();
    fakeAi.fail();
    const res = await request(app).get("/api/v1/ai/insight").set(auth());
    expect(res.status).toBe(503);
    expect(db.prisma.aIConversation.create).not.toHaveBeenCalled();
  });
});
