import { Router } from "express";

import { rateLimitPerUserPerMinute } from "../../middleware/rate-limit.js";
import { requireAuth } from "../../middleware/require-auth.js";
import * as tasks from "./tasks.controller.js";

/** /api/v1/tasks — practical tasks and AI-reviewed submissions (SCRUM-125). Students only. */
export const tasksRouter = Router();

const student = requireAuth("STUDENT");
tasksRouter.get("/", student, tasks.list);
tasksRouter.get("/:id", student, tasks.get);
// Each submission is one AI call; throttled per student, not per (shared) IP.
tasksRouter.post("/:id/submit", student, rateLimitPerUserPerMinute(6), tasks.submit);
