import { Router } from "express";

import { rateLimitPerMinute } from "../../middleware/rate-limit.js";
import { requireAuth } from "../../middleware/require-auth.js";
import * as auth from "./auth.controller.js";
import { googleCallback, startGoogleLogin } from "./google.controller.js";

/** /api/v1/auth — email + password (SCRUM-11) and Google sign-in (SCRUM-12). */
export const authRouter = Router();

authRouter.post("/send-otp", rateLimitPerMinute(5), auth.sendOtp);
authRouter.post("/register", rateLimitPerMinute(10), auth.register);
authRouter.post("/login", rateLimitPerMinute(10), auth.login);
authRouter.post("/forgot-password", rateLimitPerMinute(5), auth.forgotPassword);
authRouter.post("/reset-password", rateLimitPerMinute(10), auth.resetPassword);
authRouter.post("/refresh", rateLimitPerMinute(30), auth.refresh);
authRouter.post("/logout", auth.logout);
authRouter.get("/me", requireAuth(), auth.me);

// Full-page browser redirects, not fetch() calls.
authRouter.get("/google", rateLimitPerMinute(20), startGoogleLogin);
authRouter.get("/google/callback", rateLimitPerMinute(20), googleCallback);
