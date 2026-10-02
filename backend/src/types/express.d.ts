// Express augmentations shared across the app. `req.id` and `req.log` come
// from pino-http; `req.user` is set by the requireAuth middleware.
import "pino-http";

import type { Role } from "../generated/prisma/client.js";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: Role };
    }
  }
}

export {};
