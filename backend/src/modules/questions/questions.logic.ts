import type { Difficulty, Prisma } from "../../generated/prisma/client.js";
import { startOfIndianDay } from "../../lib/time.js";

/**
 * Pure rules for the interview question bank (Phase 2) — no database. Filters
 * combine with AND; status filters look only at the signed-in student's own
 * progress; solved dates are bucketed into IST weeks for the progress chart.
 */

export const PAGE_LIMIT_DEFAULT = 20;
export const PAGE_LIMIT_MAX = 50;
/** Weeks shown on the progress chart (oldest dropped beyond this). */
export const PROGRESS_WEEKS_MAX = 26;

export type QuestionStatusFilter = "bookmarked" | "solved" | "unsolved";

export interface QuestionFilters {
  skill?: string;
  company?: string;
  role?: string;
  topic?: string;
  difficulty?: Difficulty;
  q?: string;
  status?: QuestionStatusFilter;
}

const live = { isActive: true, isDeleted: false } as const;

/** Query filters → a Prisma `where`. Every filter present is ANDed. */
export function buildWhere(filters: QuestionFilters, userId: string) {
  const and: Prisma.QuestionBankWhereInput[] = [{ ...live, skill: live }];
  if (filters.skill) and.push({ skill: { slug: filters.skill } });
  if (filters.company) and.push({ company: filters.company });
  if (filters.role) and.push({ role: filters.role });
  if (filters.topic) and.push({ topic: { equals: filters.topic, mode: "insensitive" } });
  if (filters.difficulty) and.push({ difficulty: filters.difficulty });
  if (filters.q) {
    and.push({
      OR: [
        { title: { contains: filters.q, mode: "insensitive" } },
        { body: { contains: filters.q, mode: "insensitive" } },
      ],
    });
  }
  if (filters.status === "bookmarked")
    and.push({ progress: { some: { userId, bookmarked: true } } });
  if (filters.status === "solved") {
    and.push({ progress: { some: { userId, solvedAt: { not: null } } } });
  }
  if (filters.status === "unsolved") {
    and.push({ NOT: { progress: { some: { userId, solvedAt: { not: null } } } } });
  }
  return { AND: and } satisfies Prisma.QuestionBankWhereInput;
}

const DAY_MS = 86_400_000;

/** Monday 00:00 IST of the week containing `date`. */
export function startOfIndianWeek(date: Date) {
  const day = startOfIndianDay(date);
  // Day of week in IST (0 = Sunday): shift to IST, read the UTC weekday.
  const weekday = new Date(day.getTime() + 330 * 60_000).getUTCDay();
  const sinceMonday = (weekday + 6) % 7;
  return new Date(day.getTime() - sinceMonday * DAY_MS);
}

const isoDate = (date: Date) => new Date(date.getTime() + 330 * 60_000).toISOString().slice(0, 10);

/**
 * Solved dates → one bucket per IST week, from the first solve to `now`
 * (weeks with no solves included, so the chart's x-axis is even), with a
 * running total. At most PROGRESS_WEEKS_MAX recent weeks.
 */
export function solvedByWeek(solvedDates: Date[], now = new Date()) {
  if (solvedDates.length === 0) return [];
  const sorted = [...solvedDates].sort((a, b) => a.getTime() - b.getTime());
  const first = startOfIndianWeek(sorted[0]!);
  const last = startOfIndianWeek(now);
  const weeks: { week_start: string; solved: number; total_solved: number }[] = [];
  let total = 0;
  let i = 0;
  for (let week = first.getTime(); week <= last.getTime(); week += 7 * DAY_MS) {
    const end = week + 7 * DAY_MS;
    let solved = 0;
    while (i < sorted.length && sorted[i]!.getTime() < end) {
      solved += 1;
      i += 1;
    }
    total += solved;
    weeks.push({ week_start: isoDate(new Date(week)), solved, total_solved: total });
  }
  return weeks.slice(-PROGRESS_WEEKS_MAX);
}
