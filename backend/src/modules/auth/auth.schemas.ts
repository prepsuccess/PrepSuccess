import { z } from "zod";

// Request bodies. Field names are snake_case to match the frontend
// (frontend/lib/api/auth.ts). Password rules mirror validateNewPassword there.

// Normalize first (trim + lowercase), then validate the format.
const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email address.").max(255));

const password = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(128, "Use 128 characters or fewer.");

export const sendOtpSchema = z.object({ email });

export const registerSchema = z.object({
  first_name: z.string().trim().min(1, "Enter your first name.").max(100),
  last_name: z.string().trim().max(100).optional(),
  email,
  password,
  student_year: z.coerce.number().int().min(1).max(6).optional(),
  otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code from your email."),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password.").max(128),
});

export const refreshSchema = z.object({
  refresh_token: z.string().min(1).max(200),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
