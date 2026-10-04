import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const STUDENT_ID = "4b7a3c1e-2f0d-4a6b-9c8e-1d2f3a4b5c6d";
const ADMIN_ID = "9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d";
const Q1 = "11111111-1111-4111-8111-111111111111";
const Q2 = "22222222-2222-4222-8222-222222222222";
const PDF = "33333333-3333-4333-8333-333333333333";
const MISSING = "00000000-0000-4000-8000-000000000000";

// In-memory stand-ins for the question bank, progress rows and prep PDFs.
const db = vi.hoisted(() => {
  const now = new Date("2026-10-03T10:00:00.000Z");
  const skill = {
    id: "5c8b4d2f-3a1e-4b7c-8d9f-2e3a4b5c6d7e",
    slug: "sql",
    name: "SQL",
    isActive: true,
    isDeleted: false,
  };
  const question = (id: string, title: string, difficulty: string) => ({
    id,
    skillId: skill.id,
    title,
    body: "Explain it.",
    answer: "Because…",
    company: "TCS",
    role: "Data Analyst",
    topic: "Joins",
    difficulty,
    createdById: null,
    isActive: true,
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
    skill,
  });
  const state = {
    questions: [] as ReturnType<typeof question>[],
    progress: [] as {
      id: string;
      userId: string;
      questionId: string;
      bookmarked: boolean;
      bookmarkedAt?: Date | null;
      solvedAt: Date | null;
      updatedAt: Date;
    }[],
    pdf: null as null | Record<string, unknown>,
    lastWhere: null as unknown,
    lastPage: null as unknown,
    profileSkills: [] as unknown[],
  };
  const mine = (userId: string, questionId: string) =>
    state.progress.filter((p) => p.userId === userId && p.questionId === questionId);
  const withProgress = (q: ReturnType<typeof question>, userId: string) => ({
    ...q,
    progress: mine(userId, q.id),
  });
  // Reads the student id out of `include: { progress: { where: { userId } } }`.
  const userOf = (args: { include?: { progress?: { where?: { userId?: string } } } }) =>
    args.include?.progress?.where?.userId ?? "";

  return {
    state,
    reset() {
      state.questions = [
        question("11111111-1111-4111-8111-111111111111", "WHERE vs HAVING", "EASY"),
        question("22222222-2222-4222-8222-222222222222", "Window functions", "HARD"),
      ];
      state.progress = [];
      state.pdf = {
        id: "33333333-3333-4333-8333-333333333333",
        title: "SQL interview guide",
        description: null,
        skillId: null,
        role: null,
        company: null,
        fileUrl: "https://example.com/sql-guide.pdf",
        sizeLabel: "8 pages",
        downloads: 0,
        isActive: true,
        isDeleted: false,
        createdAt: now,
        updatedAt: now,
        skill: null,
      };
    },
    prisma: {
      // requireAuth reads the account's role on every request.
      user: {
        findUnique: vi.fn(async ({ where }) => ({
          role: where.id === "9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d" ? "ADMIN" : "STUDENT",
          isActive: true,
          isDeleted: false,
        })),
      },
      userProfile: {
        findUnique: vi.fn(async () => ({ profileData: { skills: state.profileSkills } })),
      },
      questionBank: {
        findMany: vi.fn(async (args) => {
          state.lastWhere = args.where;
          state.lastPage = { skip: args.skip, take: args.take };
          return state.questions.map((q) => withProgress(q, userOf(args)));
        }),
        count: vi.fn(async () => state.questions.length),
        findFirst: vi.fn(async (args) => {
          const w = args.where;
          const q = state.questions.find(
            (x) =>
              (w.id === undefined || x.id === w.id) &&
              (w.skillId === undefined || x.skillId === w.skillId) &&
              (w.title === undefined || x.title === w.title) &&
              x.isDeleted === (w.isDeleted ?? false),
          );
          return q ? withProgress(q, userOf(args)) : null;
        }),
        update: vi.fn(async ({ where, data }) => {
          const q = state.questions.find((x) => x.id === where.id)!;
          if (
            data.title !== undefined &&
            state.questions.some((x) => x.id !== q.id && x.title === data.title)
          ) {
            throw Object.assign(new Error("unique"), { code: "P2002" });
          }
          return Object.assign(q, data);
        }),
        create: vi.fn(async ({ data }) => {
          if (state.questions.some((q) => q.title === data.title)) {
            throw Object.assign(new Error("unique"), { code: "P2002" });
          }
          const row = { ...question(MISSING_ID, data.title, data.difficulty), ...data, skill };
          state.questions.push(row);
          return row;
        }),
        updateMany: vi.fn(async ({ where, data }) => {
          const q = state.questions.find((x) => x.id === where.id && !x.isDeleted);
          if (!q) return { count: 0 };
          Object.assign(q, data);
          return { count: 1 };
        }),
      },
      userQuestionProgress: {
        findUnique: vi.fn(
          async ({ where }) =>
            mine(where.userId_questionId.userId, where.userId_questionId.questionId)[0] ?? null,
        ),
        upsert: vi.fn(async ({ where, create, update }) => {
          const { userId, questionId } = where.userId_questionId;
          const existing = mine(userId, questionId)[0];
          if (existing) return Object.assign(existing, update, { updatedAt: new Date() });
          const row = {
            id: `p${state.progress.length}`,
            bookmarked: false,
            solvedAt: null,
            updatedAt: new Date(),
            ...create,
          };
          state.progress.push(row);
          return row;
        }),
        findMany: vi.fn(async ({ where, orderBy }) =>
          state.progress
            .filter((p) => p.userId === where.userId)
            .filter((p) => where.bookmarked === undefined || p.bookmarked === where.bookmarked)
            .sort((a, b) =>
              orderBy?.[0]?.bookmarkedAt
                ? (b.bookmarkedAt?.getTime() ?? 0) - (a.bookmarkedAt?.getTime() ?? 0)
                : 0,
            )
            .map((p) => ({
              ...p,
              question: withProgress(
                state.questions.find((q) => q.id === p.questionId)!,
                p.userId,
              ),
            })),
        ),
        count: vi.fn(async () => state.progress.filter((p) => p.bookmarked).length),
      },
      prepPdf: {
        create: vi.fn(async ({ data }) => ({ ...state.pdf, ...data })),
        findMany: vi.fn(async () => (state.pdf ? [state.pdf] : [])),
        findFirst: vi.fn(async ({ where }) =>
          state.pdf && where.id === state.pdf.id ? state.pdf : null,
        ),
        update: vi.fn(async ({ data }) => {
          state.pdf!.downloads = (state.pdf!.downloads as number) + data.downloads.increment;
          return state.pdf;
        }),
      },
      skill: {
        findFirst: vi.fn(async ({ where }) => (where.id === skill.id ? skill : null)),
      },
    },
  };
});
const MISSING_ID = "44444444-4444-4444-8444-444444444444";

vi.mock("../src/db/prisma.js", () => ({ prisma: db.prisma }));
vi.mock("../src/modules/dashboard/dashboard.service.js", () => ({
  getDashboard: vi.fn(async () => ({
    readiness: {
      history: [{ date: "2026-09-30T10:00:00.000Z", score: 41, skill: "SQL", percent: 41 }],
    },
  })),
  getInsight: vi.fn(),
}));

const { createApp } = await import("../src/app.js");
const { signAccessToken } = await import("../src/modules/auth/tokens.js");
const logic = await import("../src/modules/questions/questions.logic.js");

const app = createApp();
const student = { Authorization: `Bearer ${signAccessToken(STUDENT_ID, "STUDENT")}` };
const admin = { Authorization: `Bearer ${signAccessToken(ADMIN_ID, "ADMIN")}` };

beforeEach(() => {
  vi.clearAllMocks();
  db.reset();
});

describe("question bank rules", () => {
  it("combines every filter given with AND", () => {
    const where = logic.buildWhere(
      {
        skill: "sql",
        company: "TCS",
        role: "Data Analyst",
        topic: "joins",
        difficulty: "EASY",
        q: "having",
      },
      STUDENT_ID,
    );
    expect(where.AND).toEqual(
      expect.arrayContaining([
        { skill: { slug: "sql" } },
        { company: "TCS" },
        { role: "Data Analyst" },
        { topic: { equals: "joins", mode: "insensitive" } },
        { difficulty: "EASY" },
        expect.objectContaining({ OR: expect.any(Array) }),
      ]),
    );
    // Only live questions in live skills, always.
    expect(where.AND[0]).toEqual({
      isActive: true,
      isDeleted: false,
      skill: { isActive: true, isDeleted: false },
    });
  });

  it("filters by the student's own progress", () => {
    expect(logic.buildWhere({ status: "bookmarked" }, STUDENT_ID).AND).toContainEqual({
      progress: { some: { userId: STUDENT_ID, bookmarked: true } },
    });
    expect(logic.buildWhere({ status: "unsolved" }, STUDENT_ID).AND).toContainEqual({
      NOT: { progress: { some: { userId: STUDENT_ID, solvedAt: { not: null } } } },
    });
  });

  it("starts weeks on Monday in India time", () => {
    // Sunday 23:30 IST belongs to the week before Monday 00:30 IST.
    const sunday = new Date("2026-10-04T18:00:00.000Z"); // Sun 23:30 IST
    const monday = new Date("2026-10-04T19:00:00.000Z"); // Mon 00:30 IST
    expect(logic.startOfIndianWeek(sunday).toISOString()).toBe("2026-09-27T18:30:00.000Z");
    expect(logic.startOfIndianWeek(monday).toISOString()).toBe("2026-10-04T18:30:00.000Z");
  });

  it("buckets solves per week with a running total, including empty weeks", () => {
    expect(logic.solvedByWeek([], new Date())).toEqual([]);
    const now = new Date("2026-10-15T06:00:00.000Z"); // Thu, week of Mon 12 Oct
    expect(logic.solvedByWeek([new Date("2026-10-14T06:00:00.000Z")], now)).toEqual([
      { week_start: "2026-10-12", solved: 1, total_solved: 1 },
    ]);
    const weeks = logic.solvedByWeek(
      [
        new Date("2026-09-29T06:00:00.000Z"), // week of 28 Sep
        new Date("2026-09-30T06:00:00.000Z"),
        new Date("2026-10-13T06:00:00.000Z"), // week of 12 Oct
      ],
      now,
    );
    expect(weeks).toEqual([
      { week_start: "2026-09-28", solved: 2, total_solved: 2 },
      { week_start: "2026-10-05", solved: 0, total_solved: 2 },
      { week_start: "2026-10-12", solved: 1, total_solved: 3 },
    ]);
  });

  it("keeps the chart to the latest 26 weeks", () => {
    const now = new Date("2026-10-15T06:00:00.000Z");
    const yearAgo = new Date("2025-10-15T06:00:00.000Z");
    const weeks = logic.solvedByWeek([yearAgo], now);
    expect(weeks).toHaveLength(26);
    expect(weeks.at(-1)!.total_solved).toBe(1);
  });
});

describe("browsing questions", () => {
  it("returns a page with the student's own bookmark/solved flags", async () => {
    db.state.progress.push({
      id: "p0",
      userId: STUDENT_ID,
      questionId: Q1,
      bookmarked: true,
      solvedAt: new Date(),
      updatedAt: new Date(),
    });
    const res = await request(app)
      .get("/api/v1/questions?skill=sql&company=TCS&page=2&limit=1")
      .set(student);
    expect(res.status).toBe(200);
    expect(res.body.meta).toEqual({ page: 2, limit: 1, total: 2 });
    expect(db.state.lastPage).toEqual({ skip: 1, take: 1 });
    expect(res.body.data[0]).toMatchObject({
      id: Q1,
      difficulty: "easy",
      skill: { slug: "sql", name: "SQL" },
      bookmarked: true,
      solved: true,
    });
    expect(res.body.data[1]).toMatchObject({ id: Q2, bookmarked: false, solved: false });
  });

  it("rejects companies and roles outside the fixed lists", async () => {
    const res = await request(app).get("/api/v1/questions?company=Tata%20Consultancy").set(student);
    expect(res.status).toBe(422);
  });

  it("shows one question with its model answer, and 404s a missing one", async () => {
    const res = await request(app).get(`/api/v1/questions/${Q2}`).set(student);
    expect(res.body.data).toMatchObject({ title: "Window functions", answer: "Because…" });
    expect((await request(app).get(`/api/v1/questions/${MISSING}`).set(student)).status).toBe(404);
  });
});

describe("bookmarking and solving", () => {
  it("never duplicates: bookmarking twice keeps one row", async () => {
    await request(app).post(`/api/v1/questions/${Q1}/bookmark`).set(student);
    const res = await request(app).post(`/api/v1/questions/${Q1}/bookmark`).set(student);
    expect(res.body.data).toEqual({ bookmarked: true, solved: false, solved_at: null });
    expect(db.state.progress).toHaveLength(1);

    const removed = await request(app).delete(`/api/v1/questions/${Q1}/bookmark`).set(student);
    expect(removed.body.data.bookmarked).toBe(false);
    expect(db.state.progress).toHaveLength(1);
  });

  it("keeps the first solved date when solving again, and can undo", async () => {
    const first = await request(app).post(`/api/v1/questions/${Q1}/solve`).set(student);
    const solvedAt = first.body.data.solved_at;
    expect(solvedAt).toEqual(expect.any(String));
    const again = await request(app).post(`/api/v1/questions/${Q1}/solve`).set(student);
    expect(again.body.data.solved_at).toBe(solvedAt);
    expect(db.state.progress).toHaveLength(1);

    const undone = await request(app).delete(`/api/v1/questions/${Q1}/solve`).set(student);
    expect(undone.body.data).toMatchObject({ solved: false, solved_at: null });
  });

  it("un-bookmarking something never bookmarked is fine", async () => {
    const res = await request(app).delete(`/api/v1/questions/${Q2}/bookmark`).set(student);
    expect(res.status).toBe(200);
    expect(res.body.data.bookmarked).toBe(false);
  });

  it("orders My bookmarks by when they were bookmarked; solving doesn't reorder", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    try {
      vi.setSystemTime(new Date("2026-10-03T10:00:00.000Z"));
      await request(app).post(`/api/v1/questions/${Q1}/bookmark`).set(student);
      vi.setSystemTime(new Date("2026-10-03T10:05:00.000Z"));
      await request(app).post(`/api/v1/questions/${Q2}/bookmark`).set(student);
      vi.setSystemTime(new Date("2026-10-03T10:10:00.000Z"));
      await request(app).post(`/api/v1/questions/${Q1}/solve`).set(student);
      // Bookmarking again keeps its place.
      await request(app).post(`/api/v1/questions/${Q1}/bookmark`).set(student);
    } finally {
      vi.useRealTimers();
    }
    const res = await request(app).get("/api/v1/questions/bookmarks").set(student);
    expect(res.body.data.map((q: { id: string }) => q.id)).toEqual([Q2, Q1]);
    expect(db.prisma.userQuestionProgress.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({
        orderBy: [{ bookmarkedAt: { sort: "desc", nulls: "last" } }, { id: "asc" }],
      }),
    );

    // Removing clears the date; bookmarking again puts it on top.
    await request(app).delete(`/api/v1/questions/${Q1}/bookmark`).set(student);
    expect(db.state.progress.find((p) => p.questionId === Q1)!.bookmarkedAt).toBeNull();
    await request(app).post(`/api/v1/questions/${Q1}/bookmark`).set(student);
    const again = await request(app).get("/api/v1/questions/bookmarks").set(student);
    expect(again.body.data.map((q: { id: string }) => q.id)).toEqual([Q1, Q2]);
  });

  it("404s progress on a missing question", async () => {
    const res = await request(app).post(`/api/v1/questions/${MISSING}/solve`).set(student);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("QUESTION_NOT_FOUND");
  });
});

describe("progress and prep guides", () => {
  it("returns readiness history and solved counts ready to chart", async () => {
    await request(app).post(`/api/v1/questions/${Q1}/solve`).set(student);
    await request(app).post(`/api/v1/questions/${Q2}/bookmark`).set(student);
    const res = await request(app).get("/api/v1/progress").set(student);
    expect(res.body.data.readiness).toEqual([{ date: "2026-09-30T10:00:00.000Z", score: 41 }]);
    expect(res.body.data.solved_by_week).toHaveLength(1);
    expect(res.body.data.solved_by_week[0]).toMatchObject({ solved: 1, total_solved: 1 });
    expect(res.body.data.totals).toMatchObject({
      solved: 1,
      bookmarked: 1,
      by_skill: [{ slug: "sql", solved: 1 }],
    });
  });

  it("counts a guide download once a day per student and returns its link", async () => {
    const res = await request(app).post(`/api/v1/prep-pdfs/${PDF}/download`).set(student);
    expect(res.body.data).toEqual({ url: "https://example.com/sql-guide.pdf" });
    expect(db.state.pdf!.downloads).toBe(1);
    const again = await request(app).post(`/api/v1/prep-pdfs/${PDF}/download`).set(student);
    expect(again.body.data.url).toBe("https://example.com/sql-guide.pdf");
    expect(db.state.pdf!.downloads).toBe(1);
    expect(
      (await request(app).post(`/api/v1/prep-pdfs/${MISSING}/download`).set(student)).status,
    ).toBe(404);
  });
});

describe("who can do what", () => {
  it("students get 403 on every admin question and guide route", async () => {
    const calls = [
      request(app).get("/api/v1/admin/questions"),
      request(app).post("/api/v1/admin/questions").send({}),
      request(app).patch(`/api/v1/admin/questions/${Q1}`).send({ title: "Changed title" }),
      request(app).delete(`/api/v1/admin/questions/${Q1}`),
      request(app).get("/api/v1/admin/question-taxonomy"),
      request(app).get("/api/v1/admin/prep-pdfs"),
      request(app).post("/api/v1/admin/prep-pdfs").send({}),
      request(app).patch(`/api/v1/admin/prep-pdfs/${PDF}`).send({ title: "Changed" }),
      request(app).delete(`/api/v1/admin/prep-pdfs/${PDF}`),
    ];
    for (const call of calls) expect((await call.set(student)).status).toBe(403);
  });

  it("the question bank is for students, and needs a token", async () => {
    expect((await request(app).get("/api/v1/questions").set(admin)).status).toBe(403);
    expect((await request(app).get("/api/v1/questions")).status).toBe(401);
  });

  it("admins add questions (409 on a duplicate title) and soft-delete them", async () => {
    const input = {
      skill_id: "5c8b4d2f-3a1e-4b7c-8d9f-2e3a4b5c6d7e",
      title: "Explain normalisation",
      body: "What is 3NF and why does it matter?",
      topic: "Normalisation",
      difficulty: "medium",
      company: "Infosys",
    };
    const created = await request(app).post("/api/v1/admin/questions").set(admin).send(input);
    expect(created.status).toBe(201);
    expect(created.body.data).toMatchObject({ title: "Explain normalisation", company: "Infosys" });
    expect(db.prisma.questionBank.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ createdById: ADMIN_ID }) }),
    );

    const duplicate = await request(app).post("/api/v1/admin/questions").set(admin).send(input);
    expect(duplicate.status).toBe(409);
    expect(duplicate.body.error.code).toBe("QUESTION_EXISTS");

    const removed = await request(app).delete(`/api/v1/admin/questions/${Q1}`).set(admin);
    expect(removed.body.data).toEqual({ id: Q1, deleted: true });
    expect(db.state.questions.find((q) => q.id === Q1)).toMatchObject({
      isDeleted: true,
      isActive: false,
    });
  });

  it("brings back a deleted question when one with the same title is added", async () => {
    const q1 = db.state.questions.find((q) => q.id === Q1)!;
    Object.assign(q1, { isDeleted: true, isActive: false });
    const res = await request(app).post("/api/v1/admin/questions").set(admin).send({
      skill_id: "5c8b4d2f-3a1e-4b7c-8d9f-2e3a4b5c6d7e",
      title: "WHERE vs HAVING",
      body: "Rewritten: when do you use each?",
      topic: "Aggregation",
      difficulty: "medium",
    });
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ id: Q1, topic: "Aggregation", is_active: true });
    expect(q1).toMatchObject({ isDeleted: false, body: "Rewritten: when do you use each?" });
    expect(db.prisma.questionBank.create).not.toHaveBeenCalled();
  });

  it("moves a deleted question's title aside when another is renamed onto it", async () => {
    const q1 = db.state.questions.find((q) => q.id === Q1)!;
    Object.assign(q1, { isDeleted: true, isActive: false });
    const res = await request(app)
      .patch(`/api/v1/admin/questions/${Q2}`)
      .set(admin)
      .send({ title: "WHERE vs HAVING" });
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ id: Q2, title: "WHERE vs HAVING" });
    expect(q1.title).toBe("WHERE vs HAVING [deleted 11111111]");
  });

  it("reads include_inactive=false as false", async () => {
    await request(app).get("/api/v1/admin/questions?include_inactive=false").set(admin);
    expect(db.state.lastWhere).toMatchObject({ isActive: true });
    await request(app).get("/api/v1/admin/questions").set(admin);
    expect(db.state.lastWhere).not.toHaveProperty("isActive");
    const bad = await request(app).get("/api/v1/admin/questions?include_inactive=yes").set(admin);
    expect(bad.status).toBe(422);
  });

  it("mine=true keeps only the skills on the student's profile", async () => {
    // Free text from the profile: an alias, a stack, and something not in the catalogue.
    db.state.profileSkills = ["JS", "MERN stack", "Pottery", 42];
    const res = await request(app).get("/api/v1/questions?mine=true").set(student);
    expect(res.status).toBe(200);
    const where = db.state.lastWhere as { AND: Record<string, unknown>[] };
    const bySkills = where.AND.find((c) => (c.skill as { slug?: { in?: string[] } })?.slug?.in) as {
      skill: { slug: { in: string[] } };
    };
    expect(bySkills.skill.slug.in).toEqual(
      expect.arrayContaining(["javascript", "mongodb", "react", "nodejs"]),
    );
    expect(bySkills.skill.slug.in).not.toContain("pottery");

    // No skills on the profile: nothing matches, rather than everything.
    db.state.profileSkills = [];
    await request(app).get("/api/v1/questions?mine=true").set(student);
    expect(db.state.lastWhere).toMatchObject({
      AND: expect.arrayContaining([{ skill: { slug: { in: [] } } }]),
    });

    // Off by default; any other value is rejected.
    await request(app).get("/api/v1/questions").set(student);
    expect(JSON.stringify(db.state.lastWhere)).not.toContain('"in"');
    const bad = await request(app).get("/api/v1/questions?mine=yes").set(student);
    expect(bad.status).toBe(422);
  });

  it("pages questions with a stable order", async () => {
    await request(app).get("/api/v1/questions").set(student);
    expect(db.prisma.questionBank.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({
        orderBy: [{ difficulty: "asc" }, { title: "asc" }, { id: "asc" }],
      }),
    );
  });

  it("only accepts https links for prep guides", async () => {
    const guide = { title: "Aptitude guide", file_url: "https://cdn.example.com/apt.pdf" };
    const ok = await request(app).post("/api/v1/admin/prep-pdfs").set(admin).send(guide);
    expect(ok.status).toBe(201);
    for (const file_url of [
      "javascript:alert(document.cookie)",
      "http://example.com/apt.pdf",
      "data:text/html,<script>alert(1)</script>",
    ]) {
      const created = await request(app)
        .post("/api/v1/admin/prep-pdfs")
        .set(admin)
        .send({ ...guide, file_url });
      expect(created.status).toBe(422);
      const patched = await request(app)
        .patch(`/api/v1/admin/prep-pdfs/${PDF}`)
        .set(admin)
        .send({ file_url });
      expect(patched.status).toBe(422);
    }
  });
});
