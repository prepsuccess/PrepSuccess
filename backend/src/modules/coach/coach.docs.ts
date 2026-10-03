import type { ZodOpenApiPathsObject } from "zod-openapi";

import { RATE_LIMIT_429, VALIDATION_422, bearerAuth, errors, ok } from "../../docs/helpers.js";
import { COACH_DAILY_LIMIT } from "./coach.logic.js";
import { coachMessageSchema, coachPingSchema, coachStateSchema } from "./coach.schemas.js";

const AUTH_401_403 = {
  401: "`UNAUTHORIZED` or `INVALID_TOKEN`.",
  403: "`FORBIDDEN` — students only.",
};

export const coachPaths: ZodOpenApiPathsObject = {
  "/api/v1/ai/coach": {
    get: {
      tags: ["AI"],
      summary: "My coach chat",
      description:
        "The student's coach conversation, how many messages are left today and starter questions. No AI call.",
      security: bearerAuth,
      responses: {
        ...ok(coachStateSchema, "The conversation and today's allowance."),
        ...errors(AUTH_401_403),
      },
    },
    delete: {
      tags: ["AI"],
      summary: "Start a new coach chat",
      description: "Clears the conversation. Today's message count is unchanged.",
      security: bearerAuth,
      responses: {
        ...ok(coachStateSchema, "The empty conversation."),
        ...errors({ ...AUTH_401_403, ...RATE_LIMIT_429 }),
      },
    },
  },
  "/api/v1/ai/coach/messages": {
    post: {
      tags: ["AI"],
      summary: "Ask the coach",
      description:
        `One AI call. The coach sees the student's profile, readiness, skill results, recent tasks and next ` +
        `steps, plus what PrepSuccess offers. ${COACH_DAILY_LIMIT} messages a day (midnight IST); a failed ` +
        "call doesn't count and nothing is saved.",
      security: bearerAuth,
      requestBody: { content: { "application/json": { schema: coachMessageSchema } } },
      responses: {
        ...ok(coachStateSchema, "The conversation with the coach's reply."),
        ...errors({
          ...AUTH_401_403,
          ...VALIDATION_422,
          429: "`COACH_DAILY_LIMIT`, `AI_DAILY_LIMIT` or `TOO_MANY_REQUESTS`.",
          503: "`AI_UNAVAILABLE` or `AI_NOT_CONFIGURED`.",
        }),
      },
    },
  },
  "/api/v1/ai/coach/ping": {
    post: {
      tags: ["AI"],
      summary: "I'm active (for the coach's check-in)",
      description:
        "The app calls this every few minutes while the tab is visible. A gap over 10 minutes starts a new " +
        "session. 30 minutes into a session, once a day, the coach writes a short tip into the chat and sends " +
        "a `COACH_NUDGE` notification. The tip doesn't use the student's AI allowance.",
      security: bearerAuth,
      responses: {
        ...ok(coachPingSchema, "Whether this ping sent the check-in."),
        ...errors({ ...AUTH_401_403, ...RATE_LIMIT_429 }),
      },
    },
  },
};
