import type { Router } from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../src/app.js";
import { buildOpenApiDocument } from "../src/docs/openapi.js";
import { authUserSchema } from "../src/modules/auth/auth.schemas.js";
import { adminRouter } from "../src/modules/admin/admin.routes.js";
import { aiRouter } from "../src/modules/ai/ai.routes.js";
import { authRouter } from "../src/modules/auth/auth.routes.js";
import { dashboardRouter } from "../src/modules/dashboard/dashboard.routes.js";
import { feedbackRouter } from "../src/modules/feedback/feedback.routes.js";
import { notificationsRouter } from "../src/modules/notifications/notifications.routes.js";
import { resourcesRouter } from "../src/modules/resources/resources.routes.js";
import { skillsRouter } from "../src/modules/skills/skills.routes.js";
import {
  prepPdfsRouter,
  progressRouter,
  questionsRouter,
} from "../src/modules/questions/questions.routes.js";
import { tasksRouter } from "../src/modules/tasks/tasks.routes.js";
import { usersRouter } from "../src/modules/users/users.routes.js";
import { toAuthUser } from "../src/modules/auth/auth.dto.js";

const app = createApp();
const doc = buildOpenApiDocument();

/** Every router mounted under /api/v1, with its prefix. Add new modules here. */
const MOUNTED: [prefix: string, router: Router][] = [
  ["/api/v1/auth", authRouter],
  ["/api/v1/users", usersRouter],
  ["/api/v1/ai", aiRouter],
  ["/api/v1/skills", skillsRouter],
  ["/api/v1/dashboard", dashboardRouter],
  ["/api/v1/resources", resourcesRouter],
  ["/api/v1/tasks", tasksRouter],
  ["/api/v1/questions", questionsRouter],
  ["/api/v1/progress", progressRouter],
  ["/api/v1/prep-pdfs", prepPdfsRouter],
  ["/api/v1/notifications", notificationsRouter],
  ["/api/v1/feedback", feedbackRouter],
  ["/api/v1/admin", adminRouter],
];

function routesOf(prefix: string, router: Router) {
  return router.stack.flatMap((layer) => {
    const route = layer.route as { path: string; methods: Record<string, boolean> } | undefined;
    if (!route) return [];
    // Express writes params as :id and "/" for the prefix itself; OpenAPI uses {id} and no slash.
    const path = (prefix + route.path).replace(/\/$/, "").replace(/:(\w+)/g, "{$1}");
    return Object.keys(route.methods).map((method) => ({ method, path }));
  });
}

describe("OpenAPI docs", () => {
  it("documents every mounted route", () => {
    const undocumented = MOUNTED.flatMap(([prefix, router]) => routesOf(prefix, router)).filter(
      ({ method, path }) => !(doc.paths?.[path] as Record<string, unknown> | undefined)?.[method],
    );
    expect(undocumented).toEqual([]);
  });

  it("registers the shared schemas as components", () => {
    expect(Object.keys(doc.components?.schemas ?? {})).toEqual(
      expect.arrayContaining(["AuthUser", "TokenResponse", "ErrorResponse", "RegisterRequest"]),
    );
  });

  it("serves the spec and Swagger UI", async () => {
    const spec = await request(app).get("/docs/openapi.json");
    expect(spec.status).toBe(200);
    expect(spec.body.openapi).toBe("3.1.0");

    const ui = await request(app).get("/docs/").redirects(1);
    expect(ui.status).toBe(200);
    expect(ui.text).toContain("swagger-ui");
  });

  it("toAuthUser output matches the documented AuthUser schema", () => {
    const now = new Date();
    const user = toAuthUser({
      id: "4b7a3c1e-2f0d-4a6b-9c8e-1d2f3a4b5c6d",
      firstName: "Asha",
      lastName: null,
      email: "asha@college.edu",
      passwordHash: "x",
      googleId: null,
      authProvider: "LOCAL",
      role: "STUDENT",
      profileImageUrl: null,
      isVerified: true,
      isActive: true,
      isDeleted: false,
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
      profile: {
        id: "5c8b4d2f-3a1e-4b7c-8d9f-2e3a4b5c6d7e",
        userId: "4b7a3c1e-2f0d-4a6b-9c8e-1d2f3a4b5c6d",
        profileData: { student_year: 3 },
        onboardingCompletedAt: null,
        createdAt: now,
        updatedAt: now,
      },
    });
    expect(authUserSchema.parse(user)).toEqual(user);
    expect(user).not.toHaveProperty("password_hash");
  });
});
