import type { ZodOpenApiPathsObject } from "zod-openapi";

import { bearerAuth, errors, ok } from "../../docs/helpers.js";
import { dashboardSchema, insightResponseSchema } from "./dashboard.schemas.js";

const studentOnly = {
  401: "`UNAUTHORIZED` or `INVALID_TOKEN`.",
  403: "`FORBIDDEN` — not a student.",
};

export const dashboardPaths: ZodOpenApiPathsObject = {
  "/api/v1/dashboard": {
    get: {
      tags: ["Dashboard"],
      summary: "My readiness dashboard",
      description:
        "Computed on read from the student's latest finished check per skill — no AI call. " +
        "Readiness is a weighted average of the category scores the student has (technical 50, " +
        "aptitude 30, soft 20, re-weighted over the categories checked so far). Next steps are " +
        "rule-based and always point at the student's own data.",
      security: bearerAuth,
      responses: {
        ...ok(dashboardSchema, "The dashboard."),
        ...errors(studentOnly),
      },
    },
  },
  "/api/v1/ai/insight": {
    get: {
      tags: ["AI"],
      summary: "My AI coach's take",
      description:
        "A short AI read of the student's results: summary, the gaps that matter for their target " +
        "role, and a plan for the week. Cached until the student's results change, so repeat calls " +
        "are free. Gaps about skills the student hasn't been checked on are dropped (grounding). " +
        "Returns `status: empty` without an AI call until the first check is finished.",
      security: bearerAuth,
      responses: {
        ...ok(insightResponseSchema, "The coach's take."),
        ...errors({
          ...studentOnly,
          429: "`AI_DAILY_LIMIT` or `TOO_MANY_REQUESTS`.",
          502: "`AI_BAD_RESPONSE` — try again.",
          503: "`AI_UNAVAILABLE` or `AI_NOT_CONFIGURED` — try again shortly.",
        }),
      },
    },
  },
};
