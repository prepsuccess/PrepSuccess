import { Router } from "express";

import { requireAuth } from "../../middleware/require-auth.js";
import * as notifications from "./notifications.controller.js";

/** /api/v1/notifications — the signed-in user's in-app notifications (SCRUM-48). */
export const notificationsRouter = Router();

notificationsRouter.get("/", requireAuth(), notifications.list);
notificationsRouter.post("/read-all", requireAuth(), notifications.markAllRead);
notificationsRouter.post("/:id/read", requireAuth(), notifications.markRead);
