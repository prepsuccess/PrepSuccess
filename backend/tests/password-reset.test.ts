import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

// In-memory users, OTPs, refresh tokens and notifications for the reset flow.
const db = vi.hoisted(() => {
  const now = new Date("2026-10-03T10:00:00.000Z");
  const state = {
    user: null as null | Record<string, unknown>,
    otps: [] as Record<string, unknown>[],
    revoked: 0,
    notifications: [] as Record<string, unknown>[],
  };
  const newestOtp = (where: Record<string, unknown>) =>
    state.otps
      .filter(
        (o) =>
          o.email === where.email &&
          o.purpose === where.purpose &&
          (where.isUsed === undefined || o.isUsed === where.isUsed),
      )
      .at(-1) ?? null;
  // Just enough of Prisma's where/data semantics for the OTP queries.
  type Row = Record<string, unknown>;
  const matches = (o: Row, where: Row) =>
    Object.entries(where).every(([key, cond]) => {
      if (cond === undefined) return true;
      if (cond && typeof cond === "object" && !(cond instanceof Date)) {
        const c = cond as { lt?: number; gte?: number };
        if (c.lt !== undefined && !((o[key] as number) < c.lt)) return false;
        if (c.gte !== undefined && !((o[key] as number) >= c.gte)) return false;
        return true;
      }
      return o[key] === cond;
    });
  const apply = (o: Row, data: Row) => {
    for (const [key, value] of Object.entries(data)) {
      const v = value as { increment?: number; decrement?: number };
      if (v && typeof v === "object" && "increment" in v)
        o[key] = (o[key] as number) + v.increment!;
      else if (v && typeof v === "object" && "decrement" in v)
        o[key] = (o[key] as number) - v.decrement!;
      else o[key] = value;
    }
    return o;
  };
  const prisma = {
    user: {
      findUnique: vi.fn(async ({ where }) =>
        state.user && (where.email === state.user.email || where.id === state.user.id)
          ? { ...state.user, profile: null }
          : null,
      ),
      update: vi.fn(async ({ data }) => {
        Object.assign(state.user!, data);
        return { ...state.user, profile: null };
      }),
    },
    emailOtp: {
      findFirst: vi.fn(async ({ where }) => newestOtp(where)),
      create: vi.fn(async ({ data }) => {
        const row = {
          id: `otp-${state.otps.length}`,
          attempts: 0,
          isUsed: false,
          createdAt: new Date(),
          ...data,
        };
        state.otps.push(row);
        return row;
      }),
      findUnique: vi.fn(async ({ where }) => state.otps.find((o) => o.id === where.id) ?? null),
      update: vi.fn(async ({ where, data }) =>
        apply(
          state.otps.find((o) => o.id === where.id)!,
          data,
        ),
      ),
      updateMany: vi.fn(async ({ where, data }) => {
        const rows = state.otps.filter((o) => matches(o, where));
        rows.forEach((o) => apply(o, data));
        return { count: rows.length };
      }),
      delete: vi.fn(async () => ({})),
    },
    refreshToken: {
      create: vi.fn(async () => ({})),
      updateMany: vi.fn(async () => ({ count: ++state.revoked })),
    },
    notification: { create: vi.fn(async ({ data }) => state.notifications.push(data)) },
    $transaction: vi.fn(async (arg: unknown) =>
      typeof arg === "function"
        ? (arg as (tx: unknown) => unknown)(prisma)
        : Promise.all(arg as unknown[]),
    ),
  };
  return { now, state, prisma };
});

const mail = vi.hoisted(() => ({
  sent: [] as { to: string; code: string; purpose: string }[],
  fail: false,
}));

vi.mock("../src/db/prisma.js", () => ({ prisma: db.prisma }));
vi.mock("../src/services/email/email.service.js", () => ({
  sendOtpEmail: vi.fn(async (to: string, code: string, _ttl: number, purpose: string) => {
    if (mail.fail) throw new Error("SMTP down");
    mail.sent.push({ to, code, purpose });
  }),
}));

const { createApp } = await import("../src/app.js");
const app = createApp();

const EMAIL = "asha@college.edu";
const forgot = (email = EMAIL) => request(app).post("/api/v1/auth/forgot-password").send({ email });
const reset = (otp: string, password = "new-password-123") =>
  request(app).post("/api/v1/auth/reset-password").send({ email: EMAIL, otp, password });

beforeEach(() => {
  vi.clearAllMocks();
  mail.sent = [];
  mail.fail = false;
  db.state.otps = [];
  db.state.revoked = 0;
  db.state.notifications = [];
  db.state.user = {
    id: "4b7a3c1e-2f0d-4a6b-9c8e-1d2f3a4b5c6d",
    firstName: "Asha",
    lastName: null,
    email: EMAIL,
    passwordHash: "old-hash",
    googleId: null,
    authProvider: "LOCAL",
    role: "STUDENT",
    profileImageUrl: null,
    isVerified: true,
    isActive: true,
    isDeleted: false,
    lastLoginAt: null,
    createdAt: db.now,
    updatedAt: db.now,
  };
});

describe("POST /auth/forgot-password", () => {
  it("emails a reset code to an active account", async () => {
    const res = await forgot();
    expect(res.status).toBe(200);
    expect(mail.sent).toEqual([
      { to: EMAIL, code: expect.stringMatching(/^\d{6}$/), purpose: "PASSWORD_RESET" },
    ]);
  });

  it("answers identically for unknown, deactivated and rate-limited emails, without sending", async () => {
    const known = (await forgot()).body.data.message as string;

    const unknown = await forgot("nobody@college.edu");
    expect(unknown.status).toBe(200);
    expect(unknown.body.data.message).toBe(known.replace(EMAIL, "nobody@college.edu"));

    const again = await forgot(); // inside the 60s cooldown
    expect(again.body.data.message).toBe(known);

    db.state.user!.isActive = false;
    db.state.otps = [];
    expect((await forgot()).status).toBe(200);

    expect(mail.sent).toHaveLength(1);
  });

  it("answers the same when the email fails to send, and keeps the code", async () => {
    const known = (await forgot("nobody@college.edu")).body.data.message as string;
    mail.fail = true;
    const res = await forgot();
    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe(known.replace("nobody@college.edu", EMAIL));
    expect(db.state.otps).toHaveLength(1);
    expect(db.prisma.emailOtp.delete).not.toHaveBeenCalled();
  });
});

describe("POST /auth/reset-password", () => {
  it("sets the new password, signs out other sessions, signs in and notifies", async () => {
    await forgot();
    const res = await reset(mail.sent[0]!.code);

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ token_type: "bearer", user: { email: EMAIL } });
    expect(db.state.user!.passwordHash).not.toBe("old-hash");
    expect(db.prisma.refreshToken.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: db.state.user!.id, revokedAt: null } }),
    );
    expect(db.state.notifications[0]).toMatchObject({ type: "PASSWORD_CHANGED" });

    // The code is single-use.
    expect((await reset(mail.sent[0]!.code)).body.error.code).toBe("OTP_INVALID");
  });

  it("burns the code after three wrong attempts", async () => {
    await forgot();
    const right = mail.sent[0]!.code;
    const wrong = right === "000000" ? "111111" : "000000";
    expect((await reset(wrong)).body.error.message).toContain("2 attempts left");
    await reset(wrong);
    expect((await reset(wrong)).body.error.code).toBe("OTP_INVALID");
    expect((await reset(right)).status).toBe(400);
    expect(db.state.user!.passwordHash).toBe("old-hash");
  });

  it("doesn't count a right code as an attempt", async () => {
    await forgot();
    const right = mail.sent[0]!.code;
    const wrong = right === "000000" ? "111111" : "000000";
    await reset(wrong);
    db.state.user!.isActive = false; // the code is right, but the reset still fails
    expect((await reset(right)).status).toBe(400);
    db.state.user!.isActive = true;
    expect(db.state.otps[0]!.attempts).toBe(1);
    expect((await reset(wrong)).body.error.message).toContain("1 attempt left");
    expect((await reset(right)).status).toBe(200);
  });

  it("allows at most three guesses even when they arrive at once", async () => {
    await forgot();
    const right = mail.sent[0]!.code;
    const wrong = (n: number) => String((Number(right) + n) % 1_000_000).padStart(6, "0");
    const results = await Promise.all([1, 2, 3, 4, 5, 6, 7, 8].map((n) => reset(wrong(n))));

    expect(results.every((r) => r.status === 400)).toBe(true);
    expect(db.state.otps[0]).toMatchObject({ attempts: 3, isUsed: true });
    // Only three guesses were ever compared; the rest were turned away first.
    const compared = results.filter(
      (r) => r.body.error.code === "OTP_INVALID" && !r.body.error.message.includes("isn't valid"),
    );
    expect(compared.length).toBe(3);
    // Burnt: even the right code no longer works.
    expect((await reset(right)).status).toBe(400);
    expect(db.state.user!.passwordHash).toBe("old-hash");
  });

  it("doesn't accept a signup code", async () => {
    db.state.otps.push({
      id: "signup",
      email: EMAIL,
      purpose: "SIGNUP",
      otpHash: "x",
      attempts: 0,
      isUsed: false,
      expiresAt: new Date(Date.now() + 60_000),
      createdAt: new Date(),
    });
    expect((await reset("123456")).body.error.code).toBe("OTP_INVALID");
  });

  it("validates the new password", async () => {
    expect((await reset("123456", "short")).status).toBe(422);
  });
});
