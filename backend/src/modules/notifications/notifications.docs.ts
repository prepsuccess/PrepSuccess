import type { ZodOpenApiPathsObject } from "zod-openapi";

import { VALIDATION_422, bearerAuth, errors, ok } from "../../docs/helpers.js";
import { notificationIdParamsSchema, notificationListSchema } from "./notifications.schemas.js";

const signedIn = { 401: "`UNAUTHORIZED` or `INVALID_TOKEN`." };

export const notificationsPaths: ZodOpenApiPathsObject = {
  "/api/v1/notifications": {
    get: {
      tags: ["Notifications"],
      summary: "My notifications",
      description:
        "The 30 newest in-app notifications (welcome, task feedback ready, password changed) and the unread count.",
      security: bearerAuth,
      responses: { ...ok(notificationListSchema, "Notifications."), ...errors(signedIn) },
    },
  },
  "/api/v1/notifications/{id}/read": {
    post: {
      tags: ["Notifications"],
      summary: "Mark one notification read",
      description: "Idempotent. Returns the updated list.",
      security: bearerAuth,
      requestParams: { path: notificationIdParamsSchema },
      responses: {
        ...ok(notificationListSchema, "Updated notifications."),
        ...errors({ ...signedIn, 404: "`NOTIFICATION_NOT_FOUND`.", ...VALIDATION_422 }),
      },
    },
  },
  "/api/v1/notifications/read-all": {
    post: {
      tags: ["Notifications"],
      summary: "Mark every notification read",
      security: bearerAuth,
      responses: { ...ok(notificationListSchema, "Updated notifications."), ...errors(signedIn) },
    },
  },
};
