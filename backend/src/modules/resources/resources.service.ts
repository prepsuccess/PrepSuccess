import { prisma } from "../../db/prisma.js";
import { AppError } from "../../lib/http.js";
import { toSkill } from "../skills/skills.schemas.js";
import { toResource, type SkillResourcesResponse } from "./resources.schemas.js";

const live = { isActive: true, isDeleted: false } as const;

// Notes and references first, then examples, lectures and practice.
const TYPE_ORDER = { REFERENCE: 0, EXAMPLE: 1, LECTURE: 2, PRACTICE: 3 } as const;

/** GET /resources?skill= — the curated material for one skill. */
export async function listForSkill(slug: string): Promise<SkillResourcesResponse> {
  const skill = await prisma.skill.findFirst({ where: { slug, ...live } });
  if (!skill) throw new AppError(404, "SKILL_NOT_FOUND", "That skill isn't available.");

  const resources = await prisma.learningResource.findMany({
    where: { skillId: skill.id, ...live },
    orderBy: { createdAt: "asc" },
  });
  // Stable sort keeps the curated order within each type.
  resources.sort((a, b) => TYPE_ORDER[a.type] - TYPE_ORDER[b.type]);

  return { skill: toSkill(skill), resources: resources.map(toResource) };
}
