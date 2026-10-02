import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../src/app.js";
import { signAccessToken } from "../src/modules/auth/tokens.js";
import { updateMeSchema } from "../src/modules/users/users.schemas.js";

// Validation runs before any database access, so these need no Postgres.
// The merge behaviour is checked manually against a real database.

const app = createApp();
const token = signAccessToken("4b7a3c1e-2f0d-4a6b-9c8e-1d2f3a4b5c6d", "STUDENT");
const patch = (body: unknown) =>
  request(app)
    .patch("/api/v1/users/me")
    .set("Authorization", `Bearer ${token}`)
    .send(body as object);

describe("PATCH /users/me — validation", () => {
  it("requires a token", async () => {
    const res = await request(app).patch("/api/v1/users/me").send({ first_name: "Asha" });
    expect(res.status).toBe(401);
  });

  it("rejects an empty update", async () => {
    const res = await patch({});
    expect(res.status).toBe(422);
  });

  it("rejects unknown profile fields", async () => {
    const res = await patch({ profile: { favourite_colour: "blue" } });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects unknown top-level fields such as role", async () => {
    const res = await patch({ first_name: "Asha", role: "admin" });
    expect(res.status).toBe(422);
  });

  it("rejects a bad phone number and an out-of-range year", async () => {
    const res = await patch({ profile: { mobile_no: "call me", student_year: 9 } });
    expect(res.status).toBe(422);
    const paths = res.body.error.details.map((issue: { path: string[] }) => issue.path.join("."));
    expect(paths).toEqual(expect.arrayContaining(["profile.mobile_no", "profile.student_year"]));
  });
});

describe("updateMeSchema", () => {
  it("accepts null to clear a profile field and trims strings", () => {
    const parsed = updateMeSchema.parse({
      first_name: "  Asha ",
      profile: { mobile_no: null, college: " Christ University ", skills: ["HTML", "CSS"] },
    });
    expect(parsed).toEqual({
      first_name: "Asha",
      profile: { mobile_no: null, college: "Christ University", skills: ["HTML", "CSS"] },
    });
  });

  it("accepts Indian and international phone formats", () => {
    for (const mobile_no of ["9876543210", "+91 98765 43210", "+1-415-555-0100"]) {
      expect(updateMeSchema.safeParse({ profile: { mobile_no } }).success).toBe(true);
    }
  });
});
