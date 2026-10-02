import { Router } from "express";

import { rateLimitPerMinute } from "../../middleware/rate-limit.js";
import { requireAuth } from "../../middleware/require-auth.js";
import * as onboarding from "../onboarding/onboarding.controller.js";
import * as ai from "./ai.controller.js";

/** /api/v1/ai — AI features. Assessment routes mount here next. */
export const aiRouter = Router();

aiRouter.get("/status", requireAuth(), ai.status);

// AI onboarding chat (SCRUM-13).
aiRouter.get("/onboarding", requireAuth(), onboarding.get);
aiRouter.post("/onboarding/messages", requireAuth(), rateLimitPerMinute(20), onboarding.send);
