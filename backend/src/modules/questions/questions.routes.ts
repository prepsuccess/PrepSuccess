import { Router } from "express";

import { rateLimitPerMinute } from "../../middleware/rate-limit.js";
import { requireAuth } from "../../middleware/require-auth.js";
import * as questions from "./questions.controller.js";

/** /api/v1/questions — the interview question bank (Phase 2, docs/PHASE_2_PLAN.md). */
export const questionsRouter = Router();

const student = requireAuth("STUDENT");
questionsRouter.get("/", student, questions.list);
questionsRouter.get("/filters", student, questions.filters);
questionsRouter.get("/bookmarks", student, questions.bookmarks);
questionsRouter.get("/:id", student, questions.get);
questionsRouter.post("/:id/bookmark", student, rateLimitPerMinute(60), questions.bookmark);
questionsRouter.delete("/:id/bookmark", student, rateLimitPerMinute(60), questions.unbookmark);
questionsRouter.post("/:id/solve", student, rateLimitPerMinute(60), questions.solve);
questionsRouter.delete("/:id/solve", student, rateLimitPerMinute(60), questions.unsolve);

/** /api/v1/progress — readiness and questions solved over time. */
export const progressRouter = Router();
progressRouter.get("/", student, questions.progress);

/** /api/v1/prep-pdfs — curated prep guides. */
export const prepPdfsRouter = Router();
prepPdfsRouter.get("/", student, questions.prepPdfs);
prepPdfsRouter.post("/:id/download", student, rateLimitPerMinute(30), questions.downloadPrepPdf);
