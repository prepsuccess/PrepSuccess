import type { Difficulty, Prisma } from "../../generated/prisma/client.js";
import { startOfIndianDay } from "../../lib/time.js";
import { matchClaims, skillsInText } from "../skills/skills.logic.js";
import { ROLES, type Role } from "./taxonomy.js";

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
  /** Only these skill slugs (the student's own skills); empty matches nothing. */
  skills?: string[];
  /** With `skills`: questions tagged this role count too (either one matches). */
  mineRole?: string | null;
}

const live = { isActive: true, isDeleted: false } as const;

/** Query filters → a Prisma `where`. Every filter present is ANDed. */
export function buildWhere(filters: QuestionFilters, userId: string) {
  const and: Prisma.QuestionBankWhereInput[] = [{ ...live, skill: live }];
  if (filters.skill) and.push({ skill: { slug: filters.skill } });
  if (filters.skills) {
    const bySkill = { skill: { slug: { in: filters.skills } } };
    and.push(filters.mineRole ? { OR: [bySkill, { role: filters.mineRole }] } : bySkill);
  }
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

// ---- My skills ---------------------------------------------------------------

/**
 * Ways students write a target role, after roleKey(), → the taxonomy role.
 * The trailing "developer" / "engineer" / "dev" is dropped first, so
 * "Frontend dev" and "front-end engineer" both land on "frontend".
 */
const ROLE_ALIASES: Record<string, Role> = {
  sde: "SDE",
  swe: "SDE",
  software: "SDE",
  "software development": "SDE",
  programmer: "SDE",
  frontend: "Frontend Developer",
  ui: "Frontend Developer",
  react: "Frontend Developer",
  backend: "Backend Developer",
  node: "Backend Developer",
  "full stack": "Full Stack Developer",
  mern: "Full Stack Developer",
  "mern stack": "Full Stack Developer",
  web: "Full Stack Developer",
  "data analyst": "Data Analyst",
  "data analytics": "Data Analyst",
  "data scientist": "Data Scientist",
  "data science": "Data Scientist",
  ml: "ML Engineer",
  "machine learning": "ML Engineer",
  ai: "ML Engineer",
  "ai ml": "ML Engineer",
  devops: "DevOps Engineer",
  cloud: "DevOps Engineer",
  sre: "DevOps Engineer",
  qa: "QA Engineer",
  test: "QA Engineer",
  tester: "QA Engineer",
  "software tester": "QA Engineer",
  sdet: "QA Engineer",
  "quality assurance": "QA Engineer",
  "business analyst": "Business Analyst",
};

/** "Front-end Developer (intern)" → "frontend": lowercase, joined, role nouns and levels dropped. */
function roleKey(value: string) {
  return value
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\b(front|back)\s+end\b/g, "$1end")
    .replace(/\bfullstack\b/g, "full stack")
    .replace(/\b(aspiring|junior|senior|trainee|intern|an?|role)\b/g, " ")
    .replace(/\b(developer|dev|engineer|engineering|[0-9]+|i{1,3})\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** A free-text target role ("frontend dev", "Software engineer") → a taxonomy role, or null. */
export function roleForTarget(value: unknown): Role | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const exact = ROLES.find((role) => role.toLowerCase() === value.trim().toLowerCase());
  return exact ?? ROLE_ALIASES[roleKey(value)] ?? null;
}

const strings = (value: unknown) =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];

/**
 * What "My skills" covers for a profile: the skills claimed, skills named in
 * goals and interests (not already claimed), and the target role. Claims the
 * catalogue doesn't know come back as `unmatched`.
 */
export function mineScope(profileData: unknown) {
  const data = (profileData ?? {}) as Record<string, unknown>;
  const { slugs: skillSlugs, unmatched } = matchClaims(strings(data.skills));
  const goalSlugs: string[] = [];
  for (const phrase of [...strings(data.goals), ...strings(data.interests)]) {
    for (const slug of skillsInText(phrase)) {
      if (!skillSlugs.includes(slug) && !goalSlugs.includes(slug)) goalSlugs.push(slug);
    }
  }
  return { skillSlugs, goalSlugs, role: roleForTarget(data.target_role), unmatched };
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
