import { Router } from "express";

import { requireAuth } from "../../middleware/require-auth.js";
import * as dashboard from "./dashboard.controller.js";

/** /api/v1/dashboard — the student's readiness at a glance (SCRUM-15). */
export const dashboardRouter = Router();

dashboardRouter.get("/", requireAuth("STUDENT"), dashboard.get);
