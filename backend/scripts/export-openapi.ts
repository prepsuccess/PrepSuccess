import { writeFileSync } from "node:fs";

import { buildOpenApiDocument } from "../src/docs/openapi.js";

// Writes the OpenAPI spec to backend/openapi.json without starting the server.
// The frontend generates its API types from this file (`npm run api:types` there).
const path = new URL("../openapi.json", import.meta.url);
writeFileSync(path, `${JSON.stringify(buildOpenApiDocument(), null, 2)}\n`);
process.stdout.write(`Wrote ${path.pathname}\n`);
