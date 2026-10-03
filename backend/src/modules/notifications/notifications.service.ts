import { prisma } from "../../db/prisma.js";
import { AppError } from "../../lib/http.js";
import { toNotification, type NotificationListResponse } from "./notifications.schemas.js";

const LIST_LIMIT = 30;

/** GET /notifications — the latest notifications and the unread count. */
export async function list(userId: string): Promise<NotificationListResponse> {
  const [notifications, unread] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: LIST_LIMIT,
    }),
    prisma.notification.count({ where: { userId, readAt: null } }),
  ]);
  return { notifications: notifications.map(toNotification), unread_count: unread };
}

/** POST /notifications/:id/read — idempotent; someone else's id looks missing. */
export async function markRead(userId: string, id: string) {
  const { count } = await prisma.notification.updateMany({
    where: { id, userId, readAt: null },
    data: { readAt: new Date() },
  });
  if (count === 0) {
    const exists = await prisma.notification.count({ where: { id, userId } });
    if (!exists)
      throw new AppError(404, "NOTIFICATION_NOT_FOUND", "That notification doesn't exist.");
  }
  return list(userId);
}

/** POST /notifications/read-all */
export async function markAllRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
  return list(userId);
}
