import { prisma } from "../../db/prisma.js";
import {
  Prisma,
  type Difficulty,
  type ResourceType,
  type SkillCategory,
} from "../../generated/prisma/client.js";
import { AppError } from "../../lib/http.js";
import {
  toAdminResource,
  toAdminSkill,
  toAdminTask,
  type CreateResourceInput,
  type CreateSkillInput,
  type CreateTaskInput,
  type UpdateResourceInput,
  type UpdateSkillInput,
  type UpdateTaskInput,
} from "./admin.schemas.js";

/**
 * Admin content management (PRD-04 §3.1): the skill taxonomy, learning
 * resources and practical tasks. Deletes are soft — a skill, resource or task
 * that students already used stays in the database, so their history never
 * breaks — and deleted rows disappear from every list.
 */

const notDeleted = { isDeleted: false } as const;
const upper = <T extends string>(value: T) => value.toUpperCase() as Uppercase<T>;

const SKILL_NOT_FOUND = () => new AppError(404, "SKILL_NOT_FOUND", "That skill doesn't exist.");

async function requireSkill(id: string) {
  const skill = await prisma.skill.findFirst({ where: { id, ...notDeleted } });
  if (!skill) throw SKILL_NOT_FOUND();
  return skill;
}

// ---- Skills ----------------------------------------------------------------

async function skillCounts(skillIds: string[]) {
  const [resources, tasks, checks] = await Promise.all([
    prisma.learningResource.groupBy({
      by: ["skillId"],
      where: { skillId: { in: skillIds }, isActive: true, ...notDeleted },
      _count: { _all: true },
    }),
    prisma.practicalTask.groupBy({
      by: ["skillId"],
      where: { skillId: { in: skillIds }, isActive: true, ...notDeleted },
      _count: { _all: true },
    }),
    prisma.assessment.groupBy({
      by: ["skillId"],
      where: { skillId: { in: skillIds }, status: "COMPLETED" },
      _count: { _all: true },
    }),
  ]);
  const count = (rows: { skillId: string; _count: { _all: number } }[], id: string) =>
    rows.find((r) => r.skillId === id)?._count._all ?? 0;
  return (id: string) => ({
    resources: count(resources, id),
    tasks: count(tasks, id),
    checks: count(checks, id),
  });
}

/** GET /admin/skills — every skill that isn't deleted, active or not. */
export async function listSkills() {
  const skills = await prisma.skill.findMany({
    where: notDeleted,
    orderBy: [{ category: "asc" }, { topic: "asc" }, { name: "asc" }],
  });
  const counts = await skillCounts(skills.map((s) => s.id));
  return skills.map((skill) => toAdminSkill(skill, counts(skill.id)));
}

export async function createSkill(input: CreateSkillInput) {
  try {
    const skill = await prisma.skill.create({
      data: {
        name: input.name,
        slug: input.slug,
        category: upper(input.category) as SkillCategory,
        topic: input.topic ?? null,
        description: input.description ?? null,
        masteryThreshold: input.mastery_threshold,
      },
    });
    return toAdminSkill(skill, { resources: 0, tasks: 0, checks: 0 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new AppError(409, "SLUG_TAKEN", "Another skill already uses that slug.");
    }
    throw error;
  }
}

/** A changed pass mark only affects new checks; past results keep the threshold they were scored with. */
export async function updateSkill(id: string, input: UpdateSkillInput) {
  await requireSkill(id);
  const skill = await prisma.skill.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.category ? { category: upper(input.category) as SkillCategory } : {}),
      ...(input.topic !== undefined ? { topic: input.topic } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.mastery_threshold !== undefined
        ? { masteryThreshold: input.mastery_threshold }
        : {}),
      ...(input.is_active !== undefined ? { isActive: input.is_active } : {}),
    },
  });
  return toAdminSkill(skill, (await skillCounts([id]))(id));
}

export async function deleteSkill(id: string) {
  await requireSkill(id);
  await prisma.skill.update({ where: { id }, data: { isDeleted: true, isActive: false } });
  return { id, deleted: true as const };
}

// ---- Resources -------------------------------------------------------------

export async function listResources(skillId: string) {
  await requireSkill(skillId);
  const resources = await prisma.learningResource.findMany({
    where: { skillId, ...notDeleted },
    orderBy: { createdAt: "asc" },
  });
  return resources.map(toAdminResource);
}

export async function createResource(input: CreateResourceInput) {
  await requireSkill(input.skill_id);
  const resource = await prisma.learningResource.create({
    data: {
      skillId: input.skill_id,
      title: input.title,
      type: upper(input.type) as ResourceType,
      url: input.url || null,
      content: input.content || null,
      source: input.source || null,
    },
  });
  return toAdminResource(resource);
}

async function requireResource(id: string) {
  const resource = await prisma.learningResource.findFirst({ where: { id, ...notDeleted } });
  if (!resource) throw new AppError(404, "RESOURCE_NOT_FOUND", "That resource doesn't exist.");
  return resource;
}

export async function updateResource(id: string, input: UpdateResourceInput) {
  const current = await requireResource(id);
  const url = input.url !== undefined ? input.url || null : current.url;
  const content = input.content !== undefined ? input.content || null : current.content;
  if (Boolean(url) === Boolean(content)) {
    throw new AppError(422, "VALIDATION_ERROR", "Give either a link or notes, not both.");
  }
  const resource = await prisma.learningResource.update({
    where: { id },
    data: {
      url,
      content,
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.type ? { type: upper(input.type) as ResourceType } : {}),
      ...(input.source !== undefined ? { source: input.source || null } : {}),
      ...(input.is_active !== undefined ? { isActive: input.is_active } : {}),
    },
  });
  return toAdminResource(resource);
}

export async function deleteResource(id: string) {
  await requireResource(id);
  await prisma.learningResource.update({
    where: { id },
    data: { isDeleted: true, isActive: false },
  });
  return { id, deleted: true as const };
}

// ---- Tasks -----------------------------------------------------------------

export async function listTasks(skillId: string) {
  await requireSkill(skillId);
  const tasks = await prisma.practicalTask.findMany({
    where: { skillId, ...notDeleted },
    orderBy: { createdAt: "asc" },
  });
  return tasks.map(toAdminTask);
}

export async function createTask(input: CreateTaskInput) {
  await requireSkill(input.skill_id);
  const task = await prisma.practicalTask.create({
    data: {
      skillId: input.skill_id,
      title: input.title,
      description: input.description,
      difficulty: upper(input.difficulty) as Difficulty,
      evaluationCriteria: { criteria: input.rubric },
    },
  });
  return toAdminTask(task);
}

async function requireTask(id: string) {
  const task = await prisma.practicalTask.findFirst({ where: { id, ...notDeleted } });
  if (!task) throw new AppError(404, "TASK_NOT_FOUND", "That task doesn't exist.");
  return task;
}

export async function updateTask(id: string, input: UpdateTaskInput) {
  await requireTask(id);
  const task = await prisma.practicalTask.update({
    where: { id },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.difficulty ? { difficulty: upper(input.difficulty) as Difficulty } : {}),
      ...(input.rubric ? { evaluationCriteria: { criteria: input.rubric } } : {}),
      ...(input.is_active !== undefined ? { isActive: input.is_active } : {}),
    },
  });
  return toAdminTask(task);
}

export async function deleteTask(id: string) {
  await requireTask(id);
  await prisma.practicalTask.update({ where: { id }, data: { isDeleted: true, isActive: false } });
  return { id, deleted: true as const };
}
