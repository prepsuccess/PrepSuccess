import type { NextFunction, Request, Response } from "express";

import { prisma } from "../db/prisma.js";
import type { Role } from "../generated/prisma/client.js";
import { AppError } from "../lib/http.js";
import { verifyAccessToken } from "../modules/auth/tokens.js";

/**
 * Requires a valid `Authorization: Bearer <access token>` and sets `req.user`.
 * Pass roles to restrict a route, e.g. `requireAuth("ADMIN")`. Role checks
 * always happen here on the server — hiding a UI link is never enough.
 *
 * The token only proves who the caller is. The account is looked up on every
 * request (one primary-key read), so a deactivation, deletion or role change
 * applies immediately instead of when the access token expires.
 */
export function requireAuth(...roles: Role[]) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7).trim() : null;
    if (!token) {
      throw new AppError(401, "UNAUTHORIZED", "Sign in to continue.");
    }

    let claims;
    try {
      claims = verifyAccessToken(token);
    } catch {
      throw new AppError(401, "INVALID_TOKEN", "Your session has expired. Sign in again.");
    }

    const user = await prisma.user.findUnique({
      where: { id: claims.sub },
      select: { role: true, isActive: true, isDeleted: true },
    });
    if (!user || !user.isActive || user.isDeleted) {
      throw new AppError(401, "UNAUTHORIZED", "Sign in to continue.");
    }

    // The database role wins over the (possibly stale) role in the token.
    if (roles.length > 0 && !roles.includes(user.role)) {
      throw new AppError(403, "FORBIDDEN", "You don't have access to this.");
    }

    req.user = { id: claims.sub, role: user.role };
    next();
  };
}
