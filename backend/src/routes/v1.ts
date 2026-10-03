import { Router } from "express";

import { adminRouter } from "../modules/admin/admin.routes.js";
import { aiRouter } from "../modules/ai/ai.routes.js";
import { authRouter } from "../modules/auth/auth.routes.js";
import { dashboardRouter } from "../modules/dashboard/dashboard.routes.js";
import { notificationsRouter } from "../modules/notifications/notifications.routes.js";
import {
  prepPdfsRouter,
  progressRouter,
  questionsRouter,
} from "../modules/questions/questions.routes.js";
import { resourcesRouter } from "../modules/resources/resources.routes.js";
import { skillsRouter } from "../modules/skills/skills.routes.js";
import { tasksRouter } from "../modules/tasks/tasks.routes.js";
import { usersRouter } from "../modules/users/users.routes.js";

/**
 * Mounts every feature module under /api/v1. Add each new module's router
 * here, its paths to src/docs/openapi.ts and its router to MOUNTED in
 * tests/docs.test.ts.
 */
export const apiV1 = Router();

apiV1.use("/auth", authRouter);
apiV1.use("/users", usersRouter);
apiV1.use("/skills", skillsRouter);
apiV1.use("/ai", aiRouter);
apiV1.use("/dashboard", dashboardRouter);
apiV1.use("/resources", resourcesRouter);
apiV1.use("/tasks", tasksRouter);
apiV1.use("/questions", questionsRouter);
apiV1.use("/progress", progressRouter);
apiV1.use("/prep-pdfs", prepPdfsRouter);
apiV1.use("/notifications", notificationsRouter);
apiV1.use("/admin", adminRouter);
