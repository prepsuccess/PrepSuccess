import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

// In-memory stand-ins for the two tables the AI layer touches.
const db = vi.hoisted(() => ({
  signedUpAt: new Date(),
  usage: [] as {
    success: boolean;
    model: string;
    errorCode: string | null;
    feature: string;
    system: boolean;
    inputTokens: number;
    outputTokens: number;
  }[],
  successfulToday: 0,
}));

vi.mock("../src/db/prisma.js", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(async () => ({
        createdAt: db.signedUpAt,
        role: "STUDENT",
        isActive: true,
        isDeleted: false,
      })),
    },
    aiUsage: {
      count: vi.fn(async () => db.successfulToday),
      create: vi.fn(async ({ data }) => {
        db.usage.push(data);
        return data;
      }),
    },
  },
}));

const { prisma } = await import("../src/db/prisma.js");
const { generateJson, generateText, resetModelCooldowns } =
  await import("../src/services/ai-agent/ai.service.js");
const { fakeAi } = await import("../src/services/ai-agent/providers/fake.provider.js");
const { getAiAccess, startOfIndianDay } = await import("../src/services/ai-agent/access.js");
const { createApp } = await import("../src/app.js");
const { signAccessToken } = await import("../src/modules/auth/tokens.js");

const USER = "4b7a3c1e-2f0d-4a6b-9c8e-1d2f3a4b5c6d";
const base = {
  userId: USER,
  feature: "smoke_test" as const,
  system: "Be brief.",
  messages: [{ role: "user" as const, content: "Hi" }],
};

/** Rejects with the AppError code, so assertions read naturally. */
const codeOf = (promise: Promise<unknown>) =>
  promise.then(
    () => "resolved",
    (error: { code?: string }) => error.code,
  );

beforeEach(() => {
  fakeAi.reset();
  resetModelCooldowns();
  db.usage.length = 0;
  db.successfulToday = 0;
  db.signedUpAt = new Date();
});

describe("generateText", () => {
  it("returns the main model's reply and meters it", async () => {
    fakeAi.reply("  Hello!  ");
    const result = await generateText(base);

    expect(result).toMatchObject({ data: "Hello!", model: "fake-main" });
    expect(fakeAi.calls[0]).toMatchObject({ model: "fake-main", system: "Be brief." });
    expect(db.usage).toEqual([
      expect.objectContaining({ success: true, model: "fake-main", feature: "smoke_test" }),
    ]);
  });

  it("retries the main model once when it's overloaded", async () => {
    fakeAi.fail("AI_OVERLOADED");
    fakeAi.reply("second time lucky");

    expect((await generateText(base)).model).toBe("fake-main");
    expect(fakeAi.calls.map((c) => c.model)).toEqual(["fake-main", "fake-main"]);
    expect(db.usage.map((u) => u.success)).toEqual([false, true]);
  });

  it("falls back to the second model after two failures", async () => {
    fakeAi.fail("AI_OVERLOADED");
    fakeAi.fail("AI_RATE_LIMITED");
    fakeAi.reply("from fallback");

    const result = await generateText(base);
    expect(result).toMatchObject({ data: "from fallback", model: "fake-fallback" });
    expect(db.usage.map((u) => u.errorCode)).toEqual(["AI_OVERLOADED", "AI_RATE_LIMITED", null]);
  });

  it("goes straight to the fallback on a rate limit, and rests that model", async () => {
    fakeAi.fail("AI_RATE_LIMITED", true, 6 * 60 * 60_000); // daily quota used up
    fakeAi.reply("from fallback");
    const first = await generateText(base);
    expect(first.model).toBe("fake-fallback");
    expect(db.usage.map((u) => u.errorCode)).toEqual(["AI_RATE_LIMITED", null]);

    // The next call doesn't even try the rested model.
    fakeAi.reply("again");
    const second = await generateText(base);
    expect(second.model).toBe("fake-fallback");
    expect(fakeAi.calls.map((c) => c.model)).toEqual([
      "fake-main",
      "fake-fallback",
      "fake-fallback",
    ]);
  });

  it("gives up with AI_UNAVAILABLE when every attempt fails, metering each one", async () => {
    fakeAi.fail();
    fakeAi.fail();
    fakeAi.fail();

    expect(await codeOf(generateText(base))).toBe("AI_UNAVAILABLE");
    expect(db.usage).toHaveLength(3);
    expect(db.usage.every((u) => !u.success)).toBe(true);
  });

  it("doesn't retry errors that won't fix themselves", async () => {
    fakeAi.fail("AI_HTTP_400", false);
    expect(await codeOf(generateText(base))).toBe("AI_UNAVAILABLE");
    expect(fakeAi.calls).toHaveLength(1);
  });
});

describe("generateJson", () => {
  const schema = z.object({ level: z.enum(["beginner", "advanced"]), score: z.number().min(0) });

  it("sends the schema to the model and returns the validated object", async () => {
    fakeAi.reply({ level: "beginner", score: 4 });
    const result = await generateJson(base, schema);

    expect(result.data).toEqual({ level: "beginner", score: 4 });
    const sent = fakeAi.calls[0]!.jsonSchema!;
    expect(sent).not.toHaveProperty("$schema");
    expect(sent).toMatchObject({ type: "object", required: ["level", "score"] });
  });

  it("accepts JSON wrapped in a code fence", async () => {
    fakeAi.reply('```json\n{"level":"advanced","score":9}\n```');
    expect((await generateJson(base, schema)).data.level).toBe("advanced");
  });

  it("tries again when the reply doesn't match the schema", async () => {
    fakeAi.reply({ level: "expert", score: -1 });
    fakeAi.reply({ level: "advanced", score: 7 });
    expect((await generateJson(base, schema)).data).toEqual({ level: "advanced", score: 7 });
  });

  it("fails with AI_BAD_RESPONSE when the model never returns valid JSON", async () => {
    fakeAi.reply("not json");
    fakeAi.reply("still not");
    fakeAi.reply("{}");
    expect(await codeOf(generateJson(base, schema))).toBe("AI_BAD_RESPONSE");
    // The unusable replies still cost tokens, and are metered with them.
    expect(db.usage).toHaveLength(3);
    expect(db.usage[0]).toMatchObject({
      success: false,
      errorCode: "AI_BAD_RESPONSE",
      inputTokens: 10,
      outputTokens: 5,
    });
  });
});

describe("access", () => {
  it("blocks at the daily limit without calling the model", async () => {
    db.successfulToday = 200;
    expect(await codeOf(generateText(base))).toBe("AI_DAILY_LIMIT");
    expect(fakeAi.calls).toHaveLength(0);
  });

  it("records system calls as system, skips the limit for them, and counts only student calls", async () => {
    db.successfulToday = 200;
    fakeAi.reply("bank filled");
    expect((await generateText({ ...base, systemCall: true })).data).toBe("bank filled");
    expect(db.usage).toEqual([expect.objectContaining({ success: true, system: true })]);

    fakeAi.reply("hi");
    db.successfulToday = 0;
    await generateText(base);
    expect(db.usage[1]).toMatchObject({ system: false });
    expect(vi.mocked(prisma.aiUsage.count)).toHaveBeenLastCalledWith({
      where: expect.objectContaining({ userId: USER, success: true, system: false }),
    });
  });

  it("counts requests still running towards the limit, so a burst can't overshoot it", async () => {
    db.successfulToday = 199; // one left today
    fakeAi.reply("first");
    fakeAi.reply("second");
    const results = await Promise.all([codeOf(generateText(base)), codeOf(generateText(base))]);
    expect(results.sort()).toEqual(["AI_DAILY_LIMIT", "resolved"]);
    expect(fakeAi.calls).toHaveLength(1);

    // Finished requests stop counting as running (they're in ai_usage instead).
    fakeAi.reply("later");
    expect(await codeOf(generateText(base))).toBe("resolved");
  });

  it("reports an ended trial but doesn't block while enforcement is off", async () => {
    const signedUp = new Date("2026-01-01T00:00:00Z");
    const access = await getAiAccess(USER, signedUp, new Date("2026-10-01T00:00:00Z"));

    expect(access.trial).toMatchObject({ active: false, days_left: 0, enforced: false });
    expect(access.allowed).toBe(true);
    expect(access.trial.ends_at).toBe("2026-05-01T00:00:00.000Z");
  });

  it("counts days left during the trial", async () => {
    const access = await getAiAccess(
      USER,
      new Date("2026-10-01T00:00:00Z"),
      new Date("2026-10-11T00:00:00Z"),
    );
    expect(access.trial).toMatchObject({ active: true, days_left: 110 });
  });

  it("resets the daily limit at midnight India time", () => {
    // 20:00 UTC on Oct 1 is 01:30 IST on Oct 2, so the day began at 18:30 UTC on Oct 1.
    expect(startOfIndianDay(new Date("2026-10-01T20:00:00Z")).toISOString()).toBe(
      "2026-10-01T18:30:00.000Z",
    );
  });
});

describe("GET /api/v1/ai/status", () => {
  it("returns the trial and quota for the signed-in user", async () => {
    db.successfulToday = 3;
    const res = await request(createApp())
      .get("/api/v1/ai/status")
      .set("Authorization", `Bearer ${signAccessToken(USER, "STUDENT")}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      available: true,
      allowed: true,
      reason: null,
      trial: { active: true, days_left: 120, enforced: false },
      today: { requests: 3, limit: 200 },
    });
  });

  it("requires a token", async () => {
    expect((await request(createApp()).get("/api/v1/ai/status")).status).toBe(401);
  });
});
