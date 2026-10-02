import type { AuthUser, StudentProfile } from "./auth";
import { apiClient } from "./client";

type KnownProfileKey = Exclude<keyof StudentProfile, number>;

/**
 * Partial update for PATCH /api/v1/users/me. Profile fields are merged on the
 * server: omitted fields are kept, `null` clears one.
 */
export interface UpdateMePayload {
  first_name?: string;
  last_name?: string | null;
  profile?: { [K in KnownProfileKey]?: StudentProfile[K] | null };
}

export function updateMe(payload: UpdateMePayload) {
  return apiClient.patch<AuthUser>("/api/v1/users/me", payload);
}
