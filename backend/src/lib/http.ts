import type { Request, Response } from "express";

/**
 * Unified response envelope (docs/PRODUCTION_STANDARDS.md §1.1).
 * Every route responds through `sendSuccess`, and every failure is thrown as
 * an `AppError` and rendered by the error-handler middleware.
 */

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details: unknown[] = [],
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function sendSuccess<T>(
  req: Request,
  res: Response,
  data: T,
  { status = 200, meta }: { status?: number; meta?: PaginationMeta } = {},
) {
  res.status(status).json({
    success: true,
    data,
    ...(meta ? { meta } : {}),
    request_id: req.id,
    timestamp: new Date().toISOString(),
  });
}

export function sendError(req: Request, res: Response, error: AppError) {
  res.status(error.status).json({
    success: false,
    error: { code: error.code, message: error.message, details: error.details },
    request_id: req.id,
    timestamp: new Date().toISOString(),
  });
}
