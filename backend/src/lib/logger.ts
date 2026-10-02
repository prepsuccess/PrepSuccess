import { pino } from "pino";

import { env, isProduction } from "../config/env.js";

/** Structured JSON logs in production; pretty-printed locally. Never use console.log in app code. */
export const logger = pino({
  level: env.NODE_ENV === "test" ? "silent" : env.LOG_LEVEL,
  ...(isProduction ? {} : { transport: { target: "pino-pretty", options: { colorize: true } } }),
});
