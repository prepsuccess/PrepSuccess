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
      // Fake Google client: the consent URL is built offline; the code exchange is mocked.
      GOOGLE_CLIENT_ID: "test-client-id.apps.googleusercontent.com",
      GOOGLE_CLIENT_SECRET: "test-client-secret",
      API_PUBLIC_URL: "http://localhost:8000",
      FRONTEND_URL: "http://localhost:3000",
      // Empty SMTP: emails are logged, never sent, during tests.
      SMTP_USER: "",
      SMTP_PASS: "",
    },
  },
});
