import type { Request, Response } from "express";

import { sendSuccess } from "../../lib/http.js";
import { sendMessageSchema } from "./onboarding.schemas.js";
import * as onboarding from "./onboarding.service.js";

export async function get(req: Request, res: Response) {
  sendSuccess(req, res, await onboarding.getOnboarding(req.user!.id));
}

export async function send(req: Request, res: Response) {
  const { content } = sendMessageSchema.parse(req.body);
  sendSuccess(req, res, await onboarding.sendMessage(req.user!.id, content));
}
