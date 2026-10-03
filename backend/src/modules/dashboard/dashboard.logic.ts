import { z } from "zod";

/**
 * Pure readiness rules — no database, no AI — so every number on the
 * dashboard is deterministic and unit-testable (PRD-01 §3.6, §5: dashboard
 * numbers always come from the backend scoring service).
 */

export type Category = "technical" | "aptitude" | "soft";

export const CATEGORIES: Category[] = ["technical", "aptitude", "soft"];

/**
 * How much each category counts towards overall readiness. Placement rounds
 * lean on technical skill, then aptitude tests, then soft skills. Categories
 * the student hasn't checked yet are left out and the rest re-weighted, so
 * the score reflects only what's actually been measured.
 */
export const CATEGORY_WEIGHTS: Record<Category, number> = {
  technical: 50,
  aptitude: 30,
  soft: 20,
};

/** A student's latest finished check on one skill. */
export interface SkillResult {
  skillId: string;
  slug: string;
  name: string;
  category: Category;
  assessmentId: string;
  percent: number;
  mastered: boolean;
  completedAt: Date;
  attempts: number;
  /** Change since the previous attempt, in percentage points; null on a first attempt. */
  change: number | null;
}

/** One finished check, as loaded from the database (newest first). */
export interface FinishedCheck {
  assessmentId: string;
  skill: { id: string; slug: string; name: string; category: Category };
  percent: number;
  mastered: boolean;
  completedAt: Date;
}

/** Collapses every finished check into the latest per skill, with attempts and trend. */
export function latestPerSkill(checksNewestFirst: FinishedCheck[]): SkillResult[] {
  const bySkill = new Map<string, FinishedCheck[]>();
  for (const check of checksNewestFirst) {
    const list = bySkill.get(check.skill.id) ?? [];
    list.push(check);
    bySkill.set(check.skill.id, list);
  }
  return [...bySkill.values()].map(([latest, previous, ...rest]) => ({
    skillId: latest!.skill.id,
    slug: latest!.skill.slug,
    name: latest!.skill.name,
    category: latest!.skill.category,
    assessmentId: latest!.assessmentId,
    percent: latest!.percent,
    mastered: latest!.mastered,
    completedAt: latest!.completedAt,
    attempts: 1 + (previous ? 1 : 0) + rest.length,
    change: previous ? latest!.percent - previous.percent : null,
  }));
}

const average = (values: number[]) =>
  values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null;

export function categoryScores(results: SkillResult[]) {
  return CATEGORIES.map((category) => {
    const scores = results.filter((r) => r.category === category).map((r) => r.percent);
    return { category, score: average(scores), checked: scores.length };
  });
}

/** Weighted average of the category scores that exist; null before any check. */
export function readinessScore(categories: ReturnType<typeof categoryScores>) {
  const measured = categories.filter((c) => c.score !== null);
  if (!measured.length) return null;
  const totalWeight = measured.reduce((sum, c) => sum + CATEGORY_WEIGHTS[c.category], 0);
  const weighted = measured.reduce((sum, c) => sum + c.score! * CATEGORY_WEIGHTS[c.category], 0);
  return Math.round(weighted / totalWeight);
}

export interface ReadinessPoint {
  date: Date;
  score: number;
  /** The check that moved readiness to this score. */
  skill: string;
  percent: number;
}

/**
 * Readiness as it stood after each finished check, oldest first — what the
 * score would have read on the dashboard at that moment. Capped to the most
 * recent `limit` points.
 */
export function readinessHistory(checksNewestFirst: FinishedCheck[], limit = 20) {
  const latest = new Map<string, FinishedCheck>();
  const points: ReadinessPoint[] = [];
  for (const check of [...checksNewestFirst].reverse()) {
    latest.set(check.skill.id, check);
    const asOfNow = latestPerSkill([...latest.values()]);
    points.push({
      date: check.completedAt,
      score: readinessScore(categoryScores(asOfNow))!,
      skill: check.skill.name,
      percent: check.percent,
    });
  }
  return points.slice(-limit);
}

/** Skills below the pass mark, weakest first. */
export function topGaps(results: SkillResult[], limit = 3) {
  return results
    .filter((r) => !r.mastered)
    .sort((a, b) => a.percent - b.percent)
    .slice(0, limit);
}

export interface NextStep {
  id: string;
  kind: "onboarding" | "resume" | "check" | "revise" | "aptitude";
  title: string;
  detail: string;
  href: string;
}

/**
 * Rule-based next steps, always grounded in the student's own data. They're
 * the actions on the dashboard; the AI insight adds the "why" around them.
 */
export function buildNextSteps(input: {
  onboardingCompleted: boolean;
  inProgress: { assessmentId: string; name: string }[];
  claimedUnchecked: { name: string }[];
  results: SkillResult[];
  limit?: number;
}): NextStep[] {
  const steps: NextStep[] = [];
  if (!input.onboardingCompleted) {
    steps.push({
      id: "onboarding",
      kind: "onboarding",
      title: "Finish your onboarding chat",
      detail: "A few quick questions so your checks match your skills and target role.",
      href: "/onboarding",
    });
  }
  for (const check of input.inProgress.slice(0, 1)) {
    steps.push({
      id: `resume-${check.assessmentId}`,
      kind: "resume",
      title: `Finish your ${check.name} check`,
      detail: "You started it already — pick up where you left off.",
      href: `/assessment/${check.assessmentId}`,
    });
  }
  for (const gap of topGaps(input.results, 2)) {
    steps.push({
      id: `revise-${gap.skillId}`,
      kind: "revise",
      title: `Revise ${gap.name}`,
      detail: `You scored ${gap.percent}%. Go through the answers you missed, then retake it.`,
      href: `/assessment/${gap.assessmentId}`,
    });
  }
  for (const skill of input.claimedUnchecked.slice(0, 2)) {
    steps.push({
      id: `check-${skill.name}`,
      kind: "check",
      title: `Check your ${skill.name}`,
      detail: "You said you know it — five questions show where you really stand.",
      href: "/assessment",
    });
  }
  if (!input.results.some((r) => r.category === "aptitude")) {
    steps.push({
      id: "aptitude",
      kind: "aptitude",
      title: "Take an aptitude check",
      detail: "Most placement tests start with a quant and reasoning round.",
      href: "/assessment",
    });
  }
  return steps.slice(0, input.limit ?? 4);
}

// ---------------------------------------------------------------------------
// AI insight ("coach's take")
// ---------------------------------------------------------------------------

/** What the model returns. It names skills by slug so the server can check them. */
export const insightSchema = z.object({
  summary: z.string().min(1).max(600),
  gaps: z
    .array(
      z.object({
        skill: z.string().meta({ description: "Slug of a skill from the student's results." }),
        why: z.string().min(1).max(300),
        how: z.string().min(1).max(300),
      }),
    )
    .max(3),
  plan: z
    .array(z.object({ title: z.string().min(1).max(80), detail: z.string().min(1).max(240) }))
    .min(1)
    .max(4),
});
export type Insight = z.infer<typeof insightSchema>;

/**
 * Grounding check (PRD-01 §3.8): keeps only gaps about skills the student
 * was actually checked on and scored below the pass mark, so the AI can
 * never invent a weakness.
 */
export function groundInsight(insight: Insight, results: SkillResult[]) {
  const bySlug = new Map(results.map((r) => [r.slug, r]));
  const seen = new Set<string>();
  const gaps = insight.gaps.flatMap((gap) => {
    const result = bySlug.get(gap.skill.trim());
    if (!result || result.mastered || seen.has(result.slug)) return [];
    seen.add(result.slug);
    return [{ skillId: result.skillId, name: result.name, why: gap.why, how: gap.how }];
  });
  return { summary: insight.summary.trim(), gaps, plan: insight.plan };
}

/** Changes whenever any latest result changes, so a cached insight knows it's stale. */
export function resultsFingerprint(results: SkillResult[]) {
  return results
    .map((r) => r.assessmentId)
    .sort()
    .join(",");
}

export function buildInsightPrompt(input: {
  firstName: string;
  profile: Record<string, unknown>;
  results: SkillResult[];
  claimedUnchecked: string[];
  readiness: number | null;
}) {
  const { profile } = input;
  const facts = {
    degree: profile.degree ?? null,
    year: profile.student_year ?? null,
    target_role: profile.target_role ?? null,
    goals: profile.goals ?? [],
    readiness: input.readiness,
    results: input.results.map((r) => ({
      skill: r.slug,
      name: r.name,
      category: r.category,
      score_percent: r.percent,
      status: r.mastered ? "mastered" : "needs revision",
      change_since_last_attempt: r.change,
    })),
    claimed_but_not_checked: input.claimedUnchecked,
  };
  return [
    `You are ${input.firstName}'s PrepSuccess placement coach. Write a short, honest, encouraging read of where they stand.`,
    "Use ONLY the facts below. Never mention a skill, score or fact that isn't in them. Pass mark is 40%.",
    "",
    `Facts: ${JSON.stringify(facts)}`,
    "",
    "Write:",
    "- summary: 2-3 sentences. Where they stand for their target role (or placements in general if none), their strongest area and the most important gap.",
    "- gaps: up to 3 skills scoring below 40%, weakest or most important for their target role first. `skill` must be a skill slug from results. `why`: why it matters for their target role. `how`: one concrete thing to study or practise. Empty if nothing is below 40%.",
    "- plan: 2-4 ordered actions for this week, each with a short title and one sentence of detail. Prefer revising weak skills and checking claimed-but-unchecked skills relevant to their target role.",
    "Plain, simple English. No markdown. Don't repeat the score numbers more than needed.",
  ].join("\n");
}
