import type { ZodOpenApiPathsObject } from "zod-openapi";

import { RATE_LIMIT_429, VALIDATION_422, bearerAuth, errors, ok } from "../../docs/helpers.js";
import { authUserSchema } from "../auth/auth.schemas.js";
import { updateMeSchema } from "./users.schemas.js";

export const usersPaths: ZodOpenApiPathsObject = {
  "/api/v1/users/me": {
    get: {
      tags: ["Users"],
      summary: "Get my account and profile",
      security: bearerAuth,
      responses: {
        ...ok(authUserSchema, "The signed-in user, including `profile`."),
        ...errors({ 401: "`UNAUTHORIZED` or `INVALID_TOKEN`." }),
      },
    },
    patch: {
      tags: ["Users"],
      summary: "Update my name and/or profile",
      description:
        "Profile fields are **merged**: fields you don't send are kept (including anything the AI onboarding " +
        "collected), and `null` clears a field. Unknown fields are rejected.",
      security: bearerAuth,
      requestBody: { content: { "application/json": { schema: updateMeSchema } } },
      responses: {
        ...ok(authUserSchema, "The updated user."),
        ...errors({
          401: "`UNAUTHORIZED` or `INVALID_TOKEN`.",
          ...VALIDATION_422,
          ...RATE_LIMIT_429,
        }),
      },
    },
  },
};
