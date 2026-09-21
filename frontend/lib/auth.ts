import { apiClient } from "./api-client";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface Credentials {
  email: string;
  password: string;
}

export function login(credentials: Credentials) {
  return apiClient.post<{ user: AuthUser }>("/api/v1/auth/login", credentials);
}

export function signup(credentials: Credentials & { name: string }) {
  return apiClient.post<{ user: AuthUser }>("/api/v1/auth/signup", credentials);
}

export function logout() {
  return apiClient.post<void>("/api/v1/auth/logout");
}

export function getCurrentUser() {
  return apiClient.get<{ user: AuthUser | null }>("/api/v1/auth/me");
}
