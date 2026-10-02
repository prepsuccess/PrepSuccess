import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";

/**
 * Correlation ID (docs/PRODUCTION_STANDARDS.md §1.2): reuse the caller's
 * X-Request-ID or mint a UUID, and echo it back on the response. Passed to
 * pino-http as `genReqId`, which sets `req.id` and tags every log line.
 */
export function genRequestId(req: IncomingMessage, res: ServerResponse): string {
  const incoming = req.headers["x-request-id"];
  const id = typeof incoming === "string" && incoming.length <= 128 ? incoming : randomUUID();
  res.setHeader("X-Request-ID", id);
  return id;
}
