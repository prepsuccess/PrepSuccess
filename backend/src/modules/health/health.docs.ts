import { z } from "zod";
import type { ZodOpenApiPathsObject } from "zod-openapi";

import { errors, ok } from "../../docs/helpers.js";

const status = z.object({ status: z.literal("ok") });

export const healthPaths: ZodOpenApiPathsObject = {
  "/health/live": {
    get: {
      tags: ["Health"],
      summary: "Liveness — the process is running",
      responses: ok(status, "Process is up."),
    },
  },
  "/health/ready": {
    get: {
      tags: ["Health"],
      summary: "Readiness — the database is reachable",
      responses: {
        ...ok(status.extend({ database: z.literal("ok") }), "Ready to serve traffic."),
        ...errors({ 503: "`SERVICE_UNAVAILABLE` — database not reachable." }),
      },
    },
  },
};
