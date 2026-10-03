import { prisma } from "../../db/prisma.js";
import type { Prisma, Role } from "../../generated/prisma/client.js";
import { AppError, type PaginationMeta } from "../../lib/http.js";
import { startOfIndianDay } from "../../services/ai-agent/access.js";
import { percentOf } from "../assessment/assessment.logic.js";
import type { Category } from "../dashboard/dashboard.logic.js";
import { averageOrNull, countByDay, percentOrNull } from "./admin.logic.js";
import {
  toAdminUser,
  type AnalyticsResponse,
  type ListUsersQuery,
  type UpdateUserInput,
} from "./admin.schemas.js";

const DAY_MS = 86_400_000;
const withProfileFlag = { profile: { select: { onboardingCompletedAt: true } } } as const;
const toRole = (role: string) => role.toUpperCase() as Role;

// ---- Users -----------------------------------------------------------------

/** GET /admin/users — account fields only, never results. */
export async function listUsers(query: ListUsersQuery) {
  const where: Prisma.UserWhereInput = {
    isDeleted: false,
    ...(query.role ? { role: toRole(query.role) } : {}),
    ...(query.status ? { isActive: query.status === "active" } : {}),
    ...(query.q
      ? {
          OR: [
            { email: { contains: query.q, mode: "insensitive" } },
            { firstName: { contains: query.q, mode: "insensitive" } },
            { lastName: { contains: query.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: withProfileFlag,
      orderBy: { createdAt: "desc" },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
    prisma.user.count({ where }),
  ]);
  const meta: PaginationMeta = { page: query.page, limit: query.limit, total };
  return { users: users.map(toAdminUser), meta };
}

/**
 * PATCH /admin/users/:id — activate/deactivate or change role. Admins can't
 * change their own account (no locking yourself out). Any change signs the
 * user out everywhere, so a new role or a deactivation applies at their next
 * request after the access token expires (≤ 30 min) — and immediately for
 * anything that checks the account, like refresh and /auth/me.
 */
export async function updateUser(adminId: string, userId: string, input: UpdateUserInput) {
  if (adminId === userId) {
    throw new AppError(400, "CANNOT_CHANGE_SELF", "You can't change your own account here.");
  }
  const user = await prisma.user.findFirst({ where: { id: userId, isDeleted: false } });
  if (!user) throw new AppError(404, "USER_NOT_FOUND", "That user doesn't exist.");

  const updated = await prisma.$transaction(async (tx) => {
    const saved = await tx.user.update({
      where: { id: userId },
      data: {
        ...(input.is_active !== undefined ? { isActive: input.is_active } : {}),
        ...(input.role ? { role: toRole(input.role) } : {}),
      },
      include: withProfileFlag,
    });
    await tx.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return saved;
  });
  return toAdminUser(updated);
}

// ---- Analytics -------------------------------------------------------------

/** GET /admin/analytics — platform-wide aggregates. Nothing here identifies a student. */
export async function getAnalytics(now = new Date()): Promise<AnalyticsResponse> {
  const since30 = new Date(now.getTime() - 30 * DAY_MS);
  const since7 = new Date(now.getTime() - 7 * DAY_MS);
  const live = { isDeleted: false } as const;

  const [
    roleCounts,
    inactive,
    onboarded,
    signups30,
    inProgress,
    results,
    submissions,
    passedSubmissions,
    aiToday,
    ai30,
    aiFailed30,
    aiTokens,
  ] = await Promise.all([
    prisma.user.groupBy({ by: ["role"], where: live, _count: { _all: true } }),
    prisma.user.count({ where: { ...live, isActive: false } }),
    prisma.userProfile.count({
      where: { onboardingCompletedAt: { not: null }, user: live },
    }),
    prisma.user.findMany({
      where: { ...live, createdAt: { gte: since30 } },
      select: { createdAt: true },
    }),
    prisma.assessment.count({ where: { status: "IN_PROGRESS" } }),
    prisma.assessmentResult.findMany({
      select: {
        score: true,
        maxScore: true,
        masteryStatus: true,
        assessment: { select: { userId: true, skill: { select: { name: true, category: true } } } },
      },
    }),
    prisma.userTaskSubmission.count(),
    prisma.userTaskSubmission.count({ where: { passed: true } }),
    prisma.aiUsage.count({ where: { createdAt: { gte: startOfIndianDay(now) } } }),
    prisma.aiUsage.count({ where: { createdAt: { gte: since30 } } }),
    prisma.aiUsage.count({ where: { createdAt: { gte: since30 }, success: false } }),
    prisma.aiUsage.aggregate({
      where: { createdAt: { gte: since30 } },
      _sum: { inputTokens: true, outputTokens: true },
    }),
  ]);

  const byRole = (role: Role) => roleCounts.find((r) => r.role === role)?._count._all ?? 0;
  const percents = results.map((r) => percentOf(r.score, r.maxScore));

  const categories = (["technical", "aptitude", "soft"] as Category[]).map((category) => {
    const inCategory = results
      .filter((r) => r.assessment.skill.category.toLowerCase() === category)
      .map((r) => percentOf(r.score, r.maxScore));
    return { category, checks: inCategory.length, average_percent: averageOrNull(inCategory) };
  });

  const skillCounts = new Map<string, number>();
  for (const r of results) {
    const name = r.assessment.skill.name;
    skillCounts.set(name, (skillCounts.get(name) ?? 0) + 1);
  }

  return {
    users: {
      total: roleCounts.reduce((sum, r) => sum + r._count._all, 0),
      students: byRole("STUDENT"),
      mentors: byRole("MENTOR"),
      admins: byRole("ADMIN"),
      inactive,
      onboarded,
      signups_7d: signups30.filter((u) => u.createdAt >= since7).length,
      signups_30d: signups30.length,
    },
    signups_by_day: countByDay(
      signups30.map((u) => u.createdAt),
      now,
    ),
    checks: {
      completed: results.length,
      in_progress: inProgress,
      students_checked: new Set(results.map((r) => r.assessment.userId)).size,
      mastered_rate: percentOrNull(
        results.filter((r) => r.masteryStatus === "MASTERED").length,
        results.length,
      ),
      average_percent: averageOrNull(percents),
    },
    categories,
    top_skills: [...skillCounts]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 8)
      .map(([name, checks]) => ({ name, checks })),
    tasks: { submissions, pass_rate: percentOrNull(passedSubmissions, submissions) },
    ai: {
      requests_today: aiToday,
      requests_30d: ai30,
      failure_rate_30d: percentOrNull(aiFailed30, ai30),
      tokens_30d: (aiTokens._sum.inputTokens ?? 0) + (aiTokens._sum.outputTokens ?? 0),
    },
  };
}
