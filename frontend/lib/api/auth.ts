import { apiClient } from "./client";

export type UserRole = "student" | "mentor" | "admin";

/** Mirrors `UserResponse` in backend/app/schemas/auth.py. */
export interface AuthUser {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string;
  mobile_no: string | null;
  age: number | null;
  gender: string | null;
  student_year: number | null;
  profile_image_url: string | null;
  role: UserRole;
  auth_provider: "local" | "google";
  is_verified: boolean;
  is_profile_completed: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
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
  return apiClient.post<{ success: boolean; message: string; email: string }>(`${AUTH}/send-otp`, {
    email,
  });
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
