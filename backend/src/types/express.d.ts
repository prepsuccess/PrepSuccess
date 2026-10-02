// Express augmentations shared across the app. `req.id` and `req.log` come
// from pino-http; add `req.user` here when the auth middleware lands (SCRUM-11).
import "pino-http";

export {};
