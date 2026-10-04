import { Router } from "express";

import { rateLimitPerMinute, rateLimitPerUserPerHour } from "../../middleware/rate-limit.js";
import { requireAuth } from "../../middleware/require-auth.js";
import * as feedback from "./feedback.controller.js";

/**
 * /api/v1/feedback — students report bugs and ideas. The admin side lives
 * under /admin/feedback (admin.routes.ts). POST bodies may carry screenshots,
 * so app.ts gives this path a larger JSON limit.
 */
export const feedbackRouter = Router();

const student = requireAuth("STUDENT");
// Five saved reports an hour are enforced in the service; this also caps rejected tries.
feedbackRouter.post("/", student, rateLimitPerUserPerHour(20), feedback.submit);
feedbackRouter.get("/mine", student, feedback.mine);
// The owner, or an admin reviewing it.
feedbackRouter.get(
  "/:id/images/:imageId",
  requireAuth("STUDENT", "ADMIN"),
  rateLimitPerMinute(120, { by: "user" }),
  feedback.image,
);
