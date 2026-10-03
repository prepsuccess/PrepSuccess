import type { Request, Response } from "express";

import { sendSuccess } from "../../lib/http.js";
import { notificationIdParamsSchema } from "./notifications.schemas.js";
import * as notifications from "./notifications.service.js";

export async function list(req: Request, res: Response) {
  sendSuccess(req, res, await notifications.list(req.user!.id));
}

export async function markRead(req: Request, res: Response) {
  const { id } = notificationIdParamsSchema.parse(req.params);
  sendSuccess(req, res, await notifications.markRead(req.user!.id, id));
}

export async function markAllRead(req: Request, res: Response) {
  sendSuccess(req, res, await notifications.markAllRead(req.user!.id));
}
