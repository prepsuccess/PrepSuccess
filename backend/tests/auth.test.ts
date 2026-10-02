import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../src/app.js";
import { durationToMs, generateOtp, hashSecret, safeEqual } from "../src/lib/crypto.js";
import { errorHandler } from "../src/middleware/error-handler.js";
import { requireAuth } from "../src/middleware/require-auth.js";
import { loginSchema } from "../src/modules/auth/auth.schemas.js";
import { signAccessToken, verifyAccessToken } from "../src/modules/auth/tokens.js";

// These tests cover everything that doesn't need a database: validation,
// tokens and the auth guard. The full signup → login → refresh flow is
// exercised against a real Postgres (see backend/README.md).

const app = createApp();
const USER_ID = "4b7a3c1e-2f0d-4a6b-9c8e-1d2f3a4b5c6d";

describe("crypto helpers", () => {
  it("parses TTL durations", () => {
    expect(durationToMs("30m")).toBe(30 * 60_000);
    expect(durationToMs("7d")).toBe(7 * 86_400_000);
    expect(() => durationToMs("7 days")).toThrow();
  });

  it("generates 6-digit OTPs", () => {
    for (let i = 0; i < 50; i++) expect(generateOtp()).toMatch(/^\d{6}$/);
  });

  it("hashes deterministically and compares safely", () => {
    expect(hashSecret("abc")).toBe(hashSecret("abc"));
    expect(hashSecret("abc")).not.toBe(hashSecret("abd"));
    expect(safeEqual(hashSecret("abc"), hashSecret("abc"))).toBe(true);
    expect(safeEqual("short", "longer-value")).toBe(false);
  });
});

describe("access tokens", () => {
  it("round-trips subject and role", () => {
    const claims = verifyAccessToken(signAccessToken(USER_ID, "STUDENT"));
    expect(claims).toEqual({ sub: USER_ID, role: "STUDENT" });
  });

  it("rejects a token signed with another secret", () => {
    const forged = jwt.sign({ role: "ADMIN" }, "not-the-real-secret", { subject: USER_ID });
    expect(() => verifyAccessToken(forged)).toThrow();
  });

  it("rejects the 'none' algorithm", () => {
    const unsigned = jwt.sign({ role: "ADMIN", sub: USER_ID }, "", { algorithm: "none" });
    expect(() => verifyAccessToken(unsigned)).toThrow();
  });
});

describe("requireAuth", () => {
  const guarded = express();
  guarded.use((req, _res, next) => {
    // pino-http normally sets these; the error envelope reads req.id.
    Object.assign(req, { id: "test", log: { error: () => {} } });
    next();
  });
  guarded.get("/any", requireAuth(), (req, res) => res.json({ user: req.user }));
  guarded.get("/admin", requireAuth("ADMIN"), (_req, res) => res.json({ ok: true }));
  guarded.use(errorHandler);

  it("401s without a token", async () => {
    const res = await request(guarded).get("/any");
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("401s with a garbage token", async () => {
    const res = await request(guarded).get("/any").set("Authorization", "Bearer nope");
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("INVALID_TOKEN");
  });

  it("sets req.user for a valid token", async () => {
    const token = signAccessToken(USER_ID, "STUDENT");
    const res = await request(guarded).get("/any").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({ id: USER_ID, role: "STUDENT" });
  });

  it("403s when the role isn't allowed", async () => {
    const token = signAccessToken(USER_ID, "STUDENT");
    const res = await request(guarded).get("/admin").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });
});

describe("email normalization", () => {
  it("trims and lowercases before validating", () => {
    expect(loginSchema.parse({ email: "  Asha@College.EDU ", password: "x" }).email).toBe(
      "asha@college.edu",
    );
  });
});

describe("auth routes — validation", () => {
  it("rejects a malformed email on send-otp", async () => {
    const res = await request(app).post("/api/v1/auth/send-otp").send({ email: "not-an-email" });
    expect(res.status).toBe(422);
    expect(res.body).toMatchObject({ success: false, error: { code: "VALIDATION_ERROR" } });
  });

  it("rejects a short password and a bad OTP on register", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      first_name: "Asha",
      email: "asha@college.edu",
      password: "short",
      otp: "12ab",
    });
    expect(res.status).toBe(422);
    const fields = res.body.error.details.map((issue: { path: string[] }) => issue.path[0]);
    expect(fields).toEqual(expect.arrayContaining(["password", "otp"]));
  });

  it("requires a token for /me", async () => {
    const res = await request(app).get("/api/v1/auth/me");
    expect(res.status).toBe(401);
  });
});
