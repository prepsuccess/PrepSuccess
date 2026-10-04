import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { AppError, sendError } from "../lib/http.js";
import { captureError } from "../lib/monitoring.js";

export function notFound(req: Request, _res: Response, next: NextFunction) {
  next(new AppError(404, "ROUTE_NOT_FOUND", `Route ${req.method} ${req.path} was not found.`));
}

/** body-parser (express.json) tags its errors with a `type`; these are client mistakes, not bugs. */
function bodyParserError(err: unknown): AppError | null {
  const type = typeof err === "object" && err !== null ? (err as { type?: unknown }).type : null;
  if (type === "entity.too.large") {
    return new AppError(413, "PAYLOAD_TOO_LARGE", "That request is too large.");
  }
  if (type === "entity.parse.failed") {
    return new AppError(400, "INVALID_JSON", "The request body isn't valid JSON.");
  }
  return null;
}

/** Last middleware in the chain: turns anything thrown into the error envelope. */
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    sendError(req, res, err);
    return;
  }

  if (err instanceof ZodError) {
    sendError(
      req,
      res,
      new AppError(422, "VALIDATION_ERROR", "Request validation failed.", err.issues),
    );
    return;
  }

  const clientError = bodyParserError(err);
  if (clientError) {
    sendError(req, res, clientError);
    return;
  }

  req.log.error({ err }, "Unhandled error");
  captureError(err, req);
  sendError(req, res, new AppError(500, "INTERNAL_SERVER_ERROR", "Something went wrong."));
}
