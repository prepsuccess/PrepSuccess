import type { ZodOpenApiPathsObject } from "zod-openapi";

import { VALIDATION_422, bearerAuth, errors, ok } from "../../docs/helpers.js";
import { listResourcesQuerySchema, skillResourcesSchema } from "./resources.schemas.js";

export const resourcesPaths: ZodOpenApiPathsObject = {
  "/api/v1/resources": {
    get: {
      tags: ["Learning"],
      summary: "Learning resources for a skill",
      description:
        "Curated material for one skill: outside links (official docs, tutorials, practice sites) " +
        "and short notes hosted by PrepSuccess. Shown whenever a check lands below the pass mark, " +
        "so a gap always comes with something to study.",
      security: bearerAuth,
      requestParams: { query: listResourcesQuerySchema },
      responses: {
        ...ok(skillResourcesSchema, "The skill and its resources, notes and references first."),
        ...errors({
          401: "`UNAUTHORIZED` or `INVALID_TOKEN`.",
          404: "`SKILL_NOT_FOUND`.",
          ...VALIDATION_422,
        }),
      },
    },
  },
};
