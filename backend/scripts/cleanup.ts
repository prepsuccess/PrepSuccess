/* eslint-disable no-console -- CLI output */
import { prisma } from "../src/db/prisma.js";

/**
 * Deletes rows that are no longer useful, so the free database doesn't fill
 * up: `npm run db:cleanup`. Run it monthly (or from a scheduled job); it's
 * safe to run at any time.
 *   - email codes older than 1 day (they expire after 10 minutes);
 *   - refresh tokens that expired, or were revoked, more than 7 days ago
 *     (recent revoked ones are kept so a replayed token is still recognised);
 *   - read notifications older than 90 days.
 * ai_usage is kept: it's the AI cost history.
 */
const DAY = 24 * 60 * 60 * 1000;
const ago = (days: number) => new Date(Date.now() - days * DAY);

const [otps, tokens, notifications] = await prisma.$transaction([
  prisma.emailOtp.deleteMany({ where: { createdAt: { lt: ago(1) } } }),
  prisma.refreshToken.deleteMany({
    where: { OR: [{ expiresAt: { lt: ago(7) } }, { revokedAt: { lt: ago(7) } }] },
  }),
  prisma.notification.deleteMany({
    where: { readAt: { not: null }, createdAt: { lt: ago(90) } },
  }),
]);

console.log(
  `Deleted ${otps.count} email codes, ${tokens.count} refresh tokens and ` +
    `${notifications.count} read notifications.`,
);
await prisma.$disconnect();
