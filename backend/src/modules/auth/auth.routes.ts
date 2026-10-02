import { Router } from "express";

import { rateLimitPerMinute } from "../../middleware/rate-limit.js";
import { requireAuth } from "../../middleware/require-auth.js";
import * as auth from "./auth.controller.js";

/** /api/v1/auth — SCRUM-11 (email + password). Google OAuth (SCRUM-12) mounts here too. */
export const authRouter = Router();

authRouter.post("/send-otp", rateLimitPerMinute(5), auth.sendOtp);
authRouter.post("/register", rateLimitPerMinute(10), auth.register);
authRouter.post("/login", rateLimitPerMinute(10), auth.login);
authRouter.post("/refresh", rateLimitPerMinute(30), auth.refresh);
authRouter.post("/logout", auth.logout);
authRouter.get("/me", requireAuth(), auth.me);
