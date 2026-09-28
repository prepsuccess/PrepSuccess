import { describe, expect, it } from "vitest";
import { isValid, validateEmail, validateNewPassword, validateOtp } from "./validation";
import { safeNext } from "@/lib/auth/session";

describe("validation", () => {
  it("checks email shape", () => {
    expect(validateEmail("")).toBe("Enter your email.");
    expect(validateEmail("not-an-email")).toMatch(/valid email/);
    expect(validateEmail(" student@college.edu ")).toBeUndefined();
  });

  it("matches the backend's password length rule", () => {
    expect(validateNewPassword("short")).toBeDefined();
    expect(validateNewPassword("longenough")).toBeUndefined();
  });

  it("accepts only 6-digit codes", () => {
    expect(validateOtp("12345")).toBeDefined();
    expect(validateOtp("12a456")).toBeDefined();
    expect(validateOtp("123456")).toBeUndefined();
  });

  it("isValid is true only when every message is empty", () => {
    expect(isValid({ a: undefined, b: undefined })).toBe(true);
    expect(isValid({ a: undefined, b: "Required" })).toBe(false);
  });
});

describe("safeNext", () => {
  it("allows same-site paths only", () => {
    expect(safeNext("/dashboard")).toBe("/dashboard");
    expect(safeNext("//evil.example")).toBeNull();
    expect(safeNext("https://evil.example")).toBeNull();
    expect(safeNext(undefined)).toBeNull();
  });
});
