import type { ZodOpenApiPathsObject } from "zod-openapi";

import { bearerAuth, errors, ok } from "../../docs/helpers.js";
import { mySkillsSchema, skillListSchema } from "./skills.schemas.js";

export const skillsPaths: ZodOpenApiPathsObject = {
  "/api/v1/skills": {
    get: {
      tags: ["Skills"],
      summary: "List the skill catalogue",
      description: "Every active skill — technical, aptitude and soft skills.",
      security: bearerAuth,
      responses: {
        ...ok(skillListSchema, "Active skills, grouped by topic."),
        ...errors({ 401: "`UNAUTHORIZED` or `INVALID_TOKEN`." }),
      },
    },
  },
  "/api/v1/skills/mine": {
    get: {
      tags: ["Skills"],
      summary: "My skills and latest results",
      description:
        "Every active skill, marked `claimed` when the student named it in the onboarding chat " +
        "(matched by name and common aliases — never guessed by AI), with any unfinished check " +
        "and the latest result. Students only.",
      security: bearerAuth,
      responses: {
        ...ok(mySkillsSchema, "The student's skills."),
        ...errors({
          401: "`UNAUTHORIZED` or `INVALID_TOKEN`.",
          403: "`FORBIDDEN` — not a student.",
        }),
      },
    },
  },
};
