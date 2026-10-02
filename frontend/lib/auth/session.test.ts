import { describe, expect, it } from "vitest";
import { homeFor } from "./session";

describe("homeFor", () => {
  it("starts new students in the onboarding chat", () => {
    expect(homeFor({ role: "student", onboarding_completed: false })).toBe("/onboarding");
    expect(homeFor({ role: "student", onboarding_completed: true })).toBe("/dashboard");
  });

  it("never sends admins or mentors to onboarding", () => {
    expect(homeFor({ role: "admin", onboarding_completed: false })).toBe("/admin");
    expect(homeFor({ role: "mentor", onboarding_completed: false })).toBe("/dashboard");
  });
});
