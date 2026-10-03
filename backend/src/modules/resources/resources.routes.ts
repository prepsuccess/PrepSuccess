import { Router } from "express";

import { requireAuth } from "../../middleware/require-auth.js";
import * as resources from "./resources.controller.js";

/** /api/v1/resources — curated learning material per skill (SCRUM-126). */
export const resourcesRouter = Router();

resourcesRouter.get("/", requireAuth(), resources.list);
