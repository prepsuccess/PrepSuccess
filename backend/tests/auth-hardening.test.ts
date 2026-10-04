import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Refresh-token reuse handling and Google account linking, against in-memory
// users and refresh tokens.
const db = vi.hoisted(() => {
  const now = new Date("2026-10-03T10:00:00.000Z");
  const user = {
    id: "4b7a3c1e-2f0d-4a6b-9c8e-1d2f3a4b5c6d",
    firstName: "Asha",
    lastName: null,
    email: "asha@college.edu",
    passwordHash: "x",
    googleId: null as string | null,
    authProvider: "LOCAL",
    role: "STUDENT",
    profileImageUrl: null,
    isVerified: true,
    isActive: true,
    isDeleted: false,
    lastLoginAt: null,
    createdAt: now,
    updatedAt: now,
    profile: null,
  };
  const state = {
    user: { ...user },
    tokens: [] as Record<string, unknown>[],
  };
  const matches = (row: Record<string, unknown>, where: Record<string, unknown>) =>
    Object.entries(where).every(([key, value]) => row[key] === value);
  const prisma = {
    user: {
      findUnique: vi.fn(async ({ where }) =>
        (where.id && where.id === state.user.id) ||
        (where.email && where.email === state.user.email) ||
        (where.googleId && where.googleId === state.user.googleId)
          ? { ...state.user }
          : null,
      ),
      update: vi.fn(async ({ data }) => Object.assign(state.user, data)),
      create: vi.fn(),
    },
    refreshToken: {
      findUnique: vi.fn(async ({ where }) => {
        const row = state.tokens.find((t) => t.tokenHash === where.tokenHash);
        return row ? { ...row, user: { ...state.user } } : null;
      }),
      create: vi.fn(async ({ data }) => {
        state.tokens.push({ id: `rt-${state.tokens.length}`, revokedAt: null, ...data });
        return {};
      }),
      updateMany: vi.fn(async ({ where, data }) => {
        const rows = state.tokens.filter((t) => matches(t, where));
        rows.forEach((t) => Object.assign(t, data));
        return { count: rows.length };
      }),
    },
    $transaction: vi.fn(async (fn: (tx: unknown) => unknown) => fn(prisma)),
  };
  return { user, state, prisma };
});

vi.mock("../src/db/prisma.js", () => ({ prisma: db.prisma }));

const { createApp } = await import("../src/app.js");
const { hashSecret } = await import("../src/lib/crypto.js");
const { loginWithGoogle } = await import("../src/modules/auth/auth.service.js");

const app = createApp();
const USER_ID = db.user.id;

/** Adds a refresh token row and returns the raw token the client would hold. */
function addToken(raw: string, extra: Record<string, unknown> = {}) {
  db.state.tokens.push({
    id: `rt-${raw}`,
    userId: USER_ID,
    tokenHash: hashSecret(raw),
    expiresAt: new Date(Date.now() + 86_400_000),
    revokedAt: null,
    revokeReason: null,
    ...extra,
  });
  return raw;
}
const refresh = (token: string) =>
  request(app).post("/api/v1/auth/refresh").send({ refresh_token: token });
const live = () => db.state.tokens.filter((t) => t.revokedAt === null);

beforeEach(() => {
  vi.clearAllMocks();
  db.state.user = { ...db.user };
  db.state.tokens = [];
});

describe("POST /auth/refresh", () => {
  it("rotates a live token and records why the old one was revoked", async () => {
    const token = addToken("live");
    const res = await refresh(token);
    expect(res.status).toBe(200);
    expect(db.state.tokens[0]).toMatchObject({
      revokedAt: expect.any(Date),
      revokeReason: "rotated",
    });
    expect(live()).toHaveLength(1);
  });

  it("answers 409 for a token another tab rotated seconds ago, revoking nothing", async () => {
    const token = addToken("other-tab", {
      revokedAt: new Date(Date.now() - 5_000),
      revokeReason: "rotated",
    });
    addToken("newest");

    const res = await refresh(token);
    expect(res.status).toBe(409);
    expect(res.body.error).toMatchObject({
      code: "REFRESH_RACE",
      message: "Your session was just refreshed in another tab. Try again.",
    });
    expect(live()).toHaveLength(1);
  });

  it("treats an old rotated token as stolen and signs out every session", async () => {
    const token = addToken("stolen", {
      revokedAt: new Date(Date.now() - 10 * 60_000),
      revokeReason: "rotated",
    });
    addToken("phone");
    addToken("laptop");

    const res = await refresh(token);
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("INVALID_REFRESH_TOKEN");
    expect(live()).toHaveLength(0);
    expect(db.state.tokens.filter((t) => t.revokeReason === "reuse")).toHaveLength(2);
  });

  it.each(["logout", "password_reset", "admin", "reuse", null])(
    "just 401s a token revoked for %s, leaving other sessions alone",
    async (reason) => {
      const token = addToken("old", {
        revokedAt: new Date(Date.now() - 10 * 60_000),
        revokeReason: reason,
      });
      addToken("other-device");

      const res = await refresh(token);
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe("INVALID_REFRESH_TOKEN");
      expect(live()).toHaveLength(1);
    },
  );

  it("answers 409 when a parallel refresh wins the rotation", async () => {
    const token = addToken("same-moment");
    // Rotated by the other request between our read and our write.
    db.prisma.refreshToken.updateMany.mockResolvedValueOnce({ count: 0 });
    const res = await refresh(token);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("REFRESH_RACE");
  });
});

describe("POST /auth/logout", () => {
  it("revokes the token with reason logout", async () => {
    const token = addToken("bye");
    await request(app).post("/api/v1/auth/logout").send({ refresh_token: token });
    expect(db.state.tokens[0]).toMatchObject({ revokeReason: "logout" });
  });
});

describe("loginWithGoogle", () => {
  const identity = {
    googleId: "g-123",
    email: "asha@college.edu",
    emailVerified: true,
    firstName: "Asha",
    lastName: null,
    picture: "https://example.com/a.png",
  };

  it("won't link Google to a deactivated account", async () => {
    db.state.user.isActive = false;
    await expect(loginWithGoogle(identity)).rejects.toMatchObject({
      status: 403,
      code: "ACCOUNT_DEACTIVATED",
    });
    expect(db.prisma.user.update).not.toHaveBeenCalled();
    expect(db.state.user.googleId).toBeNull();
    expect(db.state.tokens).toHaveLength(0);
  });

  it("won't link Google to a deleted account", async () => {
    db.state.user.isDeleted = true;
    await expect(loginWithGoogle(identity)).rejects.toMatchObject({ code: "ACCOUNT_DEACTIVATED" });
    expect(db.prisma.user.update).not.toHaveBeenCalled();
  });

  it("links Google to an active account with the same email", async () => {
    const session = await loginWithGoogle(identity);
    expect(session.user.email).toBe("asha@college.edu");
    expect(db.state.user.googleId).toBe("g-123");
  });
});
