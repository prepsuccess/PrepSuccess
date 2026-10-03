import type { Request, Response } from "express";

import { sendSuccess } from "../../lib/http.js";
import { listResourcesQuerySchema } from "./resources.schemas.js";
import * as resources from "./resources.service.js";

export async function list(req: Request, res: Response) {
  const { skill } = listResourcesQuerySchema.parse(req.query);
  sendSuccess(req, res, await resources.listForSkill(skill));
}
