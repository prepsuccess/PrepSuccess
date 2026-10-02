import type { User, UserProfile } from "../../generated/prisma/client.js";

/**
 * The user object every auth response returns (`AuthUser` in
 * frontend/lib/api/auth.ts). Identity comes from `users`; descriptive data
 * (student_year, mobile_no, goals, ...) comes from `user_profiles.profile_data`.
 * Never return password_hash or google_id.
 */
export function toAuthUser(user: User & { profile: UserProfile | null }) {
  return {
    id: user.id,
    first_name: user.firstName,
    last_name: user.lastName,
    email: user.email,
    profile_image_url: user.profileImageUrl,
    role: user.role.toLowerCase(),
    auth_provider: user.authProvider.toLowerCase(),
    is_verified: user.isVerified,
    onboarding_completed: Boolean(user.profile?.onboardingCompletedAt),
    profile: (user.profile?.profileData ?? {}) as Record<string, unknown>,
    created_at: user.createdAt.toISOString(),
  };
}

export type AuthUserResponse = ReturnType<typeof toAuthUser>;
