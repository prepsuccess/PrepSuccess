import type { Request, Response } from "express";

import { sendSuccess } from "../../lib/http.js";
import { loginSchema, refreshSchema, registerSchema, sendOtpSchema } from "./auth.schemas.js";
import * as authService from "./auth.service.js";

// Thin HTTP layer: validate with zod (a ZodError becomes a 422 in the error
// handler), call the service, wrap the result in the response envelope.

export async function sendOtp(req: Request, res: Response) {
  const { email } = sendOtpSchema.parse(req.body);
  sendSuccess(req, res, await authService.sendSignupOtp(email));
}

export async function register(req: Request, res: Response) {
  const input = registerSchema.parse(req.body);
  sendSuccess(req, res, await authService.register(input), { status: 201 });
}

export async function login(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);
  sendSuccess(req, res, await authService.login(input));
}

export async function refresh(req: Request, res: Response) {
  const { refresh_token } = refreshSchema.parse(req.body);
  sendSuccess(req, res, await authService.refresh(refresh_token));
}

export async function logout(req: Request, res: Response) {
  const { refresh_token } = refreshSchema.parse(req.body);
  sendSuccess(req, res, await authService.logout(refresh_token));
}

export async function me(req: Request, res: Response) {
  sendSuccess(req, res, await authService.getMe(req.user!.id));
}
