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
      mastery: "needs_revision",
      completed_at: "2026-10-03T10:00:00.000Z",
      attempts: 1,
      change: null,
    },
  ],
  gaps: [],
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
    isActive: true,
    isDeleted: false,
    createdAt: new Date("2026-10-01T00:00:00.000Z"),
    profile: { profileData: { target_role: "Data Analyst", college: "Christ University" } },
  };
  return {
    state,
    prisma: {
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
        updateMany: vi.fn(async ({ data }) => {
          const last = state.activity?.lastNudgeAt as Date | null | undefined;
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
    },
  };
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

const app = createApp();
const auth = { Authorization: `Bearer ${signAccessToken(USER_ID, "STUDENT")}` };
const ask = (content: string) =>
  request(app).post("/api/v1/ai/coach/messages").set(auth).send({ content });

beforeEach(() => {
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

  it("is for students only", async () => {
    const admin = { Authorization: `Bearer ${signAccessToken(USER_ID, "ADMIN")}` };
    expect((await request(app).get("/api/v1/ai/coach").set(admin)).status).toBe(403);
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

  it("does nothing early in a session", async () => {
    const res = await request(app).post("/api/v1/ai/coach/ping").set(auth);
    expect(res.body.data).toEqual({ nudged: false });
    expect(fakeAi.calls).toHaveLength(0);
  });
});
