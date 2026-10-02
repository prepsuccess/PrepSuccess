import type { ZodOpenApiPathsObject } from "zod-openapi";

import { VALIDATION_422, bearerAuth, errors, ok } from "../../docs/helpers.js";
import {
  onboardingReplySchema,
  onboardingStateSchema,
  sendMessageSchema,
} from "./onboarding.schemas.js";

export const onboardingPaths: ZodOpenApiPathsObject = {
  "/api/v1/ai/onboarding": {
    get: {
      tags: ["AI"],
      summary: "Get my onboarding chat",
      description:
        "Returns the conversation so far and which details are collected. The first call starts the chat with a fixed greeting (no AI call).",
      security: bearerAuth,
      responses: {
        ...ok(onboardingStateSchema, "The onboarding conversation and progress."),
        ...errors({ 401: "`UNAUTHORIZED` or `INVALID_TOKEN`." }),
      },
    },
  },
  "/api/v1/ai/onboarding/messages": {
    post: {
      tags: ["AI"],
      summary: "Send a message in the onboarding chat",
      description:
        "One turn: the AI replies and extracts profile facts from the message. Extracted facts are validated with the same rules as a manual profile edit and merged in (skills and goals accumulate). Onboarding completes once degree, year, skills, target role and goals are collected — decided by the server, not the AI. Nothing is saved if the AI call fails.",
      security: bearerAuth,
      requestBody: { content: { "application/json": { schema: sendMessageSchema } } },
      responses: {
        ...ok(onboardingReplySchema, "The AI's reply, updated progress and the updated user."),
        ...errors({
          400: "`ONBOARDING_TOO_LONG` — the chat hit its turn limit.",
          401: "`UNAUTHORIZED` or `INVALID_TOKEN`.",
          403: "`AI_TRIAL_ENDED` (only when the trial is enforced).",
          409: "`ONBOARDING_COMPLETE` — already done; edit the profile instead.",
          ...VALIDATION_422,
          429: "`AI_DAILY_LIMIT` or `TOO_MANY_REQUESTS`.",
          502: "`AI_BAD_RESPONSE` — try again.",
          503: "`AI_UNAVAILABLE` or `AI_NOT_CONFIGURED` — try again shortly.",
        }),
      },
    },
  },
};
