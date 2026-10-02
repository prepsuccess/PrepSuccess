import type { Request, Response } from "express";

import { sendSuccess } from "../../lib/http.js";
import * as skills from "./skills.service.js";

export async function list(req: Request, res: Response) {
  sendSuccess(req, res, await skills.listSkills());
}

export async function mine(req: Request, res: Response) {
  sendSuccess(req, res, await skills.mySkills(req.user!.id));
}
