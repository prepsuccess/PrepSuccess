import type { Request, Response } from "express";

import { sendSuccess } from "../../lib/http.js";
import { getMe } from "../auth/auth.service.js";
import { updateMeSchema } from "./users.schemas.js";
import * as usersService from "./users.service.js";

export async function me(req: Request, res: Response) {
  sendSuccess(req, res, await getMe(req.user!.id));
}

export async function updateMe(req: Request, res: Response) {
  const input = updateMeSchema.parse(req.body);
  sendSuccess(req, res, await usersService.updateMe(req.user!.id, input));
}
