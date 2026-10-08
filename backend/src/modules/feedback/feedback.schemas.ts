import { z } from "zod";

import type { Feedback, FeedbackImage, User } from "../../generated/prisma/client.js";
import {
  DATA_URL_MAX_CHARS,
  IMAGES_MAX,
  MESSAGE_MAX_CHARS,
  MESSAGE_MIN_CHARS,
  PAGE_MAX_CHARS,
  REMARK_MAX_CHARS,
  cleanPage,
  decodeImage,
} from "./feedback.logic.js";

const category = z.enum(["bug", "idea", "content", "other"]);
const status = z.enum(["open", "in_progress", "solved"]);

export const feedbackIdParamsSchema = z.object({ id: z.uuid("That feedback doesn't exist.") });
export const feedbackImageParamsSchema = z.object({
  id: z.uuid("That image doesn't exist."),
  imageId: z.uuid("That image doesn't exist."),
});

/** One screenshot, decoded and checked; a bad one fails at `images.N`. */
const imageInput = z
  .object({
    name: z.string().max(100).optional().meta({ example: "checkout-error.png" }),
    data: z
      .string()
      .max(DATA_URL_MAX_CHARS, "Each image must be 2 MB or smaller.")
      .meta({
        description:
          "`data:image/png|jpeg|webp;base64,...`, at most 2 MB decoded. The type is checked " +
          "from the file's bytes.",
      }),
  })
  .transform((image, ctx) => {
    const decoded = decodeImage(image.data);
    if (!decoded.ok) {
      ctx.addIssue({ code: "custom", message: decoded.message });
      return z.NEVER;
    }
    return { name: image.name, mime: decoded.mime, bytes: decoded.bytes };
  });

export const feedbackInputSchema = z
  .object({
    category,
    message: z
      .string()
      .trim()
      .min(MESSAGE_MIN_CHARS, `Write at least ${MESSAGE_MIN_CHARS} characters.`)
      .max(MESSAGE_MAX_CHARS, `Keep it under ${MESSAGE_MAX_CHARS} characters.`),
    page: z
      .string()
      .max(PAGE_MAX_CHARS * 2)
      .nullable()
      .optional()
      .transform(cleanPage)
      .meta({
        description: `App path the student was on, e.g. /questions. Dropped unless it starts with "/" (max ${PAGE_MAX_CHARS}).`,
      }),
    images: z
      .array(imageInput)
      .max(IMAGES_MAX, `Attach up to ${IMAGES_MAX} images.`)
      .default([])
      .meta({ description: `Up to ${IMAGES_MAX} screenshots.` }),
  })
  .meta({ id: "FeedbackInput" });

export const pageQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const adminListFeedbackQuerySchema = z
  .object({
    status: status.optional(),
    category: category.optional(),
    q: z
      .string()
      .trim()
      .max(100)
      .optional()
      .meta({ description: "Searches the message and the student's name and email." }),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .meta({ id: "AdminListFeedbackQuery" });

export const adminFeedbackPatchSchema = z
  .object({
    status: status.optional(),
    admin_remark: z
      .string()
      .trim()
      .max(REMARK_MAX_CHARS, `Keep it under ${REMARK_MAX_CHARS} characters.`)
      .nullable()
      .optional()
      .meta({ description: "Shown to the student. Null or blank clears it." }),
  })
  .refine((value) => Object.keys(value).length > 0, "Send at least one field to change.")
  .meta({ id: "AdminFeedbackPatch" });

export const feedbackImageSchema = z
  .object({
    id: z.uuid(),
    mime: z.enum(["image/png", "image/jpeg", "image/webp"]),
    size: z.number().int().meta({ description: "Bytes." }),
    url: z.string().meta({
      description:
        "Relative API path to the image bytes. Needs the bearer token (fetch it, don't <img src>).",
      example: "/api/v1/feedback/…/images/…",
    }),
  })
  .meta({ id: "FeedbackImage" });

export const feedbackSchema = z
  .object({
    id: z.uuid(),
    category,
    message: z.string(),
    page: z.string().nullable(),
    status,
    admin_remark: z.string().nullable().meta({ description: "The team's reply." }),
    resolved_at: z.iso.datetime().nullable(),
    created_at: z.iso.datetime(),
    updated_at: z.iso.datetime(),
    images: z.array(feedbackImageSchema),
  })
  .meta({ id: "Feedback" });

export const adminFeedbackSchema = feedbackSchema
  .extend({
    user: z.object({
      id: z.uuid(),
      first_name: z.string(),
      last_name: z.string().nullable(),
      email: z.string(),
    }),
    remarked_by: z
      .object({ id: z.uuid(), first_name: z.string() })
      .nullable()
      .meta({ description: "The admin who last changed the remark." }),
  })
  .meta({ id: "AdminFeedback" });

export const feedbackSummarySchema = z
  .object({ open: z.number().int(), in_progress: z.number().int(), solved: z.number().int() })
  .meta({ id: "FeedbackSummary" });

export type FeedbackInput = z.infer<typeof feedbackInputSchema>;
export type FeedbackResponse = z.infer<typeof feedbackSchema>;
export type AdminFeedbackResponse = z.infer<typeof adminFeedbackSchema>;
export type FeedbackSummary = z.infer<typeof feedbackSummarySchema>;

type ImageMeta = Pick<FeedbackImage, "id" | "mime" | "size">;
export type FeedbackRow = Feedback & { images: ImageMeta[] };
export type AdminFeedbackRow = FeedbackRow & {
  user: Pick<User, "id" | "firstName" | "lastName" | "email">;
  remarkedBy: Pick<User, "id" | "firstName"> | null;
};

const lower = <T extends string>(value: T) => value.toLowerCase() as Lowercase<T>;

export function toFeedback(row: FeedbackRow): FeedbackResponse {
  return {
    id: row.id,
    category: lower(row.category),
    message: row.message,
    page: row.page,
    status: lower(row.status),
    admin_remark: row.adminRemark,
    resolved_at: row.resolvedAt?.toISOString() ?? null,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
    images: row.images.map((image) => ({
      id: image.id,
      mime: image.mime as FeedbackResponse["images"][number]["mime"],
      size: image.size,
      url: `/api/v1/feedback/${row.id}/images/${image.id}`,
    })),
  };
}

export function toAdminFeedback(row: AdminFeedbackRow): AdminFeedbackResponse {
  return {
    ...toFeedback(row),
    user: {
      id: row.user.id,
      first_name: row.user.firstName,
      last_name: row.user.lastName,
      email: row.user.email,
    },
    remarked_by: row.remarkedBy
      ? { id: row.remarkedBy.id, first_name: row.remarkedBy.firstName }
      : null,
  };
}
