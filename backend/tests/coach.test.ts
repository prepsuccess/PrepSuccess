import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DashboardResponse } from "../src/modules/dashboard/dashboard.schemas.js";

const USER_ID = "4b7a3c1e-2f0d-4a6b-9c8e-1d2f3a4b5c6d";

const dashboard: DashboardResponse = {
  onboarding_completed: true,
  readiness: {
    score: 48,
    change: null,
    history: [],
    weights: { technical: 50, aptitude: 30, soft: 20 },
    categories: [
      { category: "technical", score: 48, checked: 1 },
      { category: "aptitude", score: null, checked: 0 },
      { category: "soft", score: null, checked: 0 },
    ],
  },
  counts: {
    checked: 1,
    mastered: 0,
    needs_revision: 1,
    claimed: 2,
    claimed_checked: 1,
    in_progress: 0,
    tasks_attempted: 1,
    tasks_passed: 0,
  },
  skills: [
    {
      skill_id: "5c8b4d2f-3a1e-4b7c-8d9f-2e3a4b5c6d7e",
      slug: "sql",
      name: "SQL",
      category: "technical",
      assessment_id: "6d9c5e3a-4b2f-4c8d-9eaf-3f4b5c6d7e8f",
      percent: 32,
      threshold: 60,
      mastery: "needs_revision",
      completed_at: "2026-10-03T10:00:00.000Z",
      attempts: 1,
      change: null,
    },
  ],
  gaps: [],
  check_dates: ["2026-10-03"],
  next_steps: [
    {
      id: "revise-sql",
      kind: "revise",
      title: "Revise SQL",
      detail: "Study joins, then retake the check.",
      href: "/learn/sql",
    },
  ],
};
dashboard.gaps = dashboard.skills;

// In-memory stand-ins: the user, their coach conversation, activity, usage and notifications.
const db = vi.hoisted(() => {
  const state = {
    conversation: null as null | { id: string; messages: unknown[] },
    activity: null as null | Record<string, Date | null>,
    usage: [] as { feature: string; success: boolean; createdAt: Date }[],
    notifications: [] as Record<string, unknown>[],
  };
  const user = {
    id: "4b7a3c1e-2f0d-4a6b-9c8e-1d2f3a4b5c6d",
    firstName: "Asha",
    role: "STUDENT",
    isActive: true,
    isDeleted: false,
    createdAt: new Date("2026-10-01T00:00:00.000Z"),
    profile: { profileData: { target_role: "Data Analyst", college: "Christ University" } },
  };
  const question = {
    id: "7e0d6f4b-5c3a-4d9e-8f1b-4a5b6c7d8e9f",
    title: "WHERE vs HAVING",
    body: "What is the difference between WHERE and HAVING?",
    answer: "WHERE filters rows before grouping; HAVING filters groups.",
    isActive: true,
    isDeleted: false,
    skill: { name: "SQL" },
  };
  const prisma = {
    // Raw SQL used by the coach: the row-locked conversation read and the advisory lock.
    $queryRaw: vi.fn(async (strings: TemplateStringsArray): Promise<unknown[]> => {
      if (strings.join("?").includes("pg_advisory_xact_lock")) return [{ locked: 1 }];
      return state.conversation ? [state.conversation] : [];
    }),
    $transaction: vi.fn(async (fn: (tx: unknown) => unknown) => fn(prisma)),
    user: { findUnique: vi.fn(async () => user) },
    userTaskSubmission: {
      findMany: vi.fn(async () => [
        { task: { title: "Top earners", skill: { name: "SQL" } }, score: 40, passed: false },
      ]),
    },
    aIConversation: {
      findFirst: vi.fn(async () => state.conversation),
      create: vi.fn(async ({ data }) => (state.conversation = { id: "c1", ...data })),
      update: vi.fn(async ({ data }) => Object.assign(state.conversation!, data)),
    },
    aiUsage: {
      count: vi.fn(
        async ({ where }) =>
          state.usage.filter(
            (u) =>
              u.success &&
              (!where.feature || u.feature === where.feature) &&
              u.createdAt >= where.createdAt.gte,
          ).length,
      ),
      create: vi.fn(async ({ data }) =>
        state.usage.push({ feature: data.feature, success: data.success, createdAt: new Date() }),
      ),
    },
    userActivity: {
      findUnique: vi.fn(async () => state.activity),
      upsert: vi.fn(async ({ create, update }) => {
        state.activity = state.activity ? { ...state.activity, ...update } : { ...create };
      }),
      updateMany: vi.fn(async ({ where, data }) => {
        const last = state.activity?.lastNudgeAt as Date | null | undefined;
        if (where.lastNudgeAt instanceof Date) {
          // Releasing a claim: only if it's still ours.
          if (last?.getTime() !== where.lastNudgeAt.getTime()) return { count: 0 };
          Object.assign(state.activity!, data);
          return { count: 1 };
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (last && last > today) return { count: 0 };
        Object.assign(state.activity!, data);
        return { count: 1 };
      }),
    },
    notification: {
      create: vi.fn(async ({ data }) => state.notifications.push(data)),
    },
    // The interview question the student has open (context for one reply).
    questionBank: {
      findFirst: vi.fn(async ({ where }) =>
        where.id === question.id && !question.isDeleted && where.isDeleted === false
          ? question
          : null,
      ),
    },
  };
  return { state, user, question, prisma };
});

vi.mock("../src/db/prisma.js", () => ({ prisma: db.prisma }));
vi.mock("../src/modules/dashboard/dashboard.service.js", () => ({
  getDashboard: vi.fn(async () => dashboard),
  getInsight: vi.fn(),
}));

const { createApp } = await import("../src/app.js");
const { signAccessToken } = await import("../src/modules/auth/tokens.js");
const { fakeAi } = await import("../src/services/ai-agent/providers/fake.provider.js");
const logic = await import("../src/modules/coach/coach.logic.js");
const coachService = await import("../src/modules/coach/coach.service.js");

const app = createApp();
const auth = { Authorization: `Bearer ${signAccessToken(USER_ID, "STUDENT")}` };
const ask = (content: string) =>
  request(app).post("/api/v1/ai/coach/messages").set(auth).send({ content });

beforeEach(() => {
  vi.clearAllMocks();
  fakeAi.reset();
  db.state.conversation = null;
  db.state.activity = null;
  db.state.usage = [];
  db.state.notifications = [];
});

describe("coach rules", () => {
  const minutes = (n: number) => n * 60_000;
  const t0 = new Date("2026-10-03T06:00:00.000Z");
  const at = (n: number) => new Date(t0.getTime() + minutes(n));

  it("checks in once, 30 minutes into a session", () => {
    // The app pings every few minutes while the tab is visible.
    let state = logic.trackActivity(null, t0);
    for (let m = 5; m < 30; m += 5) {
      state = logic.trackActivity(state.activity, at(m));
      expect(state.nudgeDue).toBe(false);
    }
    state = logic.trackActivity(state.activity, at(30));
    expect(state.nudgeDue).toBe(true);
    // Already sent today: no second check-in.
    const sent = { ...state.activity, lastNudgeAt: at(30) };
    expect(logic.trackActivity(sent, at(35)).nudgeDue).toBe(false);
  });

  it("starts a new session after a 10-minute gap", () => {
    const first = logic.trackActivity(null, t0).activity;
    const later = logic.trackActivity({ ...first, lastSeenAt: at(25) }, at(40));
    expect(later.activity.sessionStartedAt).toEqual(at(40));
    expect(later.nudgeDue).toBe(false);
  });

  it("starts the model's history with a user turn", () => {
    const at = "2026-10-03T06:00:00.000Z";
    const history = logic.historyWindow([
      { role: "assistant" as const, content: "Check-in tip", created_at: at, nudge: true },
      { role: "user" as const, content: "Thanks, what next?", created_at: at },
    ]);
    expect(history).toEqual([{ role: "user", content: "Thanks, what next?" }]);

    // A window cut mid-exchange drops the orphan reply at the front too.
    const long = Array.from({ length: logic.HISTORY_WINDOW + 1 }, (_, i) => ({
      role: i % 2 === 0 ? ("user" as const) : ("assistant" as const),
      content: `m${i}`,
    }));
    const window = logic.historyWindow(long);
    expect(window[0]!.role).toBe("user");
    expect(window.at(-1)!.content).toBe(`m${logic.HISTORY_WINDOW}`);
  });

  it("describes the student from real data only", () => {
    const text = logic.describeStudent({
      firstName: "Asha",
      profile: { target_role: "Data Analyst" },
      dashboard,
      recentTasks: [{ title: "Top earners", skill: "SQL", percent: 40, passed: false }],
    });
    expect(text).toContain("Target role: Data Analyst");
    expect(text).toContain("Readiness: 48%");
    expect(text).toContain("SQL: 32%, below pass mark");
    expect(text).toContain("Top earners (SQL): 40%, not passed");
  });
});

describe("coach chat", () => {
  it("answers with the student's data and the app guide in the prompt", async () => {
    fakeAi.reply("Start with joins on the Learn page.");
    const res = await ask("How do I get better at SQL?");
    expect(res.status).toBe(200);
    expect(res.body.data.messages.map((m: { role: string }) => m.role)).toEqual([
      "user",
      "assistant",
    ]);
    expect(res.body.data.usage).toMatchObject({ used: 1, limit: 20, remaining: 19 });

    const system = fakeAi.calls[0]!.system;
    expect(system).toContain("SQL: 32%, below pass mark");
    expect(system).toContain("Target role: Data Analyst");
    expect(system).toContain("Skill checks (/assessment)");
    expect(system).toContain("Never give answers to skill-check questions");
  });

  it("offers starter questions from the student's data", async () => {
    const res = await request(app).get("/api/v1/ai/coach").set(auth);
    expect(res.body.data.suggestions).toEqual(
      expect.arrayContaining([
        "How do I improve my SQL?",
        "What do Data Analyst interviews usually ask?",
      ]),
    );
  });

  it("stops at 20 messages a day", async () => {
    db.state.usage = Array.from({ length: 20 }, () => ({
      feature: "coach",
      success: true,
      createdAt: new Date(),
    }));
    const res = await ask("One more?");
    expect(res.status).toBe(429);
    expect(res.body.error.code).toBe("COACH_DAILY_LIMIT");
    expect(fakeAi.calls).toHaveLength(0);
  });

  it("saves nothing and uses no message when the AI fails", async () => {
    for (let i = 0; i < 3; i++) fakeAi.fail();
    const res = await ask("Hello?");
    expect(res.status).toBe(503);
    expect(db.state.conversation).toBeNull();
    const state = await request(app).get("/api/v1/ai/coach").set(auth);
    expect(state.body.data.usage.used).toBe(0);
  });

  it("starts a new chat without resetting the allowance", async () => {
    await ask("First question");
    const res = await request(app).delete("/api/v1/ai/coach").set(auth);
    expect(res.body.data.messages).toEqual([]);
    expect(res.body.data.usage.used).toBe(1);
  });

  it("refuses a second message while the first is still being answered", async () => {
    const first = coachService.sendCoachMessage(USER_ID, "First?");
    await expect(coachService.sendCoachMessage(USER_ID, "Second?")).rejects.toMatchObject({
      status: 429,
      code: "COACH_BUSY",
    });
    await first;
    expect(fakeAi.calls).toHaveLength(1);
    // Once answered, the next message goes through.
    await expect(coachService.sendCoachMessage(USER_ID, "Third?")).resolves.toBeTruthy();
  });

  it("appends to the latest conversation, not the copy read before the AI call", async () => {
    db.state.conversation = { id: "c1", messages: [] };
    const tip = {
      role: "assistant",
      content: "Check-in that landed meanwhile",
      created_at: new Date().toISOString(),
      nudge: true,
    };
    // Another save (a check-in) lands while the AI is answering.
    db.prisma.$queryRaw.mockImplementationOnce(async () => {
      db.state.conversation!.messages = [tip];
      return [db.state.conversation];
    });
    fakeAi.reply("Here's a plan.");
    const res = await ask("Plan my week?");
    expect(res.status).toBe(200);
    expect(db.state.conversation!.messages.map((m) => (m as { content: string }).content)).toEqual([
      "Check-in that landed meanwhile",
      "Plan my week?",
      "Here's a plan.",
    ]);
  });

  it("re-checks under a lock before creating the conversation", async () => {
    // No conversation at first; another request creates one while we wait for the lock.
    db.prisma.$queryRaw.mockImplementationOnce(async () => []);
    db.prisma.$queryRaw.mockImplementationOnce(async (strings: TemplateStringsArray) => {
      expect(strings.join("?")).toContain("pg_advisory_xact_lock");
      db.state.conversation = { id: "c0", messages: [{ role: "user", content: "Earlier" }] };
      return [{ locked: 1 }];
    });
    await ask("Hello");
    expect(db.prisma.aIConversation.create).not.toHaveBeenCalled();
    expect(db.state.conversation!.id).toBe("c0");
    expect(db.state.conversation!.messages).toHaveLength(3);
  });

  it("knows which interview question the student has open, for that reply only", async () => {
    fakeAi.reply("It's about when the filter runs.");
    const res = await request(app)
      .post("/api/v1/ai/coach/messages")
      .set(auth)
      .send({
        content: "Can you explain this question to me in simple words?",
        context: { question_id: db.question.id },
      });
    expect(res.status).toBe(200);
    const system = fakeAi.calls[0]!.system;
    expect(system).toContain("SQL interview question");
    expect(system).toContain("Question: WHERE vs HAVING");
    expect(system).toContain("What is the difference between WHERE and HAVING?");
    expect(system).toContain("Model answer (they can open it on the page)");
    expect(system).toContain("HAVING filters groups.");
    // Only the student's own words are saved.
    expect(db.state.conversation!.messages[0]).toEqual({
      role: "user",
      content: "Can you explain this question to me in simple words?",
      created_at: expect.any(String),
    });

    // The next message without context doesn't carry the question over.
    await ask("Thanks!");
    expect(fakeAi.calls[1]!.system).not.toContain("WHERE vs HAVING");
  });

  it("ignores an unknown or removed question", async () => {
    const send = (question_id: string) =>
      request(app)
        .post("/api/v1/ai/coach/messages")
        .set(auth)
        .send({ content: "Explain this question?", context: { question_id } });
    const unknown = await send("00000000-0000-4000-8000-000000000000");
    expect(unknown.status).toBe(200);
    expect(fakeAi.calls[0]!.system).not.toContain("interview question on PrepSuccess right now");

    db.question.isDeleted = true;
    const removed = await send(db.question.id);
    db.question.isDeleted = false;
    expect(removed.status).toBe(200);
    expect(fakeAi.calls[1]!.system).not.toContain("WHERE vs HAVING");

    expect((await send("not-a-uuid")).status).toBe(422);
  });

  it("is for students only", async () => {
    // The account's role in the database decides, not the token's.
    db.user.role = "ADMIN";
    const admin = { Authorization: `Bearer ${signAccessToken(USER_ID, "ADMIN")}` };
    expect((await request(app).get("/api/v1/ai/coach").set(admin)).status).toBe(403);
    db.user.role = "STUDENT";
  });
});

describe("coach check-in", () => {
  it("sends one tip as a chat message and a notification after 30 active minutes", async () => {
    const started = new Date(Date.now() - 31 * 60_000);
    db.state.activity = { sessionStartedAt: started, lastSeenAt: new Date(), lastNudgeAt: null };
    fakeAi.reply("You're close on SQL joins. Want a quick plan?");

    const res = await request(app).post("/api/v1/ai/coach/ping").set(auth);
    expect(res.body.data).toEqual({ nudged: true });
    expect(db.state.notifications).toEqual([
      expect.objectContaining({
        type: "COACH_NUDGE",
        body: "You're close on SQL joins. Want a quick plan?",
      }),
    ]);
    expect(db.state.conversation!.messages).toEqual([
      expect.objectContaining({ role: "assistant", nudge: true }),
    ]);
    // The check-in doesn't use up the student's coach messages.
    const state = await request(app).get("/api/v1/ai/coach").set(auth);
    expect(state.body.data.usage.used).toBe(0);

    const again = await request(app).post("/api/v1/ai/coach/ping").set(auth);
    expect(again.body.data).toEqual({ nudged: false });
    expect(db.state.notifications).toHaveLength(1);
  });

  it("falls back to a rule-based tip when the AI is busy", async () => {
    db.state.activity = {
      sessionStartedAt: new Date(Date.now() - 45 * 60_000),
      lastSeenAt: new Date(),
      lastNudgeAt: null,
    };
    for (let i = 0; i < 3; i++) fakeAi.fail();
    await request(app).post("/api/v1/ai/coach/ping").set(auth);
    expect(db.state.notifications[0]).toMatchObject({
      body: expect.stringContaining("revise sql"),
    });
  });

  it("releases the day's check-in when saving it fails", async () => {
    db.state.activity = {
      sessionStartedAt: new Date(Date.now() - 31 * 60_000),
      lastSeenAt: new Date(),
      lastNudgeAt: null,
    };
    db.prisma.$transaction.mockRejectedValueOnce(new Error("db down"));
    const res = await request(app).post("/api/v1/ai/coach/ping").set(auth);
    expect(res.body.data).toEqual({ nudged: false });
    expect(db.state.activity!.lastNudgeAt).toBeNull();
    expect(db.state.notifications).toHaveLength(0);

    // The next ping tries again.
    const again = await request(app).post("/api/v1/ai/coach/ping").set(auth);
    expect(again.body.data).toEqual({ nudged: true });
  });

  it("does nothing early in a session", async () => {
    const res = await request(app).post("/api/v1/ai/coach/ping").set(auth);
    expect(res.body.data).toEqual({ nudged: false });
    expect(fakeAi.calls).toHaveLength(0);
  });
});
