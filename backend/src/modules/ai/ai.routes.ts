import { Router } from "express";

import { rateLimitPerMinute } from "../../middleware/rate-limit.js";
import { requireAuth } from "../../middleware/require-auth.js";
import * as assessment from "../assessment/assessment.controller.js";
import * as onboarding from "../onboarding/onboarding.controller.js";
import * as ai from "./ai.controller.js";

/** /api/v1/ai — AI features. */
export const aiRouter = Router();

aiRouter.get("/status", requireAuth(), ai.status);

// AI onboarding chat (SCRUM-13).
aiRouter.get("/onboarding", requireAuth(), onboarding.get);
aiRouter.post("/onboarding/messages", requireAuth(), rateLimitPerMinute(20), onboarding.send);

// Adaptive skill checks (SCRUM-14). Students only; starting costs one AI call.
const student = requireAuth("STUDENT");
aiRouter.post("/assessment/start", student, rateLimitPerMinute(10), assessment.start);
aiRouter.get("/assessment/:id", student, assessment.get);
aiRouter.post("/assessment/:id/answer", student, rateLimitPerMinute(60), assessment.answer);
