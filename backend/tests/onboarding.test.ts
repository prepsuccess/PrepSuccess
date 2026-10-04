import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  LIST_LIMITS,
  buildSystemPrompt,
  followUpReply,
  isComplete,
  mergeProfile,
  missingFields,
  sanitizeExtracted,
} from "../src/modules/onboarding/onboarding.logic.js";
import { profileFields } from "../src/modules/users/users.schemas.js";

// In-memory stand-ins for the rows an onboarding turn touches.
const db = vi.hoisted(() => {
  const state = {
    user: null as null | Record<string, unknown>,
    conversation: null as null | { id: string; messages: unknown[]; updatedAt: Date },
    tick: 0,
  };
  const stamp = () => new Date(Date.UTC(2026, 9, 3) + ++state.tick);
  const userRow = () => ({ ...state.user, profile: state.user?.profile ?? null });
  return {
    state,
    reset() {
      const now = new Date();
      state.user = {
        id: "4b7a3c1e-2f0d-4a6b-9c8e-1d2f3a4b5c6d",
        firstName: "Asha",
        lastName: "Verma",
        email: "asha@college.edu",
        profileImageUrl: null,
        role: "STUDENT",
        authProvider: "LOCAL",
        isVerified: true,
        isActive: true,
        isDeleted: false,
        createdAt: now,
        updatedAt: now,
        profile: { profileData: {}, onboardingCompletedAt: null },
      };
      state.conversation = null;
      state.tick = 0;
    },
    prisma: {
      user: {
        findUnique: vi.fn(async () => userRow()),
        update: vi.fn(async ({ data }) => {
          const upsert = data.profile?.upsert?.update;
          if (upsert) state.user!.profile = { ...upsert };
          return userRow();
        }),
      },
      userProfile: {
        findUnique: vi.fn(async () => state.user?.profile ?? null),
        updateMany: vi.fn(async ({ where, data }) => {
          const profile = state.user?.profile as Record<string, unknown> | null;
          if (!profile || (where.onboardingCompletedAt === null && profile.onboardingCompletedAt))
            return { count: 0 };
          Object.assign(profile, data);
          return { count: 1 };
        }),
      },
      aIConversation: {
        findFirst: vi.fn(async () => state.conversation && { ...state.conversation }),
        create: vi.fn(
          async ({ data }) =>
            (state.conversation = {
              id: "c0ffee00-0000-4000-8000-000000000001",
              messages: data.messages,
              updatedAt: stamp(),
            }),
        ),
        // Applies only if nobody saved a turn since it was read (optimistic lock).
        updateMany: vi.fn(async ({ where, data }) => {
          const c = state.conversation;
          if (!c || c.id !== where.id || c.updatedAt.getTime() !== where.updatedAt.getTime())
            return { count: 0 };
          state.conversation = { ...c, messages: data.messages, updatedAt: stamp() };
          return { count: 1 };
        }),
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
const auth = () => ({
  Authorization: `Bearer ${signAccessToken("4b7a3c1e-2f0d-4a6b-9c8e-1d2f3a4b5c6d", "STUDENT")}`,
});
const send = (content: string) =>
  request(app).post("/api/v1/ai/onboarding/messages").set(auth()).send({ content });

beforeEach(() => {
  // Call counts must start at zero, so "not called" assertions mean this test only.
  vi.clearAllMocks();
  db.reset();
  fakeAi.reset();
});

describe("onboarding rules", () => {
  it("knows what's still missing and when it's complete", () => {
    expect(missingFields({})).toEqual(["degree", "student_year", "skills", "target_role", "goals"]);
    const full = {
      degree: "BCA",
      student_year: 3,
      skills: ["HTML"],
      target_role: "SDE",
      goals: ["Get placed"],
    };
    expect(isComplete(full)).toBe(true);
    expect(isComplete({ ...full, skills: [] })).toBe(false);
  });

  it("drops extracted values that fail the profile rules, field by field", () => {
    expect(
      sanitizeExtracted({
        degree: "BCA",
        student_year: 9,
        skills: ["HTML", ""],
        favourite_food: "dosa",
      }),
    ).toEqual({ degree: "BCA" });
  });

  it("unions skills case-insensitively and replaces single values", () => {
    const merged = mergeProfile(
      { skills: ["HTML", "CSS"], degree: "BCA" },
      { skills: ["css", "SQL"], degree: "BCA (Hons)" },
    );
    expect(merged).toEqual({ skills: ["HTML", "CSS", "SQL"], degree: "BCA (Hons)" });
  });

  it("dedupes lists case-insensitively, within the new batch too, and caps them", () => {
    const merged = mergeProfile(
      { skills: ["HTML", "html "], goals: Array.from({ length: 9 }, (_, i) => `Goal ${i}`) },
      { skills: ["SQL", "sql", "Html"], goals: ["New goal", "Another goal"] },
    );
    expect(merged.skills).toEqual(["HTML", "SQL"]);
    // The first nine stay; only one more fits under the cap of 10.
    expect(merged.goals).toHaveLength(10);
    expect((merged.goals as string[]).at(-1)).toBe("New goal");
  });

  it("caps lists at the same sizes a profile edit allows", () => {
    for (const [field, limit] of Object.entries(LIST_LIMITS)) {
      const rule = profileFields[field as keyof typeof profileFields];
      const list = (n: number) => Array.from({ length: n }, (_, i) => `item ${i}`);
      expect(rule.safeParse(list(limit)).success, field).toBe(true);
      expect(rule.safeParse(list(limit + 1)).success, field).toBe(false);
    }
  });

  it("tells the model what's known and what's still needed", () => {
    const prompt = buildSystemPrompt("Asha", { degree: "BCA", skills: ["HTML"] });
    expect(prompt).toContain("Still needed, ask in this order: student_year, target_role, goals");
    expect(prompt).toContain('"degree":"BCA"');
    expect(prompt).toContain("Never guess");
  });

  it("lets the model pick up facts from earlier messages, without re-extracting known ones", () => {
    const prompt = buildSystemPrompt("Asha", {});
    expect(prompt).toContain("any of the student's messages in this chat");
    expect(prompt).not.toContain("ONLY from the student's latest message");
    expect(prompt).toContain("Don't extract fields that are already known again");
  });

  it("follows up on the first missing detail, in order", () => {
    expect(followUpReply("Asha", {})).toContain("what are you studying");
    expect(followUpReply("Asha", { degree: "BCA", student_year: 3, goals: ["Get placed"] })).toBe(
      "Thanks, Asha! One more thing: which skills do you know, like HTML, Java or SQL?",
    );
    expect(
      followUpReply("Asha", {
        degree: "BCA",
        student_year: 3,
        skills: ["JS"],
        goals: ["Get placed"],
      }),
    ).toContain("what role are you aiming for");
    expect(
      followUpReply("Asha", {
        degree: "BCA",
        student_year: 3,
        skills: ["JS"],
        target_role: "SDE",
        goals: ["Get placed"],
      }),
    ).toBeNull();
  });
});

describe("GET /api/v1/ai/onboarding", () => {
  it("reports completion from onboarding_completed_at, like the dashboard does", async () => {
    // Completed earlier, though a detail has since been removed on the profile page.
    db.state.user!.profile = { profileData: { degree: "BCA" }, onboardingCompletedAt: new Date() };
    const res = await request(app).get("/api/v1/ai/onboarding").set(auth());
    expect(res.body.data.completed).toBe(true);
  });

  it("completes onboarding when the profile page filled in every detail", async () => {
    db.state.user!.profile = {
      profileData: {
        degree: "BCA",
        student_year: 3,
        skills: ["HTML"],
        target_role: "SDE",
        goals: ["Get placed"],
      },
      onboardingCompletedAt: null,
    };
    const res = await request(app).get("/api/v1/ai/onboarding").set(auth());
    expect(res.body.data.completed).toBe(true);
    expect(db.prisma.userProfile.updateMany).toHaveBeenCalledTimes(1);
    expect(
      (db.state.user!.profile as { onboardingCompletedAt: Date | null }).onboardingCompletedAt,
    ).toBeInstanceOf(Date);
  });

  it("starts the chat with a greeting, without calling the AI", async () => {
    const res = await request(app).get("/api/v1/ai/onboarding").set(auth());

    expect(res.status).toBe(200);
    expect(res.body.data.messages).toHaveLength(1);
    expect(res.body.data.messages[0]).toMatchObject({ role: "assistant" });
    expect(res.body.data.messages[0].content).toContain("Hi Asha!");
    expect(res.body.data.progress).toMatchObject({ collected: 0, total: 5 });
    expect(fakeAi.calls).toHaveLength(0);
  });
});

describe("POST /api/v1/ai/onboarding/messages", () => {
  it("replies, saves both messages and merges what it extracted", async () => {
    fakeAi.reply({
      reply: "Nice! Which skills would you put on your resume?",
      extracted: { degree: "BCA", student_year: 3 },
      done: false,
    });

    const res = await send("Final year BCA");

    expect(res.status).toBe(200);
    const { onboarding, user } = res.body.data;
    expect(onboarding.messages.map((m: { role: string }) => m.role)).toEqual([
      "assistant",
      "user",
      "assistant",
    ]);
    expect(onboarding.messages[2].content).toBe("Nice! Which skills would you put on your resume?");
    expect(onboarding.profile).toEqual({ degree: "BCA", student_year: 3 });
    expect(onboarding.progress.collected).toBe(2);
    expect(onboarding.completed).toBe(false);
    expect(user.onboarding_completed).toBe(false);
    // The model saw the student's message and the rules for what's still needed.
    expect(fakeAi.calls[0]!.messages.at(-1)).toEqual({ role: "user", content: "Final year BCA" });
    expect(fakeAi.calls[0]!.system).toContain("Still needed");
  });

  it("saves picked skills exactly as picked, before the AI, ignoring unknown names", async () => {
    db.state.user!.profile = {
      profileData: { degree: "BCA", student_year: 3, skills: ["html"] },
      onboardingCompletedAt: null,
    };
    // Even if the model "extracts" something else, the picks stand.
    fakeAi.reply({
      reply: "Great picks! What role are you aiming for?",
      extracted: {},
      done: false,
    });

    const res = await request(app)
      .post("/api/v1/ai/onboarding/messages")
      .set(auth())
      .send({
        content: "I know: MERN stack, Git & GitHub",
        skills: ["mern STACK", "Git & GitHub", "Kubernetes wizardry", "HTML"],
      });

    expect(res.status).toBe(200);
    // Canonical spelling, unioned with what was there (html ≈ HTML), unknown dropped.
    expect(res.body.data.onboarding.profile.skills).toEqual(["html", "MERN stack", "Git & GitHub"]);
    // The model was told the skills are already known.
    expect(fakeAi.calls[0]!.system).toContain("MERN stack");
    expect(res.body.data.onboarding.skill_options.stacks[0]).toEqual({
      name: "MERN stack",
      skills: ["MongoDB", "Express.js", "React", "Node.js", "JavaScript"],
    });
  });

  it("completes once every required detail is in — decided by the server", async () => {
    db.state.user!.profile = {
      profileData: {
        degree: "BCA",
        student_year: 3,
        skills: ["HTML"],
        target_role: "Frontend developer",
      },
      onboardingCompletedAt: null,
    };
    // The model forgets to say done; the server still completes it.
    fakeAi.reply({
      reply: "Great goal!",
      extracted: { goals: ["Get placed in a product company"] },
      done: false,
    });

    const res = await send("I want to get placed in a product company");

    expect(res.body.data.onboarding.completed).toBe(true);
    expect(res.body.data.user.onboarding_completed).toBe(true);
  });

  it("does not complete just because the model says done", async () => {
    fakeAi.reply({ reply: "All set!", extracted: { degree: "BCA" }, done: true });
    const res = await send("BCA");
    expect(res.body.data.onboarding.completed).toBe(false);
  });

  it("asks for the missing role instead of saying 'all set' when the model wraps up early", async () => {
    db.state.user!.profile = {
      profileData: { degree: "B.Tech", student_year: 3, skills: ["JavaScript", "React"] },
      onboardingCompletedAt: null,
    };
    // The model saved the goals but missed the role said in an earlier message.
    fakeAi.reply({
      reply: "Thank you, Asha! Your skill checks are ready to begin now!",
      extracted: { goals: ["Get placed"] },
      done: true,
    });

    const res = await send("I want to get placed");

    const { onboarding } = res.body.data;
    expect(onboarding.messages.at(-1).content).toBe(
      "Thanks, Asha! One more thing: what role are you aiming for, like Frontend developer or SDE?",
    );
    expect(onboarding.profile.goals).toEqual(["Get placed"]);
    expect(onboarding.progress.collected).toBe(4);
    expect(onboarding.completed).toBe(false);
  });

  it("saves nothing when the AI fails, so the student can just send again", async () => {
    fakeAi.fail();
    fakeAi.fail();
    fakeAi.fail();

    const res = await send("Final year BCA");

    expect(res.status).toBe(503);
    expect(res.body.error.code).toBe("AI_UNAVAILABLE");
    expect(db.prisma.aIConversation.updateMany).not.toHaveBeenCalled();
    expect(db.prisma.user.update).not.toHaveBeenCalled();
  });

  it("refuses new messages once onboarding is complete", async () => {
    db.state.user!.profile = { profileData: {}, onboardingCompletedAt: new Date() };
    const res = await send("hello again");
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("ONBOARDING_COMPLETE");
    expect(fakeAi.calls).toHaveLength(0);
  });

  it("completes without an AI call when the profile page already filled everything in", async () => {
    db.state.user!.profile = {
      profileData: {
        degree: "BCA",
        student_year: 3,
        skills: ["HTML"],
        target_role: "SDE",
        goals: ["Get placed"],
      },
      onboardingCompletedAt: null,
    };
    const res = await send("Hi, what now?");
    expect(res.status).toBe(200);
    expect(res.body.data.onboarding.completed).toBe(true);
    expect(res.body.data.user.onboarding_completed).toBe(true);
    expect(res.body.data.onboarding.messages.at(-1).content).toContain("skill checks are next");
    expect(fakeAi.calls).toHaveLength(0);
  });

  it("refuses a second message sent while the first is still being answered", async () => {
    await request(app).get("/api/v1/ai/onboarding").set(auth());
    // This request read the chat, then another turn was saved before it finished.
    const stale = { ...db.state.conversation! };
    db.state.conversation!.updatedAt = new Date(stale.updatedAt.getTime() + 1000);
    db.prisma.aIConversation.findFirst.mockResolvedValueOnce(stale);
    fakeAi.reply({ reply: "Which year?", extracted: { degree: "BCA" }, done: false });

    const res = await send("BCA");
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("ONBOARDING_BUSY");
    // Neither the other turn nor the profile was overwritten.
    expect(db.state.conversation!.messages).toHaveLength(1);
    expect(db.prisma.user.update).not.toHaveBeenCalled();
  });

  it("rejects an empty message", async () => {
    const res = await send("   ");
    expect(res.status).toBe(422);
  });

  it("requires a token", async () => {
    const res = await request(app).post("/api/v1/ai/onboarding/messages").send({ content: "hi" });
    expect(res.status).toBe(401);
  });
});
