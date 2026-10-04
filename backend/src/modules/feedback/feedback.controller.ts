import type { Request, Response } from "express";

import { sendSuccess } from "../../lib/http.js";
import {
  adminFeedbackPatchSchema,
  adminListFeedbackQuerySchema,
  feedbackIdParamsSchema,
  feedbackImageParamsSchema,
  feedbackInputSchema,
  pageQuerySchema,
} from "./feedback.schemas.js";
import * as feedback from "./feedback.service.js";

const feedbackId = (req: Request) => feedbackIdParamsSchema.parse(req.params).id;

// ---- Students ----------------------------------------------------------------

export async function submit(req: Request, res: Response) {
  const input = feedbackInputSchema.parse(req.body);
  sendSuccess(req, res, await feedback.submitFeedback(req.user!.id, input), { status: 201 });
}

export async function mine(req: Request, res: Response) {
  const { page, limit } = pageQuerySchema.parse(req.query);
  const { feedback: rows, meta } = await feedback.listMine(req.user!.id, page, limit);
  sendSuccess(req, res, rows, { meta });
}

/** Raw image bytes, not the JSON envelope: the app turns them into a blob URL. */
export async function image(req: Request, res: Response) {
  const { id, imageId } = feedbackImageParamsSchema.parse(req.params);
  const row = await feedback.getImage(req.user!, id, imageId);
  res
    .status(200)
    .set({
      "Content-Type": row.mime,
      "Content-Length": String(row.data.length),
      "Cache-Control": "private, max-age=3600",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": "inline",
    })
    .end(Buffer.from(row.data));
}

// ---- Admins ------------------------------------------------------------------

export async function adminList(req: Request, res: Response) {
  const { feedback: rows, meta } = await feedback.adminList(
    adminListFeedbackQuerySchema.parse(req.query),
  );
  sendSuccess(req, res, rows, { meta });
}

export async function adminSummary(req: Request, res: Response) {
  sendSuccess(req, res, await feedback.adminSummary());
}

export async function adminGet(req: Request, res: Response) {
  sendSuccess(req, res, await feedback.adminGet(feedbackId(req)));
}

export async function adminUpdate(req: Request, res: Response) {
  const input = adminFeedbackPatchSchema.parse(req.body);
  sendSuccess(req, res, await feedback.adminUpdate(req.user!.id, feedbackId(req), input));
}
