import { z } from "zod";

import type {
  LearningResource,
  PracticalTask,
  Skill,
  User,
} from "../../generated/prisma/client.js";
import { parseRubric } from "../tasks/tasks.logic.js";
import { resourceSchema, resourceTypes, toResource } from "../resources/resources.schemas.js";
import { rubricCriterionSchema } from "../tasks/tasks.schemas.js";

// Admin API shapes (PRD-04 §3.1). Users are returned with account fields only
// — never assessment results — and analytics are aggregates only.

export const idParamsSchema = z.object({ id: z.uuid("That record doesn't exist.") });

const roles = ["student", "mentor", "admin"] as const;
const categories = ["technical", "aptitude", "soft"] as const;
const difficulties = ["easy", "medium", "hard"] as const;

// ---- Users -----------------------------------------------------------------

export const listUsersQuerySchema = z
  .object({
    q: z.string().trim().max(100).optional().meta({ description: "Matches name or email." }),
    role: z.enum(roles).optional(),
    status: z.enum(["active", "inactive"]).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .meta({ id: "AdminListUsersQuery" });

export const adminUserSchema = z
  .object({
    id: z.uuid(),
    first_name: z.string(),
    last_name: z.string().nullable(),
    email: z.string(),
    role: z.enum(roles),
    auth_provider: z.enum(["local", "google", "github"]),
    is_active: z.boolean(),
    is_verified: z.boolean(),
    onboarding_completed: z.boolean(),
    last_login_at: z.iso.datetime().nullable(),
    created_at: z.iso.datetime(),
  })
  .meta({ id: "AdminUser" });

export const adminUserListSchema = z.array(adminUserSchema).meta({ id: "AdminUserList" });

export const updateUserSchema = z
  .object({
    is_active: z.boolean().optional(),
    role: z.enum(roles).optional(),
  })
  .refine((v) => v.is_active !== undefined || v.role !== undefined, "Nothing to update.")
  .meta({ id: "AdminUpdateUserRequest" });

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type AdminUserResponse = z.infer<typeof adminUserSchema>;

export function toAdminUser(
  user: User & { profile: { onboardingCompletedAt: Date | null } | null },
): AdminUserResponse {
  return {
    id: user.id,
    first_name: user.firstName,
    last_name: user.lastName,
    email: user.email,
    role: user.role.toLowerCase() as AdminUserResponse["role"],
    auth_provider: user.authProvider.toLowerCase() as AdminUserResponse["auth_provider"],
    is_active: user.isActive,
    is_verified: user.isVerified,
    onboarding_completed: Boolean(user.profile?.onboardingCompletedAt),
    last_login_at: user.lastLoginAt?.toISOString() ?? null,
    created_at: user.createdAt.toISOString(),
  };
}

// ---- Analytics -------------------------------------------------------------

export const analyticsSchema = z
  .object({
    users: z.object({
      total: z.number().int(),
      students: z.number().int(),
      mentors: z.number().int(),
      admins: z.number().int(),
      inactive: z.number().int(),
      onboarded: z.number().int().meta({ description: "Finished the onboarding chat." }),
      signups_7d: z.number().int(),
      signups_30d: z.number().int(),
    }),
    signups_by_day: z
      .array(z.object({ date: z.iso.date(), count: z.number().int() }))
      .meta({ description: "The last 30 days (India time), oldest first, zero-filled." }),
    checks: z.object({
      completed: z.number().int(),
      in_progress: z.number().int(),
      students_checked: z.number().int().meta({ description: "Students with a finished check." }),
      mastered_rate: z
        .number()
        .int()
        .nullable()
        .meta({ description: "Percent of finished checks that reached the pass mark." }),
      average_percent: z.number().int().nullable(),
    }),
    categories: z.array(
      z.object({
        category: z.enum(categories),
        checks: z.number().int(),
        average_percent: z.number().int().nullable(),
      }),
    ),
    top_skills: z
      .array(z.object({ name: z.string(), checks: z.number().int() }))
      .meta({ description: "Most-checked skills (finished checks), top 8." }),
    tasks: z.object({
      submissions: z.number().int(),
      pass_rate: z.number().int().nullable(),
    }),
    ai: z.object({
      requests_today: z.number().int(),
      requests_30d: z.number().int(),
      failure_rate_30d: z
        .number()
        .int()
        .nullable()
        .meta({ description: "Percent of failed calls." }),
      tokens_30d: z.number().int(),
    }),
  })
  .meta({ id: "AdminAnalytics" });

export type AnalyticsResponse = z.infer<typeof analyticsSchema>;

// ---- Content: skills -------------------------------------------------------

const slug = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes.")
  .max(120);

export const createSkillSchema = z
  .object({
    name: z.string().trim().min(1, "Enter a name.").max(100),
    slug,
    category: z.enum(categories),
    topic: z.string().trim().max(100).nullable().optional(),
    description: z.string().trim().max(1000).nullable().optional(),
    mastery_threshold: z.number().int().min(1).max(100).default(40),
  })
  .meta({ id: "AdminCreateSkillRequest" });

export const updateSkillSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    category: z.enum(categories).optional(),
    topic: z.string().trim().max(100).nullable().optional(),
    description: z.string().trim().max(1000).nullable().optional(),
    mastery_threshold: z.number().int().min(1).max(100).optional(),
    is_active: z.boolean().optional(),
  })
  .meta({ id: "AdminUpdateSkillRequest" });

export const adminSkillSchema = z
  .object({
    id: z.uuid(),
    slug: z.string(),
    name: z.string(),
    category: z.enum(categories),
    topic: z.string().nullable(),
    description: z.string().nullable(),
    mastery_threshold: z.number().int(),
    is_active: z.boolean(),
    resources: z.number().int().meta({ description: "Active learning resources." }),
    tasks: z.number().int().meta({ description: "Active practical tasks." }),
    checks: z.number().int().meta({ description: "Finished checks, all students." }),
  })
  .meta({ id: "AdminSkill" });

export const adminSkillListSchema = z.array(adminSkillSchema).meta({ id: "AdminSkillList" });

export type CreateSkillInput = z.infer<typeof createSkillSchema>;
export type UpdateSkillInput = z.infer<typeof updateSkillSchema>;
export type AdminSkillResponse = z.infer<typeof adminSkillSchema>;

export function toAdminSkill(
  skill: Skill,
  counts: { resources: number; tasks: number; checks: number },
): AdminSkillResponse {
  return {
    id: skill.id,
    slug: skill.slug,
    name: skill.name,
    category: skill.category.toLowerCase() as AdminSkillResponse["category"],
    topic: skill.topic,
    description: skill.description,
    mastery_threshold: skill.masteryThreshold,
    is_active: skill.isActive,
    ...counts,
  };
}

// ---- Content: resources ----------------------------------------------------

const httpUrl = z
  .url("Enter a full link, starting with https://")
  .max(1000)
  .refine((value) => /^https?:\/\//.test(value), "Only http(s) links are allowed.");

const resourceFields = {
  title: z.string().trim().min(1, "Enter a title.").max(200),
  type: z.enum(resourceTypes),
  url: httpUrl.nullable().optional(),
  content: z.string().trim().max(10_000).nullable().optional(),
  source: z.string().trim().max(100).nullable().optional(),
};

export const createResourceSchema = z
  .object({ skill_id: z.uuid(), ...resourceFields })
  .refine((v) => Boolean(v.url) !== Boolean(v.content), "Give either a link or notes, not both.")
  .meta({ id: "AdminCreateResourceRequest" });

export const updateResourceSchema = z
  .object({
    title: resourceFields.title.optional(),
    type: resourceFields.type.optional(),
    url: resourceFields.url,
    content: resourceFields.content,
    source: resourceFields.source,
    is_active: z.boolean().optional(),
  })
  .meta({ id: "AdminUpdateResourceRequest" });

export const adminResourceSchema = resourceSchema
  .extend({ skill_id: z.uuid(), is_active: z.boolean() })
  .meta({ id: "AdminResource" });

export const adminResourceListSchema = z
  .array(adminResourceSchema)
  .meta({ id: "AdminResourceList" });

export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;

export function toAdminResource(resource: LearningResource) {
  return { ...toResource(resource), skill_id: resource.skillId, is_active: resource.isActive };
}

// ---- Content: tasks --------------------------------------------------------

const rubricInput = z
  .array(
    z.object({
      id: z
        .string()
        .trim()
        .regex(/^[a-z0-9_-]+$/, "Use lowercase letters, numbers, dashes or underscores.")
        .max(40),
      description: z.string().trim().min(1).max(300),
      points: z.number().int().min(1).max(10),
      // The model answer the AI marks against; never shown to students.
      expected: z.string().trim().max(500).optional(),
    }),
  )
  .min(1)
  .max(8)
  .refine(
    (items) => new Set(items.map((c) => c.id)).size === items.length,
    "Criterion ids must be unique.",
  );

export const createTaskSchema = z
  .object({
    skill_id: z.uuid(),
    title: z.string().trim().min(1, "Enter a title.").max(200),
    description: z.string().trim().min(1, "Describe the task.").max(5000),
    difficulty: z.enum(difficulties),
    rubric: rubricInput,
  })
  .meta({ id: "AdminCreateTaskRequest" });

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().min(1).max(5000).optional(),
    difficulty: z.enum(difficulties).optional(),
    rubric: rubricInput.optional(),
    is_active: z.boolean().optional(),
  })
  .meta({ id: "AdminUpdateTaskRequest" });

export const adminTaskSchema = z
  .object({
    id: z.uuid(),
    skill_id: z.uuid(),
    title: z.string(),
    description: z.string(),
    difficulty: z.enum(difficulties),
    // Admins see the private model answer students never get.
    rubric: z.array(
      rubricCriterionSchema.extend({
        expected: z.string().optional().meta({ description: "Private model answer for the AI." }),
      }),
    ),
    is_active: z.boolean(),
  })
  .meta({ id: "AdminTask" });

export const adminTaskListSchema = z.array(adminTaskSchema).meta({ id: "AdminTaskList" });

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export function toAdminTask(task: PracticalTask): z.infer<typeof adminTaskSchema> {
  return {
    id: task.id,
    skill_id: task.skillId,
    title: task.title,
    description: task.description,
    difficulty: task.difficulty.toLowerCase() as (typeof difficulties)[number],
    rubric: parseRubric(task.evaluationCriteria).criteria,
    is_active: task.isActive,
  };
}

export const deletedSchema = z
  .object({ id: z.uuid(), deleted: z.literal(true) })
  .meta({ id: "AdminDeleted" });
