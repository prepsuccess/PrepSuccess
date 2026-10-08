import { z } from "zod";
import type { ZodOpenApiOperationObject, ZodOpenApiPathsObject } from "zod-openapi";

import { VALIDATION_422, bearerAuth, errors, ok, successEnvelope } from "../../docs/helpers.js";
import {
  adminFeedbackPatchSchema,
  adminFeedbackSchema,
  adminListFeedbackQuerySchema,
  feedbackIdParamsSchema,
  feedbackImageParamsSchema,
  feedbackInputSchema,
  feedbackSchema,
  feedbackSummarySchema,
  pageQuerySchema,
} from "./feedback.schemas.js";

const studentAuth = {
  401: "`UNAUTHORIZED` or `INVALID_TOKEN`.",
  403: "`FORBIDDEN` — students only.",
};
const adminAuth = {
  401: "`UNAUTHORIZED` or `INVALID_TOKEN`.",
  403: "`FORBIDDEN` — not an admin.",
  429: "`TOO_MANY_REQUESTS`.",
};
const json = <T>(schema: T) => ({ content: { "application/json": { schema } } });
const paged = <T extends z.ZodType>(item: T) =>
  successEnvelope(z.array(item)).extend({
    meta: z.object({ page: z.number().int(), limit: z.number().int(), total: z.number().int() }),
  });
const binary = z.string().meta({ format: "binary" });
const idPath = { path: feedbackIdParamsSchema };

function op(
  tag: "Feedback" | "Admin",
  summary: string,
  operation: Partial<ZodOpenApiOperationObject>,
): ZodOpenApiOperationObject {
  return { tags: [tag], summary, security: bearerAuth, ...operation } as ZodOpenApiOperationObject;
}

export const feedbackPaths: ZodOpenApiPathsObject = {
  "/api/v1/feedback": {
    post: op("Feedback", "Send feedback", {
      description:
        "A bug report, idea or content issue, with up to 3 screenshots as base64 data URLs " +
        "(PNG, JPEG or WebP, 2 MB each; the type is checked from the bytes). A bad image fails " +
        "with a validation issue at `images.N`. The body may be up to 10 MB. Up to 5 reports per " +
        "hour. The team is emailed in the background; the submit never waits on it.",
      requestBody: json(feedbackInputSchema),
      responses: {
        ...ok(feedbackSchema, "The saved feedback.", "201"),
        ...errors({
          ...studentAuth,
          413: "`PAYLOAD_TOO_LARGE` — over 10 MB.",
          ...VALIDATION_422,
          429: "`TOO_MANY_REQUESTS` — 5 reports in the last hour.",
        }),
      },
    }),
  },
  "/api/v1/feedback/mine": {
    get: op("Feedback", "My feedback", {
      description: "Your feedback, newest first, with the team's status and reply.",
      requestParams: { query: pageQuerySchema },
      responses: {
        200: { description: "One page of your feedback.", ...json(paged(feedbackSchema)) },
        ...errors({ ...studentAuth, ...VALIDATION_422 }),
      },
    }),
  },
  "/api/v1/feedback/{id}/images/{imageId}": {
    get: op("Feedback", "A feedback screenshot", {
      description:
        "The raw image bytes (not the JSON envelope), for the student who sent it or any admin. " +
        "Anyone else gets 404. Sent with `Cache-Control: private, max-age=3600`, " +
        "`X-Content-Type-Options: nosniff` and `Content-Disposition: inline`.",
      requestParams: { path: feedbackImageParamsSchema },
      responses: {
        200: {
          description: "The image.",
          content: {
            "image/png": { schema: binary },
            "image/jpeg": { schema: binary },
            "image/webp": { schema: binary },
          },
        },
        ...errors({
          401: studentAuth[401],
          403: "`FORBIDDEN` — not a student or admin.",
          404: "`IMAGE_NOT_FOUND`.",
          ...VALIDATION_422,
        }),
      },
    }),
  },
  "/api/v1/admin/feedback": {
    get: op("Admin", "List student feedback", {
      description:
        "Newest first. Filter by status and category; `q` searches the text and student.",
      requestParams: { query: adminListFeedbackQuerySchema },
      responses: {
        200: { description: "One page of feedback.", ...json(paged(adminFeedbackSchema)) },
        ...errors({ ...adminAuth, ...VALIDATION_422 }),
      },
    }),
  },
  "/api/v1/admin/feedback/summary": {
    get: op("Admin", "Feedback counts by status", {
      responses: { ...ok(feedbackSummarySchema, "Counts."), ...errors(adminAuth) },
    }),
  },
  "/api/v1/admin/feedback/{id}": {
    get: op("Admin", "One piece of feedback", {
      requestParams: idPath,
      responses: {
        ...ok(adminFeedbackSchema, "The feedback."),
        ...errors({ ...adminAuth, 404: "`FEEDBACK_NOT_FOUND`.", ...VALIDATION_422 }),
      },
    }),
    patch: op("Admin", "Update status or reply", {
      description:
        "Send `status`, `admin_remark` or both. Solving stamps `resolved_at`; reopening clears it. " +
        "A changed remark records who wrote it. When the status changes or a remark is added, " +
        "the student gets an in-app notification (no email).",
      requestParams: idPath,
      requestBody: json(adminFeedbackPatchSchema),
      responses: {
        ...ok(adminFeedbackSchema, "The updated feedback."),
        ...errors({ ...adminAuth, 404: "`FEEDBACK_NOT_FOUND`.", ...VALIDATION_422 }),
      },
    }),
  },
};
