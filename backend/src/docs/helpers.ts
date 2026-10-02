import "zod-openapi";

import { z } from "zod";
import type { ZodOpenApiResponsesObject } from "zod-openapi";

// Building blocks for every module's `<module>.docs.ts`: the response
// envelope, standard error responses and the bearer-auth requirement.

const meta = {
  request_id: z.uuid().meta({ description: "Echoes the X-Request-ID response header." }),
  timestamp: z.iso.datetime(),
};

/** `{ success: true, data, request_id, timestamp }` around a payload schema. */
export function successEnvelope<T extends z.ZodType>(data: T) {
  return z.object({ success: z.literal(true), data, ...meta });
}

const errorEnvelope = z
  .object({
    success: z.literal(false),
    error: z.object({
      code: z.string().meta({ example: "VALIDATION_ERROR" }),
      message: z.string().meta({ example: "Request validation failed." }),
      details: z.array(z.unknown()).meta({ description: "Validation issues, when relevant." }),
    }),
    ...meta,
  })
  .meta({ id: "ErrorResponse" });

/** A 2xx response wrapped in the success envelope. */
export function ok<T extends z.ZodType>(schema: T, description: string, status = "200") {
  return {
    [status]: {
      description,
      content: { "application/json": { schema: successEnvelope(schema) } },
    },
  } satisfies ZodOpenApiResponsesObject;
}

/** Error responses keyed by status, each listing the error codes it can return. */
export function errors(byStatus: Record<number, string>) {
  return Object.fromEntries(
    Object.entries(byStatus).map(([status, description]) => [
      status,
      { description, content: { "application/json": { schema: errorEnvelope } } },
    ]),
  ) satisfies ZodOpenApiResponsesObject;
}

export const VALIDATION_422 = { 422: "`VALIDATION_ERROR` — request body failed validation." };
export const RATE_LIMIT_429 = { 429: "`TOO_MANY_REQUESTS` — rate limit hit; wait a minute." };
export const bearerAuth = [{ bearerAuth: [] }];
