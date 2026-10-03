import { z } from "zod";

import type { Notification } from "../../generated/prisma/client.js";

export const notificationIdParamsSchema = z.object({
  id: z.uuid("That notification doesn't exist."),
});

export const notificationSchema = z
  .object({
    id: z.uuid(),
    type: z.string().meta({ example: "TASK_REVIEWED" }),
    title: z.string().meta({ example: "Task passed: Top earners per department" }),
    body: z.string().nullable(),
    href: z.string().nullable().meta({ description: "App path to open.", example: "/tasks/…" }),
    read: z.boolean(),
    created_at: z.iso.datetime(),
  })
  .meta({ id: "Notification" });

export const notificationListSchema = z
  .object({
    notifications: z.array(notificationSchema).meta({ description: "Newest first (last 30)." }),
    unread_count: z.number().int(),
  })
  .meta({ id: "NotificationList" });

export type NotificationResponse = z.infer<typeof notificationSchema>;
export type NotificationListResponse = z.infer<typeof notificationListSchema>;

export function toNotification(n: Notification): NotificationResponse {
  return {
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    href: n.href,
    read: n.readAt !== null,
    created_at: n.createdAt.toISOString(),
  };
}
