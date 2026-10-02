import { Router } from "express";

import { requireAuth } from "../../middleware/require-auth.js";
import * as skills from "./skills.controller.js";

/** /api/v1/skills — the skill catalogue and the student's skills (SCRUM-14). */
export const skillsRouter = Router();

skillsRouter.get("/", requireAuth(), skills.list);
skillsRouter.get("/mine", requireAuth("STUDENT"), skills.mine);
