import { Router } from "express";

import { authRouter } from "../modules/auth/auth.routes.js";

/**
 * Mounts every feature module under /api/v1. Add each module's router here
 * as it is built, e.g.:
 *
 *   apiV1.use("/users", usersRouter);        // SCRUM-13
 *   apiV1.use("/ai", aiRouter);              // onboarding + adaptive assessment
 *   apiV1.use("/dashboard", dashboardRouter); // SCRUM-15
 */
export const apiV1 = Router();

apiV1.use("/auth", authRouter);
