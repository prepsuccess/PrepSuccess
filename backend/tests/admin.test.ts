import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { countByDay, indianDate, percentOrNull } from "../src/modules/admin/admin.logic.js";

const ADMIN_ID = "1a1a1a1a-1a1a-4a1a-8a1a-1a1a1a1a1a1a";
const STUDENT_ID = "4b7a3c1e-2f0d-4a6b-9c8e-1d2f3a4b5c6d";
const SKILL_ID = "5c8b4d2f-3a1e-4b7c-8d9f-2e3a4b5c6d7e";

const db = vi.hoisted(() => {
  const now = new Date("2026-10-03T10:00:00.000Z");
  const student = {
    id: "4b7a3c1e-2f0d-4a6b-9c8e-1d2f3a4b5c6d",
    firstName: "Asha",
    lastName: "Verma",
    email: "asha@college.edu",
    passwordHash: "secret-hash",
    googleId: null,
    authProvider: "LOCAL",
    role: "STUDENT",
    profileImageUrl: null,
    isVerified: true,
    isActive: true,
    isDeleted: false,
    lastLoginAt: now,
    createdAt: now,
    updatedAt: now,
    profile: { onboardingCompletedAt: now },
  };
  const skill = {
    id: "5c8b4d2f-3a1e-4b7c-8d9f-2e3a4b5c6d7e",
    slug: "sql",
    name: "SQL",
    category: "TECHNICAL",
    topic: "Databases",
    subtopic: null,
    description: null,
    masteryThreshold: 40,
    isActive: true,
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
  };
  const state = { resources: [] as Record<string, unknown>[], skillUpdates: [] as unknown[] };
  return {
    now,
    student,
    skill,
    state,
    prisma: {
      user: {
        findMany: vi.fn(async () => [student]),
        count: vi.fn(async () => 1),
        findFirst: vi.fn(async ({ where }) => (where.id === student.id ? student : null)),
        update: vi.fn(async ({ data }) => ({ ...student, ...data })),
        groupBy: vi.fn(async () => [
          { role: "STUDENT", _count: { _all: 3 } },
          { role: "ADMIN", _count: { _all: 1 } },
        ]),
      },
      userProfile: { count: vi.fn(async () => 2) },
      refreshToken: { updateMany: vi.fn(async () => ({ count: 2 })) },
      assessment: {
        count: vi.fn(async () => 1),
        groupBy: vi.fn(async () => [{ skillId: skill.id, _count: { _all: 5 } }]),
      },
      assessmentResult: {
        findMany: vi.fn(async () => [
          {
            score: 7,
            maxScore: 14,
            masteryStatus: "MASTERED",
            assessment: { userId: "u1", skill: { name: "SQL", category: "TECHNICAL" } },
          },
          {
            score: 2,
            maxScore: 14,
            masteryStatus: "NEEDS_REVISION",
            assessment: { userId: "u1", skill: { name: "DSA", category: "TECHNICAL" } },
          },
          {
            score: 14,
            maxScore: 14,
            masteryStatus: "MASTERED",
            assessment: { userId: "u2", skill: { name: "SQL", category: "TECHNICAL" } },
          },
        ]),
      },
      userTaskSubmission: {
        count: vi.fn(async ({ where } = {}) => (where?.passed ? 1 : 4)),
      },
      aiUsage: {
        count: vi.fn(async ({ where }) => (where.success === false ? 1 : 10)),
        aggregate: vi.fn(async () => ({ _sum: { inputTokens: 900, outputTokens: 100 } })),
      },
      skill: {
        findMany: vi.fn(async () => [skill]),
        findFirst: vi.fn(async ({ where }) => (where.id === skill.id ? skill : null)),
        update: vi.fn(async ({ data }) => {
          db.state.skillUpdates.push(data);
          return { ...skill, ...data };
        }),
      },
      learningResource: {
        groupBy: vi.fn(async () => [{ skillId: skill.id, _count: { _all: 2 } }]),
        create: vi.fn(async ({ data }) => ({
          id: "00000000-0000-4000-8000-000000000001",
          isActive: true,
          isDeleted: false,
          createdAt: now,
          updatedAt: now,
          ...data,
        })),
      },
      practicalTask: { groupBy: vi.fn(async () => []) },
      $transaction: vi.fn(async (fn: (tx: unknown) => unknown) => fn(db.prisma)),
    },
  };
});

vi.mock("../src/db/prisma.js", () => ({ prisma: db.prisma }));

const { createApp } = await import("../src/app.js");
const { signAccessToken } = await import("../src/modules/auth/tokens.js");
const { adminRouter } = await import("../src/modules/admin/admin.routes.js");

const app = createApp();
const as = (role: "STUDENT" | "MENTOR" | "ADMIN", id = ADMIN_ID) => ({
  Authorization: `Bearer ${signAccessToken(id, role)}`,
});

beforeEach(() => {
  vi.clearAllMocks();
  db.state.skillUpdates = [];
});

describe("admin access", () => {
  // Every route on the router, with sample ids filled in.
  const routes = adminRouter.stack.flatMap((layer) => {
    const route = layer.route as { path: string; methods: Record<string, boolean> } | undefined;
    if (!route) return [];
    const path = "/api/v1/admin" + route.path.replace(":id", SKILL_ID);
    return Object.keys(route.methods).map((method) => ({ method, path }));
  });

  it("covers the whole admin API", () => {
    expect(routes.length).toBeGreaterThanOrEqual(15);
  });

  it.each(["STUDENT", "MENTOR"] as const)("rejects a %s on every route", async (role) => {
    for (const { method, path } of routes) {
      const res = await (request(app) as unknown as Record<string, (p: string) => request.Test>)[
        method
      ]!(path)
        .set(as(role, STUDENT_ID))
        .send({});
      expect(res.status, `${method.toUpperCase()} ${path}`).toBe(403);
    }
  });

  it("rejects anonymous requests", async () => {
    expect((await request(app).get("/api/v1/admin/users")).status).toBe(401);
  });
});

describe("admin users", () => {
  it("lists account fields only, with pagination meta", async () => {
    const res = await request(app)
      .get("/api/v1/admin/users?q=asha&page=1&limit=10")
      .set(as("ADMIN"));
    expect(res.status).toBe(200);
    expect(res.body.meta).toEqual({ page: 1, limit: 10, total: 1 });
    expect(res.body.data[0]).toMatchObject({
      email: "asha@college.edu",
      role: "student",
      onboarding_completed: true,
    });
    expect(res.body.data[0]).not.toHaveProperty("password_hash");
    expect(JSON.stringify(res.body.data)).not.toContain("secret-hash");
    // Search is case-insensitive across name and email.
    expect(db.prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { email: { contains: "asha", mode: "insensitive" } },
            { firstName: { contains: "asha", mode: "insensitive" } },
            { lastName: { contains: "asha", mode: "insensitive" } },
          ],
        }),
      }),
    );
  });

  it("deactivates a user and signs them out everywhere", async () => {
    const res = await request(app)
      .patch(`/api/v1/admin/users/${STUDENT_ID}`)
      .set(as("ADMIN"))
      .send({ is_active: false });
    expect(res.status).toBe(200);
    expect(res.body.data.is_active).toBe(false);
    expect(db.prisma.refreshToken.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: STUDENT_ID, revokedAt: null } }),
    );
  });

  it("won't let an admin change their own account", async () => {
    const res = await request(app)
      .patch(`/api/v1/admin/users/${ADMIN_ID}`)
      .set(as("ADMIN"))
      .send({ is_active: false });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("CANNOT_CHANGE_SELF");
  });

  it("rejects an empty update", async () => {
    const res = await request(app)
      .patch(`/api/v1/admin/users/${STUDENT_ID}`)
      .set(as("ADMIN"))
      .send({});
    expect(res.status).toBe(422);
  });
});

describe("admin analytics", () => {
  it("returns aggregates only", async () => {
    const res = await request(app).get("/api/v1/admin/analytics").set(as("ADMIN"));
    expect(res.status).toBe(200);
    const data = res.body.data;
    expect(data.users).toMatchObject({ total: 4, students: 3, admins: 1, mentors: 0 });
    expect(data.checks).toMatchObject({
      completed: 3,
      students_checked: 2,
      mastered_rate: 67,
      average_percent: 55, // (50 + 14 + 100) / 3
    });
    expect(data.top_skills).toEqual([
      { name: "SQL", checks: 2 },
      { name: "DSA", checks: 1 },
    ]);
    expect(data.tasks).toEqual({ submissions: 4, pass_rate: 25 });
    expect(data.ai).toMatchObject({ requests_30d: 10, failure_rate_30d: 10, tokens_30d: 1000 });
    expect(data.signups_by_day).toHaveLength(30);
    // No user ids anywhere in the response.
    expect(JSON.stringify(data)).not.toMatch(/u1|u2|asha/);
  });

  it("buckets by India-time day, zero-filled", () => {
    const now = new Date("2026-10-03T10:00:00.000Z"); // 15:30 IST
    const lateNightIst = new Date("2026-10-02T19:00:00.000Z"); // 00:30 IST on Oct 3
    expect(indianDate(lateNightIst)).toBe("2026-10-03");
    const days = countByDay([lateNightIst, now, new Date("2026-01-01T00:00:00Z")], now, 3);
    expect(days).toEqual([
      { date: "2026-10-01", count: 0 },
      { date: "2026-10-02", count: 0 },
      { date: "2026-10-03", count: 2 },
    ]);
    expect(percentOrNull(1, 0)).toBeNull();
  });
});

describe("admin content", () => {
  it("lists skills with counts", async () => {
    const res = await request(app).get("/api/v1/admin/skills").set(as("ADMIN"));
    expect(res.body.data[0]).toMatchObject({ slug: "sql", resources: 2, tasks: 0, checks: 5 });
  });

  it("soft-deletes a skill", async () => {
    const res = await request(app).delete(`/api/v1/admin/skills/${SKILL_ID}`).set(as("ADMIN"));
    expect(res.body.data).toEqual({ id: SKILL_ID, deleted: true });
    expect(db.state.skillUpdates).toEqual([{ isDeleted: true, isActive: false }]);
  });

  it("takes a resource as a link or notes, never both or neither", async () => {
    const post = (body: object) =>
      request(app)
        .post("/api/v1/admin/resources")
        .set(as("ADMIN"))
        .send({ skill_id: SKILL_ID, title: "SQLBolt", type: "practice", ...body });

    expect((await post({ url: "https://sqlbolt.com/" })).status).toBe(201);
    expect((await post({ content: "Notes" })).status).toBe(201);
    expect((await post({})).status).toBe(422);
    expect((await post({ url: "https://sqlbolt.com/", content: "Notes" })).status).toBe(422);
    expect((await post({ url: "javascript:alert(1)" })).status).toBe(422);
  });
});
