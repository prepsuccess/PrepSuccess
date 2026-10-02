import type { Request, Response } from "express";
import { z } from "zod";

import { sendSuccess } from "../../lib/http.js";
import { answerSchema, startAssessmentSchema } from "./assessment.schemas.js";
import * as assessment from "./assessment.service.js";

const idParam = z.object({ id: z.uuid() });

export async function start(req: Request, res: Response) {
  const { skill_id } = startAssessmentSchema.parse(req.body);
  sendSuccess(req, res, await assessment.startAssessment(req.user!.id, skill_id));
}

export async function get(req: Request, res: Response) {
  const { id } = idParam.parse(req.params);
  sendSuccess(req, res, await assessment.getAssessment(req.user!.id, id));
}

export async function answer(req: Request, res: Response) {
  const { id } = idParam.parse(req.params);
  const input = answerSchema.parse(req.body);
  sendSuccess(req, res, await assessment.answerQuestion(req.user!.id, id, input));
}
