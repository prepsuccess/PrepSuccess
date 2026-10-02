import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../src/app.js";

const app = createApp();

describe("health", () => {
  it("GET /health/live returns the success envelope", async () => {
    const res = await request(app).get("/health/live");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, data: { status: "ok" } });
    expect(res.body.request_id).toBe(res.headers["x-request-id"]);
  });

  it("echoes an incoming X-Request-ID", async () => {
    const res = await request(app).get("/health/live").set("X-Request-ID", "test-123");

    expect(res.headers["x-request-id"]).toBe("test-123");
    expect(res.body.request_id).toBe("test-123");
  });

  it("unknown routes return the error envelope", async () => {
    const res = await request(app).get("/api/v1/does-not-exist");

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ success: false, error: { code: "ROUTE_NOT_FOUND" } });
  });
});
