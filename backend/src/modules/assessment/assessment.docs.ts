import type { ZodOpenApiPathsObject } from "zod-openapi";
import { z } from "zod";

import { VALIDATION_422, bearerAuth, errors, ok } from "../../docs/helpers.js";
import {
  answerSchema,
  assessmentStateSchema,
  startAssessmentSchema,
} from "./assessment.schemas.js";

const idParam = z.object({ id: z.uuid().meta({ description: "Assessment id." }) });
const notStudent = { 403: "`FORBIDDEN` — not a student." };
const auth401 = { 401: "`UNAUTHORIZED` or `INVALID_TOKEN`." };

export const assessmentPaths: ZodOpenApiPathsObject = {
  "/api/v1/ai/assessment/start": {
    post: {
      tags: ["AI"],
      summary: "Start (or resume) a skill check",
      description:
        "Resumes an unfinished check on the skill if there is one (question_count is ignored then). Otherwise " +
        "starts a check of question_count questions (10-30, default 10) drawn from the skill's shared question " +
        "bank, preferring ones this student hasn't seen. If the bank is short of fresh questions, the AI first " +
        "adds a batch (the bank grows to 100 per skill), so most starts make no AI call. The first question, a " +
        "medium one, is returned. Correct answers never leave the server until a question is answered.",
      security: bearerAuth,
      requestBody: { content: { "application/json": { schema: startAssessmentSchema } } },
      responses: {
        ...ok(assessmentStateSchema, "The check, with the question to answer."),
        ...errors({
          ...auth401,
          403: "`FORBIDDEN` — not a student; `AI_TRIAL_ENDED` (only when enforced).",
          404: "`SKILL_NOT_FOUND`.",
          ...VALIDATION_422,
          429: "`AI_DAILY_LIMIT` or `TOO_MANY_REQUESTS`.",
          502: "`AI_BAD_RESPONSE` — try again.",
          503: "`AI_UNAVAILABLE`, `AI_NOT_CONFIGURED` or `NOT_ENOUGH_QUESTIONS` — try again shortly.",
        }),
      },
    },
  },
  "/api/v1/ai/assessment/{id}": {
    get: {
      tags: ["AI"],
      summary: "Get a skill check",
      description:
        "The check so far: the current question, answered ones, and the result once complete.",
      security: bearerAuth,
      requestParams: { path: idParam },
      responses: {
        ...ok(assessmentStateSchema, "The check."),
        ...errors({ ...auth401, ...notStudent, 404: "`ASSESSMENT_NOT_FOUND`." }),
      },
    },
  },
  "/api/v1/ai/assessment/{id}/answer": {
    post: {
      tags: ["AI"],
      summary: "Answer the current question",
      description:
        "The server marks the answer (no AI call). The next question is harder after a right answer and " +
        `easier after a wrong one. After the last question the check is scored: points (easy 1, medium 2, ` +
        "hard 3) as a percentage of a perfect run, mastered at or above the skill's pass mark.",
      security: bearerAuth,
      requestParams: { path: idParam },
      requestBody: { content: { "application/json": { schema: answerSchema } } },
      responses: {
        ...ok(assessmentStateSchema, "The check after this answer; `result` is set once complete."),
        ...errors({
          ...auth401,
          ...notStudent,
          404: "`ASSESSMENT_NOT_FOUND`.",
          409: "`ASSESSMENT_COMPLETE`, or `QUESTION_ALREADY_ANSWERED` (stale question id or double submit).",
          ...VALIDATION_422,
        }),
      },
    },
  },
};
