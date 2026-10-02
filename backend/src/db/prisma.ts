import { PrismaPg } from "@prisma/adapter-pg";

import { env, isProduction } from "../config/env.js";
import { PrismaClient } from "../generated/prisma/client.js";

/**
 * Single PrismaClient for the whole process, connected through the pooled
 * DATABASE_URL. In development, `tsx watch` re-imports modules on every
 * change, so the client is cached on globalThis to avoid exhausting
 * Supabase's connection limit.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: new PrismaPg({ connectionString: env.DATABASE_URL }) });

if (!isProduction) {
  globalForPrisma.prisma = prisma;
}
