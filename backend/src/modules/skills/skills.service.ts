import { prisma } from "../../db/prisma.js";
import { percentOf } from "../assessment/assessment.logic.js";
import { SKILL_CATALOGUE } from "./catalogue.js";
import { matchClaims } from "./skills.logic.js";
import { toSkill, type MySkillsResponse } from "./skills.schemas.js";

const activeSkills = { isActive: true, isDeleted: false } as const;

// Catalogue order (by topic) reads better than alphabetical.
const catalogueOrder = new Map(SKILL_CATALOGUE.map((skill, index) => [skill.slug, index]));
const byCatalogue = (a: { slug: string }, b: { slug: string }) =>
  (catalogueOrder.get(a.slug) ?? Infinity) - (catalogueOrder.get(b.slug) ?? Infinity);

/** GET /skills — the active catalogue. */
export async function listSkills() {
  const skills = await prisma.skill.findMany({ where: activeSkills });
  return skills.sort(byCatalogue).map(toSkill);
}

/**
 * GET /skills/mine — every active skill, marked with whether the student
 * claimed it in onboarding, any unfinished check, and their latest result.
 */
export async function mySkills(userId: string): Promise<MySkillsResponse> {
  const [skills, profile, assessments] = await Promise.all([
    prisma.skill.findMany({ where: activeSkills }),
    prisma.userProfile.findUnique({ where: { userId }, select: { profileData: true } }),
    prisma.assessment.findMany({
      where: { userId, status: { in: ["IN_PROGRESS", "COMPLETED"] } },
      include: { result: true },
      orderBy: { startedAt: "desc" },
    }),
  ]);

  const data = (profile?.profileData ?? {}) as Record<string, unknown>;
  const claims = Array.isArray(data.skills)
    ? data.skills.filter((s): s is string => typeof s === "string")
    : [];
  const { slugs, unmatched } = matchClaims(claims);
  const claimed = new Set(slugs);

  return {
    skills: skills.sort(byCatalogue).map((skill) => {
      const mine = assessments.filter((a) => a.skillId === skill.id);
      const inProgress = mine.find((a) => a.status === "IN_PROGRESS");
      const finished = mine.filter((a) => a.status === "COMPLETED" && a.result);
      const last = finished[0];
      return {
        ...toSkill(skill),
        claimed: claimed.has(skill.slug),
        in_progress_id: inProgress?.id ?? null,
        last_result:
          last?.result && last.completedAt
            ? {
                assessment_id: last.id,
                percent: percentOf(last.result.score, last.result.maxScore),
                mastery: last.result.masteryStatus === "MASTERED" ? "mastered" : "needs_revision",
                completed_at: last.completedAt.toISOString(),
              }
            : null,
        attempts: finished.length,
      };
    }),
    unmatched_claims: unmatched,
  };
}
