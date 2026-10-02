import type { Request, Response } from "express";

import { prisma } from "../../db/prisma.js";
import { AppError, sendSuccess } from "../../lib/http.js";
import { getAiAccess } from "../../services/ai-agent/access.js";
import { provider } from "../../services/ai-agent/ai.service.js";

/** GET /api/v1/ai/status — trial and quota for the signed-in user. */
export async function status(req: Request, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { createdAt: true },
  });
  if (!user) throw new AppError(401, "UNAUTHORIZED", "Sign in to continue.");

  const access = await getAiAccess(req.user!.id, user.createdAt);
  sendSuccess(req, res, {
    available: provider.configured,
    allowed: provider.configured && access.allowed,
    reason: provider.configured ? access.reason : "AI_NOT_CONFIGURED",
    trial: access.trial,
    today: access.today,
  });
}
