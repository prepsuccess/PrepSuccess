import { Router } from "express";

import { requireAuth } from "../../middleware/require-auth.js";
import * as ai from "./ai.controller.js";

/** /api/v1/ai — AI features. Onboarding and assessment routes mount here as they're built. */
export const aiRouter = Router();

aiRouter.get("/status", requireAuth(), ai.status);
