import { Router } from "express";

import { aiRouter } from "../modules/ai/ai.routes.js";
import { authRouter } from "../modules/auth/auth.routes.js";
import { usersRouter } from "../modules/users/users.routes.js";

/**
 * Mounts every feature module under /api/v1. Add each module's router here
 * as it is built, e.g.:
 *
 *   apiV1.use("/dashboard", dashboardRouter); // SCRUM-15
 */
export const apiV1 = Router();

apiV1.use("/auth", authRouter);
apiV1.use("/users", usersRouter);
apiV1.use("/ai", aiRouter);
