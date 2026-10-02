import { Router } from "express";

import { prisma } from "../../db/prisma.js";
import { AppError, sendSuccess } from "../../lib/http.js";

/** Liveness + readiness probes (docs/PRODUCTION_STANDARDS.md §1.3). */
export const healthRouter = Router();

healthRouter.get("/live", (req, res) => {
  sendSuccess(req, res, { status: "ok" });
});

healthRouter.get("/ready", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    throw new AppError(503, "SERVICE_UNAVAILABLE", "Database is not reachable.");
  }
  sendSuccess(req, res, { status: "ok", database: "ok" });
});
