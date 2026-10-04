import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { createApp } from "../src/app.js";
import { signAccessToken } from "../src/modules/auth/tokens.js";
import { updateMeSchema } from "../src/modules/users/users.schemas.js";

// A single in-memory user. requireAuth reads it on every request; the merge
// itself is also checked manually against a real database.
const db = vi.hoisted(() => {
  const now = new Date("2026-10-03T10:00:00.000Z");
  const calls: string[] = [];
  const user = {
    id: "4b7a3c1e-2f0d-4a6b-9c8e-1d2f3a4b5c6d",
    firstName: "Asha",
    lastName: null,
    email: "asha@college.edu",
    passwordHash: "x",
    googleId: null,
    authProvider: "LOCAL",
    role: "STUDENT",
    profileImageUrl: null,
    isVerified: true,
    isActive: true,
    isDeleted: false,
    lastLoginAt: null,
    createdAt: now,
    updatedAt: now,
    profile: {
      id: "5c8b4d2f-3a1e-4b7c-8d9f-2e3a4b5c6d7e",
      userId: "4b7a3c1e-2f0d-4a6b-9c8e-1d2f3a4b5c6d",
      profileData: { college: "Christ University", onboarding_note: "kept" } as Record<
        string,
        unknown
      >,
      onboardingCompletedAt: null,
      createdAt: now,
      updatedAt: now,
    },
  };
  const prisma = {
    user: {
      findUnique: vi.fn(async ({ include }: { include?: unknown }) => {
        if (include) calls.push("read");
        return user;
      }),
      update: vi.fn(async ({ data }) => {
        calls.push("write");
        const profileData = data.profile?.upsert.update.profileData;
        return { ...user, ...data, profile: { ...user.profile, profileData } };
      }),
    },
    userProfile: {
      updateMany: vi.fn(async () => {
        calls.push("complete");
        return { count: 1 };
      }),
    },
    $queryRaw: vi.fn(async (sql: TemplateStringsArray) => {
      calls.push(sql.join("?"));
      return [];
    }),
    $transaction: vi.fn(async (fn: (tx: unknown) => unknown) => fn(prisma)),
  };
  return { calls, prisma };
});
vi.mock("../src/db/prisma.js", () => ({ prisma: db.prisma }));

const app = createApp();
const token = signAccessToken("4b7a3c1e-2f0d-4a6b-9c8e-1d2f3a4b5c6d", "STUDENT");
const patch = (body: unknown) =>
  request(app)
    .patch("/api/v1/users/me")
    .set("Authorization", `Bearer ${token}`)
    .send(body as object);

describe("PATCH /users/me — validation", () => {
  it("requires a token", async () => {
    const res = await request(app).patch("/api/v1/users/me").send({ first_name: "Asha" });
    expect(res.status).toBe(401);
  });

  it("rejects an empty update", async () => {
    const res = await patch({});
    expect(res.status).toBe(422);
  });

  it("rejects unknown profile fields", async () => {
    const res = await patch({ profile: { favourite_colour: "blue" } });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects unknown top-level fields such as role", async () => {
    const res = await patch({ first_name: "Asha", role: "admin" });
    expect(res.status).toBe(422);
  });

  it("rejects a bad phone number and an out-of-range year", async () => {
    const res = await patch({ profile: { mobile_no: "call me", student_year: 9 } });
    expect(res.status).toBe(422);
    const paths = res.body.error.details.map((issue: { path: string[] }) => issue.path.join("."));
    expect(paths).toEqual(expect.arrayContaining(["profile.mobile_no", "profile.student_year"]));
  });
});

describe("PATCH /users/me — merge", () => {
  it("locks the profile row before reading it, then merges and writes", async () => {
    db.calls.length = 0;
    const res = await patch({ profile: { college: null, mobile_no: "9876543210" } });

    expect(res.status).toBe(200);
    expect(res.body.data.profile).toEqual({ onboarding_note: "kept", mobile_no: "9876543210" });
    expect(db.calls).toEqual([
      "SELECT id FROM user_profiles WHERE user_id = ?::uuid FOR UPDATE",
      "read",
      "write",
    ]);
    expect(res.body.data.onboarding_completed).toBe(false);
  });

  it("finishes onboarding once the profile page fills the last required field", async () => {
    db.calls.length = 0;
    const res = await patch({
      profile: {
        degree: "B.Tech CSE",
        student_year: 3,
        skills: ["JavaScript"],
        target_role: "Frontend developer",
        goals: ["Crack a product company"],
      },
    });

    expect(res.status).toBe(200);
    expect(res.body.data.onboarding_completed).toBe(true);
    expect(db.calls.at(-1)).toBe("complete");
    expect(db.prisma.userProfile.updateMany).toHaveBeenCalledWith({
      where: { userId: "4b7a3c1e-2f0d-4a6b-9c8e-1d2f3a4b5c6d", onboardingCompletedAt: null },
      data: { onboardingCompletedAt: expect.any(Date) },
    });
  });
});

describe("updateMeSchema", () => {
  it("accepts null to clear a profile field and trims strings", () => {
    const parsed = updateMeSchema.parse({
      first_name: "  Asha ",
      profile: { mobile_no: null, college: " Christ University ", skills: ["HTML", "CSS"] },
    });
    expect(parsed).toEqual({
      first_name: "Asha",
      profile: { mobile_no: null, college: "Christ University", skills: ["HTML", "CSS"] },
    });
  });

  it("accepts Indian and international phone formats", () => {
    for (const mobile_no of ["9876543210", "+91 98765 43210", "+1-415-555-0100"]) {
      expect(updateMeSchema.safeParse({ profile: { mobile_no } }).success).toBe(true);
    }
  });
});
