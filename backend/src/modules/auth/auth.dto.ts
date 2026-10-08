import type { User, UserProfile } from "../../generated/prisma/client.js";
import { LOGIN_METHODS, type AuthUserResponse, type LoginMethod } from "./auth.schemas.js";

const isLoginMethod = (value: string | null): value is LoginMethod =>
  (LOGIN_METHODS as readonly (string | null)[]).includes(value);

/**
 * The user object every auth response returns (`AuthUser` in
 * frontend/lib/api/auth.ts). Identity comes from `users`; descriptive data
 * (student_year, mobile_no, goals, ...) comes from `user_profiles.profile_data`.
 * Never return password_hash, google_id or github_id — only whether they're
 * set (sign_in_methods). Typed against `authUserSchema`, so the API docs fail
 * to compile if this shape changes without them.
 */
export function toAuthUser(user: User & { profile: UserProfile | null }): AuthUserResponse {
  return {
    id: user.id,
    first_name: user.firstName,
    last_name: user.lastName,
    email: user.email,
    profile_image_url: user.profileImageUrl,
    role: user.role.toLowerCase() as AuthUserResponse["role"],
    auth_provider: user.authProvider.toLowerCase() as AuthUserResponse["auth_provider"],
    sign_in_methods: {
      password: Boolean(user.passwordHash),
      google: Boolean(user.googleId),
      github: Boolean(user.githubId),
    },
    last_login_method: isLoginMethod(user.lastLoginMethod) ? user.lastLoginMethod : null,
    is_verified: user.isVerified,
    onboarding_completed: Boolean(user.profile?.onboardingCompletedAt),
    profile: (user.profile?.profileData ?? {}) as Record<string, unknown>,
    created_at: user.createdAt.toISOString(),
  };
}
