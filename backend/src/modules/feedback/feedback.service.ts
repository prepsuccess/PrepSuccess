import { env } from "../../config/env.js";
import { prisma } from "../../db/prisma.js";
import type { Prisma, Role } from "../../generated/prisma/client.js";
import { AppError, type PaginationMeta } from "../../lib/http.js";
import { logger } from "../../lib/logger.js";
import { sendFeedbackEmail } from "../../services/email/email.service.js";
import { notify } from "../../services/notifications/notifications.service.js";
import {
  CATEGORY_LABELS,
  SUBMISSIONS_PER_HOUR,
  attachmentName,
  feedbackRecipient,
  planFeedbackUpdate,
} from "./feedback.logic.js";
import {
  toAdminFeedback,
  toFeedback,
  type AdminFeedbackResponse,
  type FeedbackInput,
  type FeedbackResponse,
  type FeedbackSummary,
} from "./feedback.schemas.js";

/**
 * Student feedback: bug reports, ideas and content issues with optional
 * screenshots. Students see only their own; admins triage everything under
 * /admin/feedback. The team gets an email per submission (best effort).
 */

// Never load image bytes into lists; they're served one at a time by getImage.
const imageMeta = { select: { id: true, mime: true, size: true } } as const;
const adminInclude = {
  images: imageMeta,
  user: { select: { id: true, firstName: true, lastName: true, email: true } },
  remarkedBy: { select: { id: true, firstName: true } },
} satisfies Prisma.FeedbackInclude;

const upper = <T extends string>(value: T) => value.toUpperCase() as Uppercase<T>;

const notFound = () => new AppError(404, "FEEDBACK_NOT_FOUND", "That feedback doesn't exist.");

/** POST /feedback — saves the feedback and its screenshots together, then emails the team. */
export async function submitFeedback(userId: string, input: FeedbackInput) {
  // Counted from saved rows, so failed or invalid tries don't use up the hour.
  const recent = await prisma.feedback.count({
    where: { userId, createdAt: { gte: new Date(Date.now() - 60 * 60_000) } },
  });
  if (recent >= SUBMISSIONS_PER_HOUR) {
    throw new AppError(
      429,
      "TOO_MANY_REQUESTS",
      `You can send ${SUBMISSIONS_PER_HOUR} feedback reports an hour. Please try again later.`,
    );
  }

  // A nested create is one transaction: the feedback and every image, or nothing.
  const row = await prisma.feedback.create({
    data: {
      userId,
      category: upper(input.category),
      message: input.message,
      page: input.page,
      images: {
        create: input.images.map((image) => ({
          mime: image.mime,
          size: image.bytes.length,
          data: new Uint8Array(image.bytes),
        })),
      },
    },
    include: { images: imageMeta },
  });

  // Not awaited: the student's submit never waits on (or fails because of) SMTP.
  void emailTeam(userId, row.id, row.createdAt, input).catch((error: unknown) => {
    logger.error({ err: error, feedbackId: row.id }, "Feedback email failed");
  });

  return toFeedback(row);
}

async function emailTeam(userId: string, id: string, submittedAt: Date, input: FeedbackInput) {
  const to = feedbackRecipient(env.FEEDBACK_EMAIL, env.SMTP_USER);
  if (!to) {
    logger.warn({ feedbackId: id }, "No FEEDBACK_EMAIL or SMTP_USER — feedback email skipped");
    return;
  }
  const student = await prisma.user.findUnique({
    where: { id: userId },
    select: { firstName: true, lastName: true, email: true },
  });
  if (!student) return;
  await sendFeedbackEmail({
    to,
    id,
    category: CATEGORY_LABELS[upper(input.category)],
    message: input.message,
    page: input.page,
    student: {
      name: [student.firstName, student.lastName].filter(Boolean).join(" "),
      email: student.email,
    },
    submittedAt,
    images: input.images.map((image, index) => ({
      filename: attachmentName(image.name, index, image.mime),
      mime: image.mime,
      data: image.bytes,
    })),
  });
}

/** GET /feedback/mine — the student's own feedback, newest first. */
export async function listMine(
  userId: string,
  page: number,
  limit: number,
): Promise<{ feedback: FeedbackResponse[]; meta: PaginationMeta }> {
  const where = { userId };
  const [rows, total] = await Promise.all([
    prisma.feedback.findMany({
      where,
      include: { images: imageMeta },
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.feedback.count({ where }),
  ]);
  return { feedback: rows.map(toFeedback), meta: { page, limit, total } };
}

/**
 * GET /feedback/:id/images/:imageId — the owner or any admin. Anyone else
 * gets the same 404 as a missing image, so ids can't be probed.
 */
export async function getImage(
  viewer: { id: string; role: Role },
  feedbackId: string,
  imageId: string,
) {
  const image = await prisma.feedbackImage.findFirst({
    where: {
      id: imageId,
      feedbackId,
      ...(viewer.role === "ADMIN" ? {} : { feedback: { userId: viewer.id } }),
    },
    select: { mime: true, size: true, data: true },
  });
  if (!image) throw new AppError(404, "IMAGE_NOT_FOUND", "That image doesn't exist.");
  return image;
}

// ---- Admins ------------------------------------------------------------------

export async function adminList(query: {
  status?: "open" | "in_progress" | "solved";
  category?: "bug" | "idea" | "content" | "other";
  q?: string;
  page: number;
  limit: number;
}): Promise<{ feedback: AdminFeedbackResponse[]; meta: PaginationMeta }> {
  const contains = query.q ? { contains: query.q, mode: "insensitive" as const } : null;
  const where: Prisma.FeedbackWhereInput = {
    ...(query.status ? { status: upper(query.status) } : {}),
    ...(query.category ? { category: upper(query.category) } : {}),
    ...(contains
      ? {
          OR: [
            { message: contains },
            { user: { email: contains } },
            { user: { firstName: contains } },
            { user: { lastName: contains } },
          ],
        }
      : {}),
  };
  const [rows, total] = await Promise.all([
    prisma.feedback.findMany({
      where,
      include: adminInclude,
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
    prisma.feedback.count({ where }),
  ]);
  return {
    feedback: rows.map(toAdminFeedback),
    meta: { page: query.page, limit: query.limit, total },
  };
}

/** GET /admin/feedback/summary — how many are open, in progress and solved. */
export async function adminSummary(): Promise<FeedbackSummary> {
  const groups = await prisma.feedback.groupBy({ by: ["status"], _count: { _all: true } });
  const count = (status: string) => groups.find((g) => g.status === status)?._count._all ?? 0;
  return { open: count("OPEN"), in_progress: count("IN_PROGRESS"), solved: count("SOLVED") };
}

export async function adminGet(id: string) {
  const row = await prisma.feedback.findUnique({ where: { id }, include: adminInclude });
  if (!row) throw notFound();
  return toAdminFeedback(row);
}

/**
 * PATCH /admin/feedback/:id — status and/or remark. Only real changes are
 * written, and only those notify the student (in-app, never by email).
 */
export async function adminUpdate(
  adminId: string,
  id: string,
  input: { status?: "open" | "in_progress" | "solved"; admin_remark?: string | null },
) {
  const current = await prisma.feedback.findUnique({ where: { id }, include: adminInclude });
  if (!current) throw notFound();

  const plan = planFeedbackUpdate(
    current,
    {
      ...(input.status ? { status: upper(input.status) } : {}),
      ...(input.admin_remark !== undefined ? { adminRemark: input.admin_remark } : {}),
    },
    adminId,
  );
  if (Object.keys(plan.data).length === 0) return toAdminFeedback(current);

  const row = await prisma.feedback.update({
    where: { id },
    data: plan.data,
    include: adminInclude,
  });
  if (plan.notification) {
    await notify(row.userId, {
      type: "FEEDBACK_UPDATED",
      title: plan.notification.title,
      ...(plan.notification.body ? { body: plan.notification.body } : {}),
      href: "/feedback",
      payload: { feedback_id: row.id, status: row.status.toLowerCase() },
    });
  }
  return toAdminFeedback(row);
}
