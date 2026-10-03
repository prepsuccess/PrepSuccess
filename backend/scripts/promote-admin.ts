/* eslint-disable no-console -- CLI output */
import { prisma } from "../src/db/prisma.js";

/**
 * Makes an existing account an admin: `npm run admin:promote -- you@example.com`.
 * There's no signup path to admin by design; the first admin is created
 * here, and after that admins can change roles from the admin panel. The
 * user's sessions are revoked so they sign in again with the new role.
 */
const email = process.argv[2]?.trim().toLowerCase();
if (!email) {
  console.error("Usage: npm run admin:promote -- <email>");
  process.exit(1);
}

const user = await prisma.user.findUnique({ where: { email } });
if (!user || user.isDeleted) {
  console.error(`No account for ${email}. Sign up first, then run this again.`);
  await prisma.$disconnect();
  process.exit(1);
}

await prisma.$transaction([
  prisma.user.update({ where: { id: user.id }, data: { role: "ADMIN", isActive: true } }),
  prisma.refreshToken.updateMany({
    where: { userId: user.id, revokedAt: null },
    data: { revokedAt: new Date() },
  }),
]);
console.log(`${email} is now an admin. Sign in again to use the admin panel.`);
await prisma.$disconnect();
