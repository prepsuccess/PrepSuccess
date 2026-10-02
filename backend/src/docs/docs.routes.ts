import { Router } from "express";
import swaggerUi from "swagger-ui-express";

import { buildOpenApiDocument } from "./openapi.js";

/**
 * Interactive API docs at /docs (Swagger UI) and the raw spec at
 * /docs/openapi.json. Mounted only when API_DOCS_ENABLED is true — on by
 * default outside production.
 */
export const docsRouter = Router();

const document = buildOpenApiDocument();

docsRouter.get("/openapi.json", (_req, res) => {
  res.json(document);
});

docsRouter.use(
  "/",
  swaggerUi.serve,
  swaggerUi.setup(document, {
    customSiteTitle: "PrepSuccess API",
    swaggerOptions: { persistAuthorization: true, displayRequestDuration: true },
  }),
);
