import type { ZodOpenApiPathsObject } from "zod-openapi";

import { bearerAuth, errors, ok } from "../../docs/helpers.js";
import { aiStatusSchema } from "./ai.schemas.js";

export const aiPaths: ZodOpenApiPathsObject = {
  "/api/v1/ai/status": {
    get: {
      tags: ["AI"],
      summary: "My AI free-trial and daily usage",
      description:
        "AI is free during a trial that starts at signup. Every AI call is metered; the daily limit " +
        "protects the shared free-tier quota and resets at midnight IST.",
      security: bearerAuth,
      responses: {
        ...ok(aiStatusSchema, "Trial and quota status."),
        ...errors({ 401: "`UNAUTHORIZED` or `INVALID_TOKEN`." }),
      },
    },
  },
};
