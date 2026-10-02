import type { Request, Response } from "express";

import { sendSuccess } from "../../lib/http.js";
import * as dashboard from "./dashboard.service.js";

export async function get(req: Request, res: Response) {
  sendSuccess(req, res, await dashboard.getDashboard(req.user!.id));
}

export async function insight(req: Request, res: Response) {
  sendSuccess(req, res, await dashboard.getInsight(req.user!.id));
}
