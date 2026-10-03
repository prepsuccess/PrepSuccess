import type { ZodOpenApiPathsObject } from "zod-openapi";

import { VALIDATION_422, bearerAuth, errors, ok } from "../../docs/helpers.js";
import {
  listTasksQuerySchema,
  skillTasksSchema,
  submissionSchema,
  submitTaskSchema,
  taskDetailSchema,
  taskIdParamsSchema,
} from "./tasks.schemas.js";

const studentOnly = {
  401: "`UNAUTHORIZED` or `INVALID_TOKEN`.",
  403: "`FORBIDDEN` — not a student.",
};

export const tasksPaths: ZodOpenApiPathsObject = {
  "/api/v1/tasks": {
    get: {
      tags: ["Learning"],
      summary: "Practical tasks for a skill",
      description:
        "Small hands-on tasks for one skill, easiest first, with how many times the student " +
        "tried each and their best score.",
      security: bearerAuth,
      requestParams: { query: listTasksQuerySchema },
      responses: {
        ...ok(skillTasksSchema, "The skill and its tasks."),
        ...errors({ ...studentOnly, 404: "`SKILL_NOT_FOUND`.", ...VALIDATION_422 }),
      },
    },
  },
  "/api/v1/tasks/{id}": {
    get: {
      tags: ["Learning"],
      summary: "A task, its rubric and my attempts",
      security: bearerAuth,
      requestParams: { path: taskIdParamsSchema },
      responses: {
        ...ok(taskDetailSchema, "The task."),
        ...errors({ ...studentOnly, 404: "`TASK_NOT_FOUND`.", ...VALIDATION_422 }),
      },
    },
  },
  "/api/v1/tasks/{id}/submit": {
    post: {
      tags: ["Learning"],
      summary: "Submit an answer for AI review",
      description:
        "One AI call. The AI scores each rubric criterion and writes feedback; the total, the " +
        "percentage and pass/fail (60%) are computed by the server, never by the AI. The " +
        "submission is treated strictly as the answer to mark — instructions inside it are " +
        "ignored. Nothing is saved if the AI call fails.",
      security: bearerAuth,
      requestParams: { path: taskIdParamsSchema },
      requestBody: { content: { "application/json": { schema: submitTaskSchema } } },
      responses: {
        ...ok(submissionSchema, "The reviewed submission.", "201"),
        ...errors({
          ...studentOnly,
          404: "`TASK_NOT_FOUND`.",
          ...VALIDATION_422,
          429: "`AI_DAILY_LIMIT` or `TOO_MANY_REQUESTS`.",
          502: "`AI_BAD_RESPONSE` — try again.",
          503: "`AI_UNAVAILABLE` or `AI_NOT_CONFIGURED` — try again shortly.",
        }),
      },
    },
  },
};
