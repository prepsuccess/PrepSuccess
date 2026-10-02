import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma CLI config (migrate, studio, db pull). Migrations need a direct
// connection, so they use Supabase's DIRECT_URL (port 5432); the running app
// uses the pooled DATABASE_URL via the adapter in src/db/prisma.ts.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DIRECT_URL"] || process.env["DATABASE_URL"],
  },
});
