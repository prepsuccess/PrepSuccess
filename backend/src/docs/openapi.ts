import { createDocument, type ZodOpenApiPathsObject } from "zod-openapi";

import { aiPaths } from "../modules/ai/ai.docs.js";
import { assessmentPaths } from "../modules/assessment/assessment.docs.js";
import { authPaths } from "../modules/auth/auth.docs.js";
import { healthPaths } from "../modules/health/health.docs.js";
import { onboardingPaths } from "../modules/onboarding/onboarding.docs.js";
import { skillsPaths } from "../modules/skills/skills.docs.js";
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
  ...onboardingPaths,
  ...assessmentPaths,
  ...skillsPaths,
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
          "Email + password signup with OTP, login, token refresh (SCRUM-11) and Google sign-in (SCRUM-12).",
      },
      { name: "Users", description: "The signed-in user's own account and profile (SCRUM-13)." },
      {
        name: "AI",
        description: "AI trial status, the onboarding chat and adaptive skill checks.",
      },
      { name: "Skills", description: "The skill catalogue and the student's skills (SCRUM-14)." },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
    paths,
  });
}
