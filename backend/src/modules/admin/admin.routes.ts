import { Router } from "express";

import { rateLimitPerMinute } from "../../middleware/rate-limit.js";
import { requireAuth } from "../../middleware/require-auth.js";
import * as questions from "../questions/questions.controller.js";
import * as admin from "./admin.controller.js";

/**
 * /api/v1/admin — admin panel APIs (PRD-04 §3.1). The role check is here on
 * the server for every route; the frontend's hidden links are only UX.
 */
export const adminRouter = Router();

adminRouter.use(requireAuth("ADMIN"), rateLimitPerMinute(120));

adminRouter.get("/users", admin.listUsers);
adminRouter.patch("/users/:id", admin.updateUser);
adminRouter.get("/analytics", admin.analytics);

adminRouter.get("/skills", admin.listSkills);
adminRouter.post("/skills", admin.createSkill);
adminRouter.patch("/skills/:id", admin.updateSkill);
adminRouter.delete("/skills/:id", admin.deleteSkill);
adminRouter.get("/skills/:id/resources", admin.listResources);
adminRouter.get("/skills/:id/tasks", admin.listTasks);

adminRouter.post("/resources", admin.createResource);
adminRouter.patch("/resources/:id", admin.updateResource);
adminRouter.delete("/resources/:id", admin.deleteResource);

adminRouter.post("/tasks", admin.createTask);
adminRouter.patch("/tasks/:id", admin.updateTask);
adminRouter.delete("/tasks/:id", admin.deleteTask);

// Phase 2: interview question bank and prep PDFs.
adminRouter.get("/questions", questions.adminList);
adminRouter.post("/questions", questions.adminCreate);
adminRouter.post("/questions/import", rateLimitPerMinute(10), questions.adminImport);
adminRouter.patch("/questions/:id", questions.adminUpdate);
adminRouter.delete("/questions/:id", questions.adminDelete);
adminRouter.get("/question-taxonomy", questions.adminTaxonomy);
adminRouter.get("/prep-pdfs", questions.adminPdfList);
adminRouter.post("/prep-pdfs", questions.adminPdfCreate);
adminRouter.patch("/prep-pdfs/:id", questions.adminPdfUpdate);
adminRouter.delete("/prep-pdfs/:id", questions.adminPdfDelete);
