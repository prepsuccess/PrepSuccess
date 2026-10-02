import { apiClient } from "./client";

export type UserRole = "student" | "mentor" | "admin";

/**
 * Everything the AI onboarding has collected (`user_profiles.profile_data` on the backend).
 * Known keys mirror `profileFields` in backend/src/modules/users/users.schemas.ts;
 * anything else may appear as onboarding evolves.
 */
export interface StudentProfile {
  college?: string;
  degree?: string;
  branch?: string;
  student_year?: number;
  graduation_year?: number;
  target_role?: string;
  mobile_no?: string;
  age?: number;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  location?: string;
  skills?: string[];
  interests?: string[];
  goals?: string[];
  experience?: string;
  [key: string]: unknown;
}

/** Mirrors `toAuthUser` in backend/src/modules/auth/auth.dto.ts. */
export interface AuthUser {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string;
  profile_image_url: string | null;
  role: UserRole;
  auth_provider: "local" | "google";
  is_verified: boolean;
  onboarding_completed: boolean;
  profile: StudentProfile;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: AuthUser;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  first_name: string;
  last_name?: string;
  email: string;
  password: string;
  student_year?: number;
  otp: string;
}

const AUTH = "/api/v1/auth";

export function sendSignupOtp(email: string) {
  return apiClient.post<{ message: string; email: string }>(`${AUTH}/send-otp`, { email });
}

export function register(payload: RegisterPayload) {
  return apiClient.post<TokenResponse>(`${AUTH}/register`, payload);
}

export function login(payload: LoginPayload) {
  return apiClient.post<TokenResponse>(`${AUTH}/login`, payload);
}

export function getCurrentUser() {
  return apiClient.get<AuthUser>(`${AUTH}/me`);
}
