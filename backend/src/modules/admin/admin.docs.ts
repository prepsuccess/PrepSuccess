import { z } from "zod";
import type { ZodOpenApiOperationObject, ZodOpenApiPathsObject } from "zod-openapi";

import { VALIDATION_422, bearerAuth, errors, ok, successEnvelope } from "../../docs/helpers.js";
import {
  adminResourceListSchema,
  adminResourceSchema,
  adminSkillListSchema,
  adminSkillSchema,
  adminTaskListSchema,
  adminTaskSchema,
  adminUserListSchema,
  adminUserSchema,
  analyticsSchema,
  createResourceSchema,
  createSkillSchema,
  createTaskSchema,
  deletedSchema,
  idParamsSchema,
  listUsersQuerySchema,
  updateResourceSchema,
  updateSkillSchema,
  updateTaskSchema,
  updateUserSchema,
} from "./admin.schemas.js";

const adminOnly = {
  401: "`UNAUTHORIZED` or `INVALID_TOKEN`.",
  403: "`FORBIDDEN` — not an admin.",
  429: "`TOO_MANY_REQUESTS`.",
};
const json = <T>(schema: T) => ({ content: { "application/json": { schema } } });
const path = { path: idParamsSchema };

/** One admin operation: tagged, bearer-authenticated, with the admin-only errors. */
function op(
  summary: string,
  responses: ZodOpenApiOperationObject["responses"],
  extra: Partial<ZodOpenApiOperationObject> = {},
): ZodOpenApiOperationObject {
  return { tags: ["Admin"], summary, security: bearerAuth, ...extra, responses };
}

const pagedUsers = successEnvelope(adminUserListSchema).extend({
  meta: z.object({ page: z.number().int(), limit: z.number().int(), total: z.number().int() }),
});

export const adminPaths: ZodOpenApiPathsObject = {
  "/api/v1/admin/users": {
    get: op(
      "List users",
      {
        200: { description: "One page of users.", ...json(pagedUsers) },
        ...errors({ ...adminOnly, ...VALIDATION_422 }),
      },
      {
        description:
          "Search and filter accounts. Account fields only — no assessment results; admins never " +
          "browse an individual student's results (PRD-04 §4).",
        requestParams: { query: listUsersQuerySchema },
      },
    ),
  },
  "/api/v1/admin/users/{id}": {
    patch: op(
      "Activate, deactivate or change a user's role",
      {
        ...ok(adminUserSchema, "The updated user."),
        ...errors({
          ...adminOnly,
          400: "`CANNOT_CHANGE_SELF`.",
          404: "`USER_NOT_FOUND`.",
          ...VALIDATION_422,
        }),
      },
      {
        description:
          "Signs the user out of every session. A deactivated user can't log in or refresh; " +
          "their current access token lapses within 30 minutes.",
        requestParams: path,
        requestBody: json(updateUserSchema),
      },
    ),
  },
  "/api/v1/admin/analytics": {
    get: op(
      "Platform analytics",
      { ...ok(analyticsSchema, "Aggregates."), ...errors(adminOnly) },
      { description: "Totals and rates only — nothing that identifies a student." },
    ),
  },
  "/api/v1/admin/skills": {
    get: op("List skills (including inactive)", {
      ...ok(adminSkillListSchema, "Skills with resource, task and check counts."),
      ...errors(adminOnly),
    }),
    post: op(
      "Create a skill",
      {
        ...ok(adminSkillSchema, "Created.", "201"),
        ...errors({
          ...adminOnly,
          409: "`SLUG_TAKEN` — a skill that isn't deleted uses that slug.",
          ...VALIDATION_422,
        }),
      },
      {
        description:
          "Onboarding claims are matched against the built-in catalogue's aliases, so a new skill " +
          "can be checked from the skill list but isn't auto-matched from the chat yet. If a " +
          "deleted skill has the slug, it is restored with the new details instead.",
        requestBody: json(createSkillSchema),
      },
    ),
  },
  "/api/v1/admin/skills/{id}": {
    patch: op(
      "Update a skill",
      {
        ...ok(adminSkillSchema, "Updated."),
        ...errors({ ...adminOnly, 404: "`SKILL_NOT_FOUND`.", ...VALIDATION_422 }),
      },
      {
        description:
          "A new pass mark applies to new checks only; past results keep the threshold they were scored with. " +
          "Set `is_active: false` to hide a skill from students without deleting it.",
        requestParams: path,
        requestBody: json(updateSkillSchema),
      },
    ),
    delete: op(
      "Delete a skill (soft)",
      { ...ok(deletedSchema, "Deleted."), ...errors({ ...adminOnly, 404: "`SKILL_NOT_FOUND`." }) },
      {
        description: "Soft delete — students' past checks on it stay intact.",
        requestParams: path,
      },
    ),
  },
  "/api/v1/admin/skills/{id}/resources": {
    get: op(
      "List a skill's resources",
      {
        ...ok(adminResourceListSchema, "Resources."),
        ...errors({ ...adminOnly, 404: "`SKILL_NOT_FOUND`." }),
      },
      { requestParams: path },
    ),
  },
  "/api/v1/admin/skills/{id}/tasks": {
    get: op(
      "List a skill's practical tasks",
      {
        ...ok(adminTaskListSchema, "Tasks."),
        ...errors({ ...adminOnly, 404: "`SKILL_NOT_FOUND`." }),
      },
      { requestParams: path },
    ),
  },
  "/api/v1/admin/resources": {
    post: op(
      "Add a learning resource",
      {
        ...ok(adminResourceSchema, "Created.", "201"),
        ...errors({ ...adminOnly, 404: "`SKILL_NOT_FOUND`.", ...VALIDATION_422 }),
      },
      {
        description: "Either a `url` (http/https) or hosted `content` notes — exactly one.",
        requestBody: json(createResourceSchema),
      },
    ),
  },
  "/api/v1/admin/resources/{id}": {
    patch: op(
      "Update a learning resource",
      {
        ...ok(adminResourceSchema, "Updated."),
        ...errors({ ...adminOnly, 404: "`RESOURCE_NOT_FOUND`.", ...VALIDATION_422 }),
      },
      { requestParams: path, requestBody: json(updateResourceSchema) },
    ),
    delete: op(
      "Delete a learning resource (soft)",
      {
        ...ok(deletedSchema, "Deleted."),
        ...errors({ ...adminOnly, 404: "`RESOURCE_NOT_FOUND`." }),
      },
      { requestParams: path },
    ),
  },
  "/api/v1/admin/tasks": {
    post: op(
      "Add a practical task",
      {
        ...ok(adminTaskSchema, "Created.", "201"),
        ...errors({ ...adminOnly, 404: "`SKILL_NOT_FOUND`.", ...VALIDATION_422 }),
      },
      {
        description: "The rubric is what the AI scores against; aim for points that total 10.",
        requestBody: json(createTaskSchema),
      },
    ),
  },
  "/api/v1/admin/tasks/{id}": {
    patch: op(
      "Update a practical task",
      {
        ...ok(adminTaskSchema, "Updated."),
        ...errors({ ...adminOnly, 404: "`TASK_NOT_FOUND`.", ...VALIDATION_422 }),
      },
      { requestParams: path, requestBody: json(updateTaskSchema) },
    ),
    delete: op(
      "Delete a practical task (soft)",
      { ...ok(deletedSchema, "Deleted."), ...errors({ ...adminOnly, 404: "`TASK_NOT_FOUND`." }) },
      { description: "Soft delete — students' submissions stay intact.", requestParams: path },
    ),
  },
};
