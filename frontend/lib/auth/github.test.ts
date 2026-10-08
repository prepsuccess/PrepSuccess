import { describe, expect, it } from "vitest";
import { API_BASE_URL } from "@/lib/api/config";
import { githubSignInUrl } from "./github";
import { authErrorMessage } from "./google";

describe("githubSignInUrl", () => {
  it("points at the backend's GitHub start route, with next and nonce when given", () => {
    expect(githubSignInUrl()).toBe(new URL("/api/v1/auth/github", API_BASE_URL).toString());
    const url = new URL(githubSignInUrl("/questions?mine=1", "abc123"));
    expect(url.pathname).toBe("/api/v1/auth/github");
    expect(url.searchParams.get("next")).toBe("/questions?mine=1");
    expect(url.searchParams.get("nonce")).toBe("abc123");
  });
});

describe("authErrorMessage for GitHub", () => {
  it("explains each GitHub error, and keeps Google's messages", () => {
    expect(authErrorMessage("github_no_email")).toMatch(/no verified email/);
    expect(authErrorMessage("github_cancelled")).toBe("GitHub sign-in was cancelled.");
    expect(authErrorMessage("github_not_configured")).toMatch(/isn't available/);
    expect(authErrorMessage("github_failed")).toBe("GitHub sign-in didn't work. Please try again.");
    expect(authErrorMessage("google_cancelled")).toBe("Google sign-in was cancelled.");
    expect(authErrorMessage("google_failed")).toBe("Google sign-in didn't work. Please try again.");
  });
});
