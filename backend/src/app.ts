import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";

import { apiDocsEnabled, env, isProduction } from "./config/env.js";
import { docsRouter } from "./docs/docs.routes.js";
import { logger } from "./lib/logger.js";
import { errorHandler, notFound } from "./middleware/error-handler.js";
import { genRequestId } from "./middleware/request-id.js";
import { healthRouter } from "./modules/health/health.routes.js";
import { apiV1 } from "./routes/v1.js";

/** Builds the Express app without listening, so tests can drive it with supertest. */
export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  // Behind Render's proxy: trust one hop so rate limiting sees the real client IP.
  if (isProduction) app.set("trust proxy", 1);
  app.use(pinoHttp({ logger, genReqId: genRequestId }));
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGINS, credentials: true }));
  // Bulk question import sends up to 500 questions in one body.
  app.use("/api/v1/admin/questions/import", express.json({ limit: "5mb" }));
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  app.use("/health", healthRouter);
  app.use("/api/v1", apiV1);
  if (apiDocsEnabled) app.use("/docs", docsRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
