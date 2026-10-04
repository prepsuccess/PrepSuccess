import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const USER_ID = "4b7a3c1e-2f0d-4a6b-9c8e-1d2f3a4b5c6d";
const OTHER_ID = "9f9f9f9f-9f9f-4f9f-8f9f-9f9f9f9f9f9f";
const N1 = "00000000-0000-4000-8000-000000000001";

const db = vi.hoisted(() => {
  const state = { rows: [] as Record<string, unknown>[], failCreate: false };
  const mine = (where: Record<string, unknown>) =>
    state.rows.filter(
      (n) =>
        n.userId === where.userId &&
        (where.id === undefined || n.id === where.id) &&
        (where.readAt === undefined || n.readAt === where.readAt),
    );
  return {
    state,
    prisma: {
      // requireAuth reads the account on every request.
      user: {
        findUnique: vi.fn(async () => ({ role: "STUDENT", isActive: true, isDeleted: false })),
      },
      notification: {
        create: vi.fn(async ({ data }) => {
          if (state.failCreate) throw new Error("db down");
          state.rows.push({
            id: `n${state.rows.length}`,
            readAt: null,
            createdAt: new Date(),
            ...data,
          });
        }),
        findMany: vi.fn(async ({ where }) => mine(where)),
        count: vi.fn(async ({ where }) => mine(where).length),
        updateMany: vi.fn(async ({ where, data }) => {
          const rows = mine(where);
          rows.forEach((n) => Object.assign(n, data));
          return { count: rows.length };
        }),
      },
    },
  };
});

vi.mock("../src/db/prisma.js", () => ({ prisma: db.prisma }));

const { createApp } = await import("../src/app.js");
const { signAccessToken } = await import("../src/modules/auth/tokens.js");
const { notify } = await import("../src/services/notifications/notifications.service.js");

const app = createApp();
const auth = { Authorization: `Bearer ${signAccessToken(USER_ID, "STUDENT")}` };

beforeEach(() => {
  db.state.failCreate = false;
  db.state.rows = [
    {
      id: N1,
      userId: USER_ID,
      type: "WELCOME",
      title: "Welcome",
      body: null,
      href: "/onboarding",
      readAt: null,
      createdAt: new Date(),
    },
    {
      id: "n-other",
      userId: OTHER_ID,
      type: "WELCOME",
      title: "Not yours",
      body: null,
      href: null,
      readAt: null,
      createdAt: new Date(),
    },
  ];
});

describe("notifications", () => {
  it("lists only my notifications with the unread count", async () => {
    const res = await request(app).get("/api/v1/notifications").set(auth);
    expect(res.status).toBe(200);
    expect(res.body.data.unread_count).toBe(1);
    expect(res.body.data.notifications).toEqual([
      expect.objectContaining({ id: N1, title: "Welcome", read: false, href: "/onboarding" }),
    ]);
  });

  it("marks one read, idempotently, and 404s someone else's", async () => {
    const res = await request(app).post(`/api/v1/notifications/${N1}/read`).set(auth);
    expect(res.body.data.unread_count).toBe(0);
    expect((await request(app).post(`/api/v1/notifications/${N1}/read`).set(auth)).status).toBe(
      200,
    );

    const other = await request(app)
      .post("/api/v1/notifications/9f9f9f9f-0000-4000-8000-000000000000/read")
      .set(auth);
    expect(other.status).toBe(404);
  });

  it("marks all read", async () => {
    await notify(USER_ID, { type: "TASK_REVIEWED", title: "Task passed" });
    const res = await request(app).post("/api/v1/notifications/read-all").set(auth);
    expect(res.body.data.unread_count).toBe(0);
    expect(db.state.rows.find((n) => n.userId === OTHER_ID)!.readAt).toBeNull();
  });

  it("never throws when the write fails", async () => {
    db.state.failCreate = true;
    await expect(notify(USER_ID, { type: "WELCOME", title: "Hi" })).resolves.toBeUndefined();
  });
});
