import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const STUDENT_ID = "4b7a3c1e-2f0d-4a6b-9c8e-1d2f3a4b5c6d";
const OTHER_ID = "7c6b5a49-3827-4615-8a4b-3c2d1e0f9a8b";
const ADMIN_ID = "9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d";
const MISSING = "00000000-0000-4000-8000-000000000000";

// In-memory feedback, images and notifications.
const db = vi.hoisted(() => {
  // The team inbox; read by config/env.ts when the app is imported below.
  process.env.FEEDBACK_EMAIL = "team@prepsuccess.test";

  type Image = { id: string; feedbackId: string; mime: string; size: number; data: Uint8Array };
  type Row = {
    id: string;
    userId: string;
    category: string;
    message: string;
    page: string | null;
    status: string;
    adminRemark: string | null;
    remarkedById: string | null;
    resolvedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  };
  const users: Record<string, { firstName: string; lastName: string | null; email: string }> = {
    "4b7a3c1e-2f0d-4a6b-9c8e-1d2f3a4b5c6d": {
      firstName: "Asha",
      lastName: "Rao",
      email: "asha@college.edu",
    },
    "7c6b5a49-3827-4615-8a4b-3c2d1e0f9a8b": {
      firstName: "Ravi",
      lastName: null,
      email: "ravi@college.edu",
    },
    "9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d": {
      firstName: "Admin",
      lastName: null,
      email: "admin@prepsuccess.test",
    },
  };
  const state = {
    feedback: [] as Row[],
    images: [] as Image[],
    notifications: [] as { userId: string; type: string; title: string; body: string | null }[],
    seq: 0,
  };
  const uuid = () => `aaaaaaaa-aaaa-4aaa-8aaa-${String(++state.seq).padStart(12, "0")}`;

  // Just enough of Prisma's where for the queries the service makes.
  type Where = Record<string, unknown> & {
    OR?: { message?: { contains: string }; user?: Record<string, { contains: string }> }[];
  };
  const matches = (row: Row, where: Where = {}) => {
    if (where.id && row.id !== where.id) return false;
    if (where.userId && row.userId !== where.userId) return false;
    if (where.status && row.status !== where.status) return false;
    if (where.category && row.category !== where.category) return false;
    const since = (where.createdAt as { gte?: Date } | undefined)?.gte;
    if (since && row.createdAt < since) return false;
    if (where.OR) {
      const user = users[row.userId]!;
      const hit = where.OR.some((clause) => {
        const [field, cond] = clause.message
          ? [row.message, clause.message]
          : (() => {
              const [key, value] = Object.entries(clause.user!)[0]!;
              return [(user as Record<string, string | null>)[key] ?? "", value];
            })();
        return field.toLowerCase().includes(cond.contains.toLowerCase());
      });
      if (!hit) return false;
    }
    return true;
  };
  const withIncludes = (row: Row, include: Record<string, unknown> = {}) => ({
    ...row,
    images: state.images
      .filter((image) => image.feedbackId === row.id)
      .map(({ id, mime, size }) => ({ id, mime, size })),
    ...(include.user ? { user: { id: row.userId, ...users[row.userId]! } } : {}),
    ...(include.remarkedBy
      ? {
          remarkedBy: row.remarkedById
            ? { id: row.remarkedById, firstName: users[row.remarkedById]!.firstName }
            : null,
        }
      : {}),
  });

  return {
    state,
    reset() {
      state.feedback = [];
      state.images = [];
      state.notifications = [];
      state.seq = 0;
    },
    /** Adds a saved row directly, for the read and admin tests. */
    seed(row: Partial<Row> & { userId: string }) {
      const now = new Date();
      const full: Row = {
        id: uuid(),
        category: "BUG",
        message: "The timer resets when I switch tabs.",
        page: "/questions",
        status: "OPEN",
        adminRemark: null,
        remarkedById: null,
        resolvedAt: null,
        createdAt: now,
        updatedAt: now,
        ...row,
      };
      state.feedback.push(full);
      return full;
    },
    seedImage(feedbackId: string) {
      const data = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3]);
      const image = { id: uuid(), feedbackId, mime: "image/png", size: data.length, data };
      state.images.push(image);
      return image;
    },
    prisma: {
      // requireAuth reads the role; the email reads the student's name.
      user: {
        findUnique: vi.fn(async ({ where }) => ({
          role: where.id === "9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d" ? "ADMIN" : "STUDENT",
          isActive: true,
          isDeleted: false,
          ...users[where.id],
        })),
      },
      feedback: {
        count: vi.fn(async ({ where }) => state.feedback.filter((r) => matches(r, where)).length),
        create: vi.fn(async ({ data, include }) => {
          const { images, ...fields } = data;
          const now = new Date();
          const row: Row = {
            id: uuid(),
            page: null,
            status: "OPEN",
            adminRemark: null,
            remarkedById: null,
            resolvedAt: null,
            createdAt: now,
            updatedAt: now,
            ...fields,
          };
          state.feedback.push(row);
          for (const image of images.create) {
            state.images.push({ id: uuid(), feedbackId: row.id, ...image });
          }
          return withIncludes(row, include);
        }),
        findMany: vi.fn(async ({ where, include, skip, take }) =>
          state.feedback
            .filter((r) => matches(r, where))
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(skip, skip + take)
            .map((r) => withIncludes(r, include)),
        ),
        findUnique: vi.fn(async ({ where, include }) => {
          const row = state.feedback.find((r) => r.id === where.id);
          return row ? withIncludes(row, include) : null;
        }),
        update: vi.fn(async ({ where, data, include }) => {
          const row = state.feedback.find((r) => r.id === where.id)!;
          Object.assign(row, data, { updatedAt: new Date() });
          return withIncludes(row, include);
        }),
        groupBy: vi.fn(async () => {
          const counts = new Map<string, number>();
          for (const r of state.feedback) counts.set(r.status, (counts.get(r.status) ?? 0) + 1);
          return [...counts].map(([status, n]) => ({ status, _count: { _all: n } }));
        }),
      },
      feedbackImage: {
        findFirst: vi.fn(async ({ where }) => {
          const image = state.images.find(
            (i) => i.id === where.id && i.feedbackId === where.feedbackId,
          );
          if (!image) return null;
          const owner = state.feedback.find((r) => r.id === image.feedbackId)?.userId;
          if (where.feedback?.userId && where.feedback.userId !== owner) return null;
          return image;
        }),
      },
      notification: {
        create: vi.fn(async ({ data }) => {
          state.notifications.push(data);
          return data;
        }),
      },
    },
  };
});

const mail = vi.hoisted(() => ({ fail: false }));

vi.mock("../src/db/prisma.js", () => ({ prisma: db.prisma }));
vi.mock("../src/services/email/email.service.js", () => ({
  sendOtpEmail: vi.fn(),
  sendFeedbackEmail: vi.fn(async () => {
    if (mail.fail) throw new Error("SMTP down");
  }),
}));

const { createApp } = await import("../src/app.js");
const { signAccessToken } = await import("../src/modules/auth/tokens.js");
const { sendFeedbackEmail } = await import("../src/services/email/email.service.js");
const logic = await import("../src/modules/feedback/feedback.logic.js");

const app = createApp();
const student = { Authorization: `Bearer ${signAccessToken(STUDENT_ID, "STUDENT")}` };
const other = { Authorization: `Bearer ${signAccessToken(OTHER_ID, "STUDENT")}` };
const admin = { Authorization: `Bearer ${signAccessToken(ADMIN_ID, "ADMIN")}` };

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13]);
const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 16, 0x4a, 0x46]);
const WEBP = Buffer.concat([
  Buffer.from("RIFF"),
  Buffer.from([36, 0, 0, 0]),
  Buffer.from("WEBPVP8 "),
]);
const GIF = Buffer.from("GIF89a\x01\x00\x01\x00");
const SVG = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>');
const dataUrl = (mime: string, bytes: Buffer) => `data:${mime};base64,${bytes.toString("base64")}`;

const valid = {
  category: "bug",
  message: "The timer resets when I switch tabs.",
  page: "/questions/abc",
};
const submit = (body: object, headers = student) =>
  request(app).post("/api/v1/feedback").set(headers).send(body);

beforeEach(() => {
  vi.clearAllMocks();
  db.reset();
  mail.fail = false;
});

describe("feedback image rules", () => {
  it("parses base64 data URLs for the allowed types only", () => {
    expect(logic.parseDataUrl(dataUrl("image/png", PNG))).toEqual({
      declared: "image/png",
      bytes: PNG,
    });
    expect(logic.parseDataUrl(dataUrl("image/gif", GIF))).toBeNull();
    expect(logic.parseDataUrl(dataUrl("image/svg+xml", SVG))).toBeNull();
    expect(logic.parseDataUrl("data:image/png;base64,not*base64!")).toBeNull();
    expect(logic.parseDataUrl("data:image/png;base64,abc")).toBeNull(); // bad length
    expect(logic.parseDataUrl(PNG.toString("base64"))).toBeNull(); // no header
  });

  it("detects the real type from magic bytes", () => {
    expect(logic.detectImageMime(PNG)).toBe("image/png");
    expect(logic.detectImageMime(JPEG)).toBe("image/jpeg");
    expect(logic.detectImageMime(WEBP)).toBe("image/webp");
    expect(logic.detectImageMime(GIF)).toBeNull();
    expect(logic.detectImageMime(SVG)).toBeNull();
    expect(logic.detectImageMime(Buffer.from("hello world"))).toBeNull();
    expect(logic.detectImageMime(Buffer.from("RIFF"))).toBeNull(); // truncated
  });

  it("stores the detected type, not the declared one", () => {
    const decoded = logic.decodeImage(dataUrl("image/png", JPEG));
    expect(decoded).toMatchObject({ ok: true, mime: "image/jpeg" });
  });

  it("rejects spoofed, empty and oversized images", () => {
    expect(logic.decodeImage(dataUrl("image/png", GIF)).ok).toBe(false);
    expect(logic.decodeImage(dataUrl("image/jpeg", Buffer.from("plain text"))).ok).toBe(false);
    expect(logic.decodeImage("data:image/png;base64,").ok).toBe(false);
    const big = Buffer.concat([PNG, Buffer.alloc(logic.IMAGE_MAX_BYTES)]);
    expect(logic.decodeImage(dataUrl("image/png", big))).toEqual({
      ok: false,
      message: "Each image must be 2 MB or smaller.",
    });
    const limit = Buffer.concat([PNG, Buffer.alloc(logic.IMAGE_MAX_BYTES - PNG.length)]);
    expect(logic.decodeImage(dataUrl("image/png", limit)).ok).toBe(true);
  });

  it("keeps only same-app paths", () => {
    expect(logic.cleanPage(" /questions?skill=sql ")).toBe("/questions?skill=sql");
    expect(logic.cleanPage("https://evil.example")).toBeNull();
    expect(logic.cleanPage("//evil.example")).toBeNull();
    expect(logic.cleanPage(`/${"a".repeat(300)}`)).toBeNull();
    expect(logic.cleanPage(null)).toBeNull();
  });

  it("names attachments and picks the inbox", () => {
    expect(logic.attachmentName("My shot.PNG", 0, "image/png")).toBe("My-shot.png");
    expect(logic.attachmentName(undefined, 1, "image/jpeg")).toBe("feedback-2.jpg");
    expect(logic.feedbackRecipient("team@x.com", "smtp@x.com")).toBe("team@x.com");
    expect(logic.feedbackRecipient(undefined, "smtp@x.com")).toBe("smtp@x.com");
    expect(logic.feedbackRecipient(undefined, "")).toBeNull();
  });
});

describe("POST /api/v1/feedback", () => {
  it("needs a signed-in student", async () => {
    expect((await request(app).post("/api/v1/feedback").send(valid)).status).toBe(401);
    // Admins use the admin panel, like every other student-only route.
    expect((await submit(valid, admin)).status).toBe(403);
  });

  it("validates the message, image count and images", async () => {
    expect((await submit({ ...valid, message: "  too short " })).status).toBe(422);
    expect((await submit({ ...valid, category: "praise" })).status).toBe(422);

    const four = Array.from({ length: 4 }, () => ({ data: dataUrl("image/png", PNG) }));
    expect((await submit({ ...valid, images: four })).status).toBe(422);

    const bad = await submit({
      ...valid,
      images: [{ data: dataUrl("image/png", PNG) }, { data: "data:image/png;base64,%%%" }],
    });
    expect(bad.status).toBe(422);
    expect(bad.body.error.details[0].path).toEqual(["images", 1]);

    // Declared PNG, really a GIF / an SVG.
    for (const bytes of [GIF, SVG]) {
      const spoofed = await submit({ ...valid, images: [{ data: dataUrl("image/png", bytes) }] });
      expect(spoofed.status).toBe(422);
      expect(spoofed.body.error.details[0].path).toEqual(["images", 0]);
    }
    expect(db.prisma.feedback.create).not.toHaveBeenCalled();
  });

  it("saves the feedback with its images and returns the contract shape", async () => {
    const res = await submit({
      ...valid,
      category: "content",
      images: [
        { name: "error.png", data: dataUrl("image/png", PNG) },
        { data: dataUrl("image/webp", WEBP) },
      ],
    });
    expect(res.status).toBe(201);
    const id = res.body.data.id;
    expect(res.body.data).toEqual({
      id,
      category: "content",
      message: valid.message,
      page: "/questions/abc",
      status: "open",
      admin_remark: null,
      resolved_at: null,
      created_at: expect.any(String),
      updated_at: expect.any(String),
      images: [
        {
          id: expect.any(String),
          mime: "image/png",
          size: PNG.length,
          url: expect.stringMatching(new RegExp(`^/api/v1/feedback/${id}/images/[\\w-]+$`)),
        },
        expect.objectContaining({ mime: "image/webp", size: WEBP.length }),
      ],
    });
    // One nested create: the feedback and its images in a single transaction.
    expect(db.prisma.feedback.create).toHaveBeenCalledTimes(1);
    expect(db.state.images).toHaveLength(2);
    expect(Buffer.from(db.state.images[0]!.data)).toEqual(PNG);
  });

  it("drops a page that isn't an app path", async () => {
    const res = await submit({ ...valid, page: "https://evil.example/x" });
    expect(res.status).toBe(201);
    expect(res.body.data.page).toBeNull();
  });

  it("emails the team with the screenshots attached", async () => {
    const res = await submit({
      ...valid,
      images: [
        { name: "error.png", data: dataUrl("image/png", PNG) },
        { data: dataUrl("image/jpeg", JPEG) },
      ],
    });
    await vi.waitFor(() => expect(sendFeedbackEmail).toHaveBeenCalledTimes(1));
    expect(sendFeedbackEmail).toHaveBeenCalledWith({
      to: "team@prepsuccess.test",
      id: res.body.data.id,
      category: "Bug",
      message: valid.message,
      page: "/questions/abc",
      student: { name: "Asha Rao", email: "asha@college.edu" },
      submittedAt: expect.any(Date),
      images: [
        { filename: "error.png", mime: "image/png", data: PNG },
        { filename: "feedback-2.jpg", mime: "image/jpeg", data: JPEG },
      ],
    });
  });

  it("still succeeds when the email fails", async () => {
    mail.fail = true;
    const res = await submit(valid);
    expect(res.status).toBe(201);
    await vi.waitFor(() => expect(sendFeedbackEmail).toHaveBeenCalled());
    expect(db.state.feedback).toHaveLength(1);
  });

  it("allows 5 reports an hour per student", async () => {
    for (let i = 0; i < 5; i++) expect((await submit(valid)).status).toBe(201);
    const sixth = await submit(valid);
    expect(sixth.status).toBe(429);
    expect(sixth.body.error.code).toBe("TOO_MANY_REQUESTS");
    // Another student isn't affected, and older reports don't count.
    expect((await submit(valid, other)).status).toBe(201);
    for (const row of db.state.feedback) row.createdAt = new Date(Date.now() - 61 * 60_000);
    expect((await submit(valid)).status).toBe(201);
  });
});

describe("GET /api/v1/feedback/mine", () => {
  it("returns only the student's own feedback, newest first, paginated", async () => {
    const older = db.seed({ userId: STUDENT_ID, createdAt: new Date("2026-10-01T10:00:00Z") });
    const newer = db.seed({ userId: STUDENT_ID, createdAt: new Date("2026-10-02T10:00:00Z") });
    db.seed({ userId: OTHER_ID });

    const res = await request(app).get("/api/v1/feedback/mine").set(student);
    expect(res.status).toBe(200);
    expect(res.body.data.map((f: { id: string }) => f.id)).toEqual([newer.id, older.id]);
    expect(res.body.meta).toEqual({ page: 1, limit: 10, total: 2 });

    const page = await request(app).get("/api/v1/feedback/mine?page=2&limit=1").set(student);
    expect(page.body.data.map((f: { id: string }) => f.id)).toEqual([older.id]);
    expect((await request(app).get("/api/v1/feedback/mine?limit=51").set(student)).status).toBe(
      422,
    );
  });
});

describe("GET /api/v1/feedback/:id/images/:imageId", () => {
  const url = (feedbackId: string, imageId: string) =>
    `/api/v1/feedback/${feedbackId}/images/${imageId}`;

  it("serves the bytes to the owner with safe headers", async () => {
    const row = db.seed({ userId: STUDENT_ID });
    const image = db.seedImage(row.id);
    const res = await request(app).get(url(row.id, image.id)).set(student);
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toBe("image/png");
    expect(res.headers["content-length"]).toBe(String(image.size));
    expect(res.headers["cache-control"]).toBe("private, max-age=3600");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["content-disposition"]).toBe("inline");
    expect(Buffer.from(res.body)).toEqual(Buffer.from(image.data));
  });

  it("serves admins, and 404s for anyone else", async () => {
    const row = db.seed({ userId: STUDENT_ID });
    const image = db.seedImage(row.id);
    expect((await request(app).get(url(row.id, image.id)).set(admin)).status).toBe(200);

    const res = await request(app).get(url(row.id, image.id)).set(other);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("IMAGE_NOT_FOUND");
    expect((await request(app).get(url(MISSING, image.id)).set(student)).status).toBe(404);
    expect((await request(app).get(url(row.id, image.id))).status).toBe(401);
  });
});

describe("admin feedback", () => {
  const patch = (id: string, body: object, headers = admin) =>
    request(app).patch(`/api/v1/admin/feedback/${id}`).set(headers).send(body);

  it("is admin-only", async () => {
    expect((await request(app).get("/api/v1/admin/feedback").set(student)).status).toBe(403);
    expect((await request(app).get("/api/v1/admin/feedback/summary").set(student)).status).toBe(
      403,
    );
    const row = db.seed({ userId: STUDENT_ID });
    expect((await patch(row.id, { status: "solved" }, student)).status).toBe(403);
  });

  it("lists with filters and search, with the student and images", async () => {
    const bug = db.seed({ userId: STUDENT_ID, category: "BUG" });
    db.seedImage(bug.id);
    db.seed({ userId: OTHER_ID, category: "IDEA", status: "SOLVED", message: "Add dark mode!!" });

    const res = await request(app).get("/api/v1/admin/feedback?status=open").set(admin);
    expect(res.status).toBe(200);
    expect(res.body.meta).toEqual({ page: 1, limit: 20, total: 1 });
    expect(res.body.data[0]).toMatchObject({
      id: bug.id,
      status: "open",
      user: { id: STUDENT_ID, first_name: "Asha", last_name: "Rao", email: "asha@college.edu" },
      remarked_by: null,
      images: [expect.objectContaining({ mime: "image/png" })],
    });

    const ideas = await request(app).get("/api/v1/admin/feedback?category=idea").set(admin);
    expect(ideas.body.data).toHaveLength(1);
    const search = await request(app).get("/api/v1/admin/feedback?q=RAVI").set(admin);
    expect(search.body.data.map((f: { user: { id: string } }) => f.user.id)).toEqual([OTHER_ID]);
    const text = await request(app).get("/api/v1/admin/feedback?q=dark").set(admin);
    expect(text.body.meta.total).toBe(1);
    expect((await request(app).get("/api/v1/admin/feedback?status=closed").set(admin)).status).toBe(
      422,
    );
  });

  it("counts by status", async () => {
    db.seed({ userId: STUDENT_ID });
    db.seed({ userId: STUDENT_ID });
    db.seed({ userId: OTHER_ID, status: "SOLVED" });
    const res = await request(app).get("/api/v1/admin/feedback/summary").set(admin);
    expect(res.body.data).toEqual({ open: 2, in_progress: 0, solved: 1 });
  });

  it("gets one, or 404", async () => {
    const row = db.seed({ userId: STUDENT_ID });
    const res = await request(app).get(`/api/v1/admin/feedback/${row.id}`).set(admin);
    expect(res.body.data.id).toBe(row.id);
    const missing = await request(app).get(`/api/v1/admin/feedback/${MISSING}`).set(admin);
    expect(missing.status).toBe(404);
    expect(missing.body.error.code).toBe("FEEDBACK_NOT_FOUND");
  });

  it("solving stamps resolved_at, records the remark author and notifies the student", async () => {
    const row = db.seed({ userId: STUDENT_ID });
    const res = await patch(row.id, { status: "solved", admin_remark: "  Fixed in v1.2.  " });
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      status: "solved",
      admin_remark: "Fixed in v1.2.",
      resolved_at: expect.any(String),
      remarked_by: { id: ADMIN_ID, first_name: "Admin" },
    });
    expect(db.state.notifications).toEqual([
      expect.objectContaining({
        userId: STUDENT_ID,
        type: "FEEDBACK_UPDATED",
        title: "Your feedback was marked solved",
        body: "Fixed in v1.2.",
        href: "/feedback",
      }),
    ]);
    expect(sendFeedbackEmail).not.toHaveBeenCalled();
  });

  it("reopening clears resolved_at", async () => {
    const row = db.seed({ userId: STUDENT_ID, status: "SOLVED", resolvedAt: new Date() });
    const res = await patch(row.id, { status: "in_progress" });
    expect(res.body.data).toMatchObject({ status: "in_progress", resolved_at: null });
    expect(db.state.notifications[0]).toMatchObject({
      title: "Your feedback is in progress",
      body: null,
    });
  });

  it("a new remark alone is a reply", async () => {
    const row = db.seed({ userId: STUDENT_ID });
    await patch(row.id, { admin_remark: "Thanks! Looking into it." });
    expect(db.state.notifications[0]).toMatchObject({
      title: "We replied to your feedback",
      body: "Thanks! Looking into it.",
    });
  });

  it("doesn't write or notify when nothing changed", async () => {
    const row = db.seed({ userId: STUDENT_ID, status: "IN_PROGRESS", adminRemark: "On it." });
    const res = await patch(row.id, { status: "in_progress", admin_remark: "On it." });
    expect(res.status).toBe(200);
    expect(db.prisma.feedback.update).not.toHaveBeenCalled();
    expect(db.prisma.notification.create).not.toHaveBeenCalled();
  });

  it("rejects an empty patch and an unknown id", async () => {
    const row = db.seed({ userId: STUDENT_ID });
    expect((await patch(row.id, {})).status).toBe(422);
    expect((await patch(row.id, { admin_remark: "x".repeat(1001) })).status).toBe(422);
    expect((await patch(MISSING, { status: "solved" })).status).toBe(404);
  });
});

describe("planFeedbackUpdate", () => {
  const open = { status: "OPEN" as const, adminRemark: null, resolvedAt: null };

  it("clearing a remark alone writes but doesn't notify", () => {
    const plan = logic.planFeedbackUpdate(
      { ...open, adminRemark: "Old" },
      { adminRemark: "  " },
      ADMIN_ID,
    );
    expect(plan.data).toEqual({ adminRemark: null, remarkedById: ADMIN_ID });
    expect(plan.notification).toBeNull();
  });

  it("trims long remarks for the notification", () => {
    const plan = logic.planFeedbackUpdate(open, { adminRemark: "y".repeat(800) }, ADMIN_ID);
    expect(plan.notification?.body).toHaveLength(300);
  });
});
