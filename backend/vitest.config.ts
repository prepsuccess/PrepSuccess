import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts", "src/**/*.test.ts"],
    env: {
      NODE_ENV: "test",
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/prepsuccess_test",
      JWT_ACCESS_SECRET: "test-access-secret-test-access-secret-0001",
      JWT_REFRESH_SECRET: "test-refresh-secret-test-refresh-secret-01",
      // Empty SMTP: emails are logged, never sent, during tests.
      SMTP_USER: "",
      SMTP_PASS: "",
    },
  },
});
