import { createDocument, type ZodOpenApiPathsObject } from "zod-openapi";

import { adminPaths } from "../modules/admin/admin.docs.js";
import { aiPaths } from "../modules/ai/ai.docs.js";
import { coachPaths } from "../modules/coach/coach.docs.js";
import { assessmentPaths } from "../modules/assessment/assessment.docs.js";
import { authPaths } from "../modules/auth/auth.docs.js";
import { dashboardPaths } from "../modules/dashboard/dashboard.docs.js";
import { healthPaths } from "../modules/health/health.docs.js";
import { notificationsPaths } from "../modules/notifications/notifications.docs.js";
import { onboardingPaths } from "../modules/onboarding/onboarding.docs.js";
import { resourcesPaths } from "../modules/resources/resources.docs.js";
import { skillsPaths } from "../modules/skills/skills.docs.js";
import { tasksPaths } from "../modules/tasks/tasks.docs.js";
import { usersPaths } from "../modules/users/users.docs.js";

/**
 * OpenAPI 3.1 document for the whole API, generated from the same zod schemas
 * that validate requests. Every module exports a `<module>Paths` object from
 * its `<module>.docs.ts`; add it to `paths` below when the module is mounted.
 */

const paths: ZodOpenApiPathsObject = {
  ...healthPaths,
  ...authPaths,
  ...usersPaths,
  ...aiPaths,
  ...coachPaths,
  ...onboardingPaths,
  ...assessmentPaths,
  ...skillsPaths,
  ...dashboardPaths,
  ...resourcesPaths,
  ...tasksPaths,
  ...notificationsPaths,
  ...adminPaths,
};

export function buildOpenApiDocument() {
  return createDocument({
    openapi: "3.1.0",
    info: {
      title: "PrepSuccess API",
      version: "0.1.0",
      description: [
        "Backend for PrepSuccess — Phase 1 (AI-first MVP).",
        "",
        "**Responses** always use one envelope: `{ success: true, data, request_id, timestamp }` on success,",
        "`{ success: false, error: { code, message, details }, request_id, timestamp }` on failure.",
        "",
        "**Auth**: call `/api/v1/auth/login`, copy `access_token`, click **Authorize** and paste it.",
      ].join("\n"),
    },
    servers: [{ url: "/" }],
    tags: [
      { name: "Health", description: "Liveness and readiness probes." },
      {
        name: "Auth",
        description:
          "Email + password signup with OTP, login, token refresh and password reset (SCRUM-11), and Google sign-in (SCRUM-12).",
      },
      { name: "Users", description: "The signed-in user's own account and profile (SCRUM-13)." },
      {
        name: "AI",
        description:
          "AI trial status, the onboarding chat, adaptive skill checks and the coach's take.",
      },
      { name: "Skills", description: "The skill catalogue and the student's skills (SCRUM-14)." },
      { name: "Dashboard", description: "The student's readiness at a glance (SCRUM-15)." },
      {
        name: "Learning",
        description:
          "Learning resources for weak skills and AI-reviewed practical tasks (SCRUM-125, SCRUM-126).",
      },
      { name: "Notifications", description: "In-app notifications (SCRUM-48)." },
      {
        name: "Admin",
        description:
          "Users, aggregate analytics and content management. Admins only, enforced on the server (PRD-04).",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
    paths,
  });
}
