import { describe, expect, it } from "vitest";
import { homeFor, safeNext } from "./session";

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

describe("safeNext", () => {
  it("keeps same-site paths with their query and hash", () => {
    expect(safeNext("/dashboard")).toBe("/dashboard");
    expect(safeNext("/learn/html?tab=tasks#t2")).toBe("/learn/html?tab=tasks#t2");
  });

  it.each([
    ["protocol-relative", "//evil.com"],
    ["absolute", "https://evil.com"],
    ["backslash", "/\\evil.com"],
    ["backslash later on", "/profile\\..\\..\\evil.com"],
    ["tab", "/\t/evil.com"],
    ["newline", "/\n/evil.com"],
    ["carriage return", "/\r/evil.com"],
    ["null byte", "/\u0000/evil.com"],
    ["not a path", "dashboard"],
    ["javascript", "javascript:alert(1)"],
  ])("rejects a %s redirect", (_case, next) => {
    expect(safeNext(next)).toBeNull();
  });

  it("rejects nothing at all", () => {
    expect(safeNext(undefined)).toBeNull();
    expect(safeNext(null)).toBeNull();
    expect(safeNext("")).toBeNull();
  });
});
