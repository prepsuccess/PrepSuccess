import type { Request, Response } from "express";

import { sendSuccess } from "../../lib/http.js";
import { coachMessageSchema } from "./coach.schemas.js";
import * as coach from "./coach.service.js";

export async function get(req: Request, res: Response) {
  sendSuccess(req, res, await coach.getCoach(req.user!.id));
}

export async function send(req: Request, res: Response) {
  const { content } = coachMessageSchema.parse(req.body);
  sendSuccess(req, res, await coach.sendCoachMessage(req.user!.id, content));
}

export async function clear(req: Request, res: Response) {
  sendSuccess(req, res, await coach.clearCoach(req.user!.id));
}

export async function ping(req: Request, res: Response) {
  sendSuccess(req, res, await coach.ping(req.user!.id));
}
