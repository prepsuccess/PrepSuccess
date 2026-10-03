import { prisma } from "../../db/prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";
import { logger } from "../../lib/logger.js";

/**
 * In-app notifications (PRD-04 §3.2). Any module can call `notify()`; it never
 * throws, so a failed write is logged and the action that triggered it
 * (a task review, a password reset) still succeeds.
 */

export type NotificationType = "WELCOME" | "TASK_REVIEWED" | "PASSWORD_CHANGED";

export interface NewNotification {
  type: NotificationType;
  title: string;
  body?: string;
  /** App path to open, e.g. /tasks/<id>. */
  href?: string;
  payload?: Prisma.InputJsonObject;
}

export async function notify(userId: string, notification: NewNotification) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type: notification.type,
        title: notification.title.slice(0, 200),
        body: notification.body?.slice(0, 1000) ?? null,
        href: notification.href ?? null,
        payload: notification.payload ?? {},
      },
    });
  } catch (error) {
    logger.error({ err: error, userId, type: notification.type }, "Notification write failed");
  }
}
