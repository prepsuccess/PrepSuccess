import type { User, UserProfile } from "../../generated/prisma/client.js";
import type { AuthUserResponse } from "./auth.schemas.js";

/**
 * The user object every auth response returns (`AuthUser` in
 * frontend/lib/api/auth.ts). Identity comes from `users`; descriptive data
 * (student_year, mobile_no, goals, ...) comes from `user_profiles.profile_data`.
 * Never return password_hash or google_id. Typed against `authUserSchema`, so
 * the API docs fail to compile if this shape changes without them.
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
    is_verified: user.isVerified,
    onboarding_completed: Boolean(user.profile?.onboardingCompletedAt),
    profile: (user.profile?.profileData ?? {}) as Record<string, unknown>,
    created_at: user.createdAt.toISOString(),
  };
}
