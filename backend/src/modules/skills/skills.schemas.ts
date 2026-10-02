import { z } from "zod";

import type { Skill } from "../../generated/prisma/client.js";

export const skillSchema = z
  .object({
    id: z.uuid(),
    slug: z.string().meta({ example: "dsa" }),
    name: z.string().meta({ example: "Data structures & algorithms" }),
    category: z.enum(["technical", "soft", "aptitude"]),
    topic: z.string().nullable().meta({ example: "CS fundamentals" }),
    description: z.string().nullable(),
    mastery_threshold: z
      .number()
      .int()
      .meta({ description: "Percentage needed to count as mastered.", example: 40 }),
  })
  .meta({ id: "Skill" });

export const skillListSchema = z.array(skillSchema).meta({ id: "SkillList" });

export const lastResultSchema = z
  .object({
    assessment_id: z.uuid(),
    percent: z.number().int().meta({ example: 64 }),
    mastery: z.enum(["mastered", "needs_revision"]),
    completed_at: z.iso.datetime(),
  })
  .meta({ id: "SkillLastResult" });

export const mySkillSchema = skillSchema
  .extend({
    claimed: z
      .boolean()
      .meta({ description: "The student said they know this in the onboarding chat." }),
    in_progress_id: z
      .uuid()
      .nullable()
      .meta({ description: "An unfinished check on this skill, to resume." }),
    last_result: lastResultSchema.nullable().meta({ description: "The latest finished check." }),
    attempts: z.number().int().meta({ description: "Finished checks on this skill." }),
  })
  .meta({ id: "MySkill" });

export const mySkillsSchema = z
  .object({
    skills: z.array(mySkillSchema),
    unmatched_claims: z.array(z.string()).meta({
      description: "Skills from the onboarding chat that aren't in the catalogue yet.",
      example: ["Kotlin"],
    }),
  })
  .meta({ id: "MySkills" });

export type SkillResponse = z.infer<typeof skillSchema>;
export type MySkillsResponse = z.infer<typeof mySkillsSchema>;

export function toSkill(skill: Skill): SkillResponse {
  return {
    id: skill.id,
    slug: skill.slug,
    name: skill.name,
    category: skill.category.toLowerCase() as SkillResponse["category"],
    topic: skill.topic,
    description: skill.description,
    mastery_threshold: skill.masteryThreshold,
  };
}
