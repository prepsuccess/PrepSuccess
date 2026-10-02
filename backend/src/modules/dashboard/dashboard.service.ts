import { prisma } from "../../db/prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";
import { AppError } from "../../lib/http.js";
import { generateJson } from "../../services/ai-agent/ai.service.js";
import { percentOf } from "../assessment/assessment.logic.js";
import { matchClaims } from "../skills/skills.logic.js";
import {
  CATEGORY_WEIGHTS,
  buildInsightPrompt,
  buildNextSteps,
  categoryScores,
  groundInsight,
  insightSchema,
  latestPerSkill,
  readinessScore,
  resultsFingerprint,
  topGaps,
  type Category,
  type SkillResult,
} from "./dashboard.logic.js";
import type { DashboardResponse, InsightResponse } from "./dashboard.schemas.js";

/** Everything the dashboard and the insight are computed from — one read, no AI. */
async function loadStanding(userId: string) {
  const [user, assessments, skills] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, include: { profile: true } }),
    prisma.assessment.findMany({
      where: { userId, status: { in: ["IN_PROGRESS", "COMPLETED"] } },
      include: { skill: true, result: true },
      orderBy: { startedAt: "desc" },
    }),
    prisma.skill.findMany({ where: { isActive: true, isDeleted: false } }),
  ]);
  if (!user || !user.isActive || user.isDeleted) {
    throw new AppError(401, "UNAUTHORIZED", "Sign in to continue.");
  }

  const profile = (user.profile?.profileData ?? {}) as Record<string, unknown>;
  const finished = assessments.flatMap((a) =>
    a.status === "COMPLETED" && a.result && a.completedAt
      ? [
          {
            assessmentId: a.id,
            skill: {
              id: a.skill.id,
              slug: a.skill.slug,
              name: a.skill.name,
              category: a.skill.category.toLowerCase() as Category,
            },
            percent: percentOf(a.result.score, a.result.maxScore),
            mastered: a.result.masteryStatus === "MASTERED",
            completedAt: a.completedAt,
          },
        ]
      : [],
  );
  // Newest finished first, so the latest attempt per skill wins.
  finished.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
  const results = latestPerSkill(finished);

  const claims = Array.isArray(profile.skills)
    ? profile.skills.filter((s): s is string => typeof s === "string")
    : [];
  const claimedSlugs = matchClaims(claims).slugs;
  const checkedSlugs = new Set(results.map((r) => r.slug));
  const bySlug = new Map(skills.map((s) => [s.slug, s]));
  const claimedUnchecked = claimedSlugs
    .filter((slug) => !checkedSlugs.has(slug) && bySlug.has(slug))
    .map((slug) => ({ name: bySlug.get(slug)!.name }));

  const inProgress = assessments
    .filter((a) => a.status === "IN_PROGRESS")
    .map((a) => ({ assessmentId: a.id, name: a.skill.name }));

  return {
    user,
    profile,
    results,
    claimedSlugs,
    claimedUnchecked,
    inProgress,
    onboardingCompleted: Boolean(user.profile?.onboardingCompletedAt),
  };
}

function toSkillResult(r: SkillResult) {
  return {
    skill_id: r.skillId,
    slug: r.slug,
    name: r.name,
    category: r.category,
    assessment_id: r.assessmentId,
    percent: r.percent,
    mastery: r.mastered ? ("mastered" as const) : ("needs_revision" as const),
    completed_at: r.completedAt.toISOString(),
    attempts: r.attempts,
    change: r.change,
  };
}

/** GET /dashboard — readiness, categories, results, gaps and next steps. No AI call. */
export async function getDashboard(userId: string): Promise<DashboardResponse> {
  const standing = await loadStanding(userId);
  const { results } = standing;
  const categories = categoryScores(results);
  const checkedSlugs = new Set(results.map((r) => r.slug));

  return {
    onboarding_completed: standing.onboardingCompleted,
    readiness: { score: readinessScore(categories), weights: CATEGORY_WEIGHTS, categories },
    counts: {
      checked: results.length,
      mastered: results.filter((r) => r.mastered).length,
      needs_revision: results.filter((r) => !r.mastered).length,
      claimed: standing.claimedSlugs.length,
      claimed_checked: standing.claimedSlugs.filter((slug) => checkedSlugs.has(slug)).length,
      in_progress: standing.inProgress.length,
    },
    // Weakest first: what needs attention leads.
    skills: [...results].sort((a, b) => a.percent - b.percent).map(toSkillResult),
    gaps: topGaps(results).map(toSkillResult),
    next_steps: buildNextSteps({
      onboardingCompleted: standing.onboardingCompleted,
      inProgress: standing.inProgress,
      claimedUnchecked: standing.claimedUnchecked,
      results,
    }),
  };
}

/** The cached insight lives in the student's DASHBOARD conversation. */
interface StoredInsight {
  fingerprint: string;
  generated_at: string;
  insight: ReturnType<typeof groundInsight>;
}

const EMPTY: InsightResponse = {
  status: "empty",
  summary: null,
  gaps: [],
  plan: [],
  generated_at: null,
};

function toInsightResponse(stored: StoredInsight): InsightResponse {
  return {
    status: "ready",
    summary: stored.insight.summary,
    gaps: stored.insight.gaps.map((g) => ({
      skill_id: g.skillId,
      name: g.name,
      why: g.why,
      how: g.how,
    })),
    plan: stored.insight.plan,
    generated_at: stored.generated_at,
  };
}

/**
 * GET /ai/insight — the AI coach's read of the student's results. Generated
 * once per set of results and cached, so reloading the dashboard is free;
 * a new or retaken check makes it regenerate. No results, no AI call.
 */
export async function getInsight(userId: string): Promise<InsightResponse> {
  const standing = await loadStanding(userId);
  if (!standing.results.length) return EMPTY;

  const fingerprint = resultsFingerprint(standing.results);
  const conversation = await prisma.aIConversation.findFirst({
    where: { userId, agentType: "DASHBOARD" },
    orderBy: { createdAt: "asc" },
  });
  const cached = (Array.isArray(conversation?.messages) ? conversation.messages : [])[0] as
    StoredInsight | undefined;
  if (cached?.fingerprint === fingerprint) return toInsightResponse(cached);

  const categories = categoryScores(standing.results);
  const { data } = await generateJson(
    {
      userId,
      feature: "next_steps",
      system: buildInsightPrompt({
        firstName: standing.user.firstName,
        profile: standing.profile,
        results: standing.results,
        claimedUnchecked: standing.claimedUnchecked.map((s) => s.name),
        readiness: readinessScore(categories),
      }),
      messages: [{ role: "user", content: "Write my coach's take now." }],
      temperature: 0.5,
      maxOutputTokens: 1500,
    },
    insightSchema,
  );

  const stored: StoredInsight = {
    fingerprint,
    generated_at: new Date().toISOString(),
    insight: groundInsight(data, standing.results),
  };
  const messages = [stored] as unknown as Prisma.InputJsonArray;
  if (conversation) {
    await prisma.aIConversation.update({ where: { id: conversation.id }, data: { messages } });
  } else {
    await prisma.aIConversation.create({ data: { userId, agentType: "DASHBOARD", messages } });
  }
  return toInsightResponse(stored);
}
