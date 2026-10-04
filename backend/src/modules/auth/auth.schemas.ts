import { z } from "zod";

// Request and response shapes for /api/v1/auth. The same schemas validate
// requests at runtime and generate the OpenAPI docs (auth.docs.ts), so the
// docs can't drift from the code. Field names are snake_case to match the
// frontend (frontend/lib/api/auth.ts); password rules mirror validateNewPassword.

// Normalize first (trim + lowercase), then validate the format.
const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email address.").max(255))
  .meta({ description: "Trimmed and lowercased before use.", example: "asha@college.edu" });

const password = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(128, "Use 128 characters or fewer.")
  .meta({ example: "correct-horse-battery" });

const refreshToken = z
  .string()
  .min(1)
  .max(200)
  .meta({ description: "Opaque refresh token from login/register/refresh." });

// ---- Requests ----

export const sendOtpSchema = z.object({ email }).meta({ id: "SendOtpRequest" });

export const registerSchema = z
  .object({
    first_name: z
      .string()
      .trim()
      .min(1, "Enter your first name.")
      .max(100)
      .meta({ example: "Asha" }),
    last_name: z.string().trim().max(100).optional().meta({ example: "Verma" }),
    email,
    password,
    student_year: z
      .number()
      .int()
      .min(1)
      .max(6)
      .optional()
      .meta({ description: "Stored in the user's profile.", example: 3 }),
    otp: z
      .string()
      .regex(/^\d{6}$/, "Enter the 6-digit code from your email.")
      .meta({ description: "Code emailed by /auth/send-otp.", example: "482913" }),
  })
  .meta({ id: "RegisterRequest" });

export const loginSchema = z
  .object({
    email,
    password: z
      .string()
      .min(1, "Enter your password.")
      .max(128)
      .meta({ example: "correct-horse-battery" }),
  })
  .meta({ id: "LoginRequest" });

export const forgotPasswordSchema = z.object({ email }).meta({ id: "ForgotPasswordRequest" });

export const resetPasswordSchema = z
  .object({
    email,
    otp: z
      .string()
      .regex(/^\d{6}$/, "Enter the 6-digit code from your email.")
      .meta({ description: "Code emailed by /auth/forgot-password.", example: "482913" }),
    password,
  })
  .meta({ id: "ResetPasswordRequest" });

export const refreshSchema = z
  .object({ refresh_token: refreshToken })
  .meta({ id: "RefreshRequest" });

/** GET /auth/google. `next` is sanitised in the controller rather than rejected. */
export const googleStartQuerySchema = z.object({
  next: z.string().optional().meta({
    description: "Same-site path to land on after sign-in. Anything else is ignored.",
    example: "/dashboard",
  }),
  nonce: z
    .string()
    .regex(/^[A-Za-z0-9_-]{16,128}$/, "Invalid nonce.")
    .optional()
    .meta({
      description:
        "Random value the frontend keeps (sessionStorage) and expects back in the callback " +
        "fragment, so a sign-in it didn't start (login CSRF) is rejected. 16–128 of [A-Za-z0-9_-].",
      example: "k3J9xQ2mW7pL0aZ8vB4nR6tY",
    }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// ---- Responses ----

export const authUserSchema = z
  .object({
    id: z.uuid(),
    first_name: z.string().meta({ example: "Asha" }),
    last_name: z.string().nullable().meta({ example: "Verma" }),
    email: z.string().meta({ example: "asha@college.edu" }),
    profile_image_url: z.string().nullable(),
    role: z.enum(["student", "mentor", "admin"]),
    auth_provider: z.enum(["local", "google"]),
    is_verified: z.boolean(),
    onboarding_completed: z
      .boolean()
      .meta({ description: "True once the AI onboarding has finished." }),
    profile: z.record(z.string(), z.unknown()).meta({
      description:
        "Schemaless profile collected by the AI onboarding (user_profiles.profile_data).",
      example: { student_year: 3 },
    }),
    created_at: z.iso.datetime(),
  })
  .meta({ id: "AuthUser" });

export const tokenResponseSchema = z
  .object({
    access_token: z.string().meta({ description: "JWT. Send as `Authorization: Bearer <token>`." }),
    refresh_token: refreshToken,
    token_type: z.literal("bearer"),
    expires_in: z
      .number()
      .int()
      .meta({ description: "Access token lifetime in seconds.", example: 1800 }),
    user: authUserSchema,
  })
  .meta({ id: "TokenResponse" });

export const messageSchema = z
  .object({ message: z.string().meta({ example: "Signed out." }) })
  .meta({ id: "Message" });

export const sendOtpResponseSchema = z
  .object({
    message: z.string().meta({ example: "We sent a 6-digit code to asha@college.edu." }),
    email: z.string().meta({ example: "asha@college.edu" }),
  })
  .meta({ id: "SendOtpResponse" });

export type AuthUserResponse = z.infer<typeof authUserSchema>;
