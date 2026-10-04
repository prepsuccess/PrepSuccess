import { z } from "zod";

const category = z.enum(["technical", "aptitude", "soft"]);

const skillResultSchema = z
  .object({
    skill_id: z.uuid(),
    slug: z.string().meta({ example: "dsa" }),
    name: z.string().meta({ example: "Data structures & algorithms" }),
    category,
    assessment_id: z.uuid().meta({ description: "The latest finished check, to review answers." }),
    percent: z.number().int().meta({ example: 64 }),
    threshold: z.number().int().meta({
      description: "The pass mark (percent) this result was scored against.",
      example: 40,
    }),
    mastery: z.enum(["mastered", "needs_revision"]),
    completed_at: z.iso.datetime(),
    attempts: z.number().int(),
    change: z.number().int().nullable().meta({
      description: "Percentage points since the previous attempt; null on a first attempt.",
      example: 14,
    }),
  })
  .meta({ id: "DashboardSkillResult" });

export const dashboardSchema = z
  .object({
    onboarding_completed: z.boolean(),
    readiness: z.object({
      score: z.number().int().nullable().meta({
        description:
          "0-100, a weighted average of the category scores the student has; null before any check.",
        example: 58,
      }),
      change: z.number().int().nullable().meta({
        description: "Points since before the latest check; null with fewer than two checks.",
        example: 6,
      }),
      history: z
        .array(
          z.object({
            date: z.iso.datetime(),
            score: z.number().int(),
            skill: z.string().meta({ description: "The check that moved readiness here." }),
            percent: z.number().int().meta({ description: "That check's score." }),
          }),
        )
        .meta({ description: "Readiness after each finished check, oldest first (last 20)." }),
      weights: z
        .record(category, z.number().int())
        .meta({ example: { technical: 50, aptitude: 30, soft: 20 } }),
      categories: z.array(
        z.object({
          category,
          score: z.number().int().nullable(),
          checked: z.number().int().meta({ description: "Skills checked in this category." }),
        }),
      ),
    }),
    counts: z.object({
      checked: z.number().int(),
      mastered: z.number().int(),
      needs_revision: z.number().int(),
      claimed: z.number().int().meta({ description: "Skills named in the onboarding chat." }),
      claimed_checked: z.number().int(),
      in_progress: z.number().int(),
      tasks_attempted: z
        .number()
        .int()
        .meta({ description: "Practical tasks submitted at least once." }),
      tasks_passed: z.number().int().meta({ description: "Practical tasks passed at least once." }),
    }),
    skills: z.array(skillResultSchema).meta({ description: "Latest result per checked skill." }),
    gaps: z
      .array(skillResultSchema)
      .meta({ description: "Up to 3 skills below their pass mark, weakest first." }),
    check_dates: z.array(z.iso.date()).meta({
      description:
        "The India date of every check finished in the last 365 days, oldest first (one entry per check), for the practice calendar.",
      example: ["2026-09-28", "2026-10-02", "2026-10-02"],
    }),
    next_steps: z.array(
      z.object({
        id: z.string(),
        kind: z.enum(["onboarding", "resume", "check", "revise", "aptitude", "task"]),
        title: z.string(),
        detail: z.string(),
        href: z.string().meta({ description: "App path for the step's action." }),
      }),
    ),
  })
  .meta({ id: "Dashboard" });

export const insightResponseSchema = z
  .object({
    status: z.enum(["ready", "empty"]).meta({
      description: "`empty` until the student has finished a check — no AI call is made.",
    }),
    summary: z.string().nullable(),
    gaps: z.array(
      z.object({
        skill_id: z.uuid(),
        name: z.string(),
        why: z.string(),
        how: z.string(),
      }),
    ),
    plan: z.array(z.object({ title: z.string(), detail: z.string() })),
    generated_at: z.iso.datetime().nullable(),
    stale: z.boolean().optional().meta({
      description:
        "True when the results changed but refreshing the take failed (e.g. the AI is busy): this is the previous take.",
    }),
  })
  .meta({ id: "AiInsight" });

export type DashboardResponse = z.infer<typeof dashboardSchema>;
export type InsightResponse = z.infer<typeof insightResponseSchema>;
