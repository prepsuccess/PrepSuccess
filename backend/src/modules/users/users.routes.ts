import { Router } from "express";

import { rateLimitPerMinute } from "../../middleware/rate-limit.js";
import { requireAuth } from "../../middleware/require-auth.js";
import * as users from "./users.controller.js";

/** /api/v1/users — the signed-in user's own account and profile (SCRUM-13). */
export const usersRouter = Router();

usersRouter.get("/me", requireAuth(), users.me);
usersRouter.patch("/me", requireAuth(), rateLimitPerMinute(30), users.updateMe);
