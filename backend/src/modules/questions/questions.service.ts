import { prisma } from "../../db/prisma.js";
import type {
  Difficulty,
  PrepPdf,
  QuestionBank,
  Skill,
  UserQuestionProgress,
} from "../../generated/prisma/client.js";
import { AppError } from "../../lib/http.js";
import { startOfIndianDay } from "../../lib/time.js";
import { getDashboard } from "../dashboard/dashboard.service.js";
import { matchClaims } from "../skills/skills.logic.js";
import { buildWhere, solvedByWeek } from "./questions.logic.js";
import type { ListQuestionsQuery, QuestionDetail, QuestionSummary } from "./questions.schemas.js";

const live = { isActive: true, isDeleted: false } as const;
const lower = (d: Difficulty) => d.toLowerCase() as Lowercase<Difficulty>;
export const upper = (d: "easy" | "medium" | "hard") => d.toUpperCase() as Difficulty;

type Row = QuestionBank & { skill: Skill; progress: UserQuestionProgress[] };

const skillRef = (skill: Skill) => ({ id: skill.id, slug: skill.slug, name: skill.name });

function toSummary(row: Row): QuestionSummary {
  const mine = row.progress[0];
  return {
    id: row.id,
    title: row.title,
    topic: row.topic,
    difficulty: lower(row.difficulty),
    company: row.company,
    role: row.role,
    skill: skillRef(row.skill),
    bookmarked: mine?.bookmarked ?? false,
    solved: Boolean(mine?.solvedAt),
  };
}

function toDetail(row: Row): QuestionDetail {
  return {
    ...toSummary(row),
    body: row.body,
    answer: row.answer,
    solved_at: row.progress[0]?.solvedAt?.toISOString() ?? null,
  };
}

/** Joins only the signed-in student's own progress row. */
const withMine = (userId: string) => ({
  skill: true,
  progress: { where: { userId } },
});

/** Catalogue slugs for the skills on the student's profile (same matching as the dashboard). */
async function profileSkillSlugs(userId: string) {
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    select: { profileData: true },
  });
  const data = (profile?.profileData ?? {}) as Record<string, unknown>;
  const claims = Array.isArray(data.skills)
    ? data.skills.filter((s): s is string => typeof s === "string")
    : [];
  return matchClaims(claims).slugs;
}

/** GET /questions — filtered, paginated, easiest first within each skill. */
export async function listQuestions(userId: string, query: ListQuestionsQuery) {
  const { mine, ...filters } = query;
  const where = buildWhere(
    {
      ...filters,
      difficulty: filters.difficulty ? upper(filters.difficulty) : undefined,
      skills: mine ? await profileSkillSlugs(userId) : undefined,
    },
    userId,
  );
  const [rows, total] = await Promise.all([
    prisma.questionBank.findMany({
      where,
      include: withMine(userId),
      // id breaks ties so pages never repeat or skip a question.
      orderBy: [{ difficulty: "asc" }, { title: "asc" }, { id: "asc" }],
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
    prisma.questionBank.count({ where }),
  ]);
  return {
    questions: rows.map(toSummary),
    meta: { page: query.page, limit: query.limit, total },
  };
}

/**
 * GET /questions/filters — filter values that have questions, with counts.
 * Topics are only for `skill` when given (there are hundreds across all skills).
 */
export async function filterOptions(skill?: string) {
  const where = { ...live, skill: live };
  const topicWhere = skill ? { ...live, skill: { ...live, slug: skill } } : where;
  const [bySkill, byCompany, byRole, byTopic, skills] = await Promise.all([
    prisma.questionBank.groupBy({ by: ["skillId"], where, _count: { _all: true } }),
    prisma.questionBank.groupBy({
      by: ["company"],
      where: { ...where, company: { not: null } },
      _count: { _all: true },
    }),
    prisma.questionBank.groupBy({
      by: ["role"],
      where: { ...where, role: { not: null } },
      _count: { _all: true },
    }),
    prisma.questionBank.groupBy({ by: ["topic"], where: topicWhere, _count: { _all: true } }),
    prisma.skill.findMany({ where: live }),
  ]);
  const skillById = new Map(skills.map((s) => [s.id, s]));
  const byName = <T extends { name: string }>(a: T, b: T) => a.name.localeCompare(b.name);
  return {
    skills: bySkill
      .flatMap((g) => {
        const skill = skillById.get(g.skillId);
        return skill ? [{ slug: skill.slug, name: skill.name, count: g._count._all }] : [];
      })
      .sort(byName),
    companies: byCompany.map((g) => ({ name: g.company!, count: g._count._all })).sort(byName),
    roles: byRole.map((g) => ({ name: g.role!, count: g._count._all })).sort(byName),
    topics: byTopic.map((g) => ({ name: g.topic, count: g._count._all })).sort(byName),
  };
}

async function loadQuestion(userId: string, id: string) {
  const row = await prisma.questionBank.findFirst({
    where: { id, ...live, skill: live },
    include: withMine(userId),
  });
  if (!row) throw new AppError(404, "QUESTION_NOT_FOUND", "That question doesn't exist.");
  return row;
}

/** GET /questions/:id */
export async function getQuestion(userId: string, id: string) {
  return toDetail(await loadQuestion(userId, id));
}

function toProgress(row: UserQuestionProgress | null) {
  return {
    bookmarked: row?.bookmarked ?? false,
    solved: Boolean(row?.solvedAt),
    solved_at: row?.solvedAt?.toISOString() ?? null,
  };
}

/**
 * Bookmark / un-bookmark. Idempotent: one row per student and question
 * (unique constraint). bookmarkedAt orders My bookmarks: set when bookmarked
 * (a repeat bookmark keeps it), cleared when removed.
 */
export async function setBookmark(userId: string, id: string, bookmarked: boolean) {
  await loadQuestion(userId, id);
  const key = { userId_questionId: { userId, questionId: id } };
  const existing = await prisma.userQuestionProgress.findUnique({ where: key });
  const bookmarkedAt = bookmarked
    ? existing?.bookmarked
      ? (existing.bookmarkedAt ?? new Date())
      : new Date()
    : null;
  const row = await prisma.userQuestionProgress.upsert({
    where: key,
    create: { userId, questionId: id, bookmarked, bookmarkedAt },
    update: { bookmarked, bookmarkedAt },
  });
  return toProgress(row);
}

/**
 * Mark solved / not solved. Idempotent; solving again keeps the first
 * solved date, so the progress chart counts each question once.
 */
export async function setSolved(userId: string, id: string, solved: boolean) {
  await loadQuestion(userId, id);
  const key = { userId_questionId: { userId, questionId: id } };
  const existing = await prisma.userQuestionProgress.findUnique({ where: key });
  const solvedAt = solved ? (existing?.solvedAt ?? new Date()) : null;
  const row = await prisma.userQuestionProgress.upsert({
    where: key,
    create: { userId, questionId: id, solvedAt },
    update: { solvedAt },
  });
  return toProgress(row);
}

/** GET /questions/bookmarks — the student's bookmarks, most recently bookmarked first. */
export async function listBookmarks(userId: string, page: number, limit: number) {
  const where = { userId, bookmarked: true, question: { ...live, skill: live } };
  const [rows, total] = await Promise.all([
    prisma.userQuestionProgress.findMany({
      where,
      include: { question: { include: withMine(userId) } },
      orderBy: [{ bookmarkedAt: { sort: "desc", nulls: "last" } }, { id: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.userQuestionProgress.count({ where }),
  ]);
  return { questions: rows.map((r) => toSummary(r.question)), meta: { page, limit, total } };
}

/** GET /progress — readiness history plus questions solved per week, ready to chart. */
export async function getProgress(userId: string, now = new Date()) {
  const [dashboard, mine] = await Promise.all([
    getDashboard(userId),
    prisma.userQuestionProgress.findMany({
      where: { userId, question: { ...live, skill: live } },
      include: { question: { include: { skill: true } } },
    }),
  ]);
  const solved = mine.filter((p) => p.solvedAt);
  const bySkill = new Map<
    string,
    { skill_id: string; slug: string; name: string; solved: number }
  >();
  for (const p of solved) {
    const skill = p.question.skill;
    const entry = bySkill.get(skill.id) ?? {
      skill_id: skill.id,
      slug: skill.slug,
      name: skill.name,
      solved: 0,
    };
    entry.solved += 1;
    bySkill.set(skill.id, entry);
  }
  return {
    readiness: dashboard.readiness.history.map((p) => ({ date: p.date, score: p.score })),
    solved_by_week: solvedByWeek(
      solved.map((p) => p.solvedAt!),
      now,
    ),
    totals: {
      solved: solved.length,
      bookmarked: mine.filter((p) => p.bookmarked).length,
      by_skill: [...bySkill.values()].sort((a, b) => b.solved - a.solved),
    },
  };
}

// ---- Prep PDFs ---------------------------------------------------------------

export const toPrepPdf = (pdf: PrepPdf & { skill: Skill | null }) => ({
  id: pdf.id,
  title: pdf.title,
  description: pdf.description,
  skill: pdf.skill ? skillRef(pdf.skill) : null,
  role: pdf.role,
  company: pdf.company,
  size_label: pdf.sizeLabel,
});

/** GET /prep-pdfs */
export async function listPrepPdfs() {
  const pdfs = await prisma.prepPdf.findMany({
    where: live,
    include: { skill: true },
    orderBy: { title: "asc" },
  });
  return pdfs.map(toPrepPdf);
}

/**
 * Downloads already counted today, as `${userId}:${pdfId}`, so re-clicking
 * doesn't inflate the count: each student counts once per guide per IST day.
 * In memory, so a restart (or a second instance) may count a repeat; the
 * set is emptied when the IST day changes.
 */
const countedDownloads = { day: 0, keys: new Set<string>() };

/** True the first time this student downloads this guide today. */
export function firstDownloadToday(userId: string, pdfId: string, now = new Date()) {
  const day = startOfIndianDay(now).getTime();
  if (countedDownloads.day !== day) {
    countedDownloads.day = day;
    countedDownloads.keys.clear();
  }
  const key = `${userId}:${pdfId}`;
  if (countedDownloads.keys.has(key)) return false;
  countedDownloads.keys.add(key);
  return true;
}

/** POST /prep-pdfs/:id/download — counts the download (once a day per student) and returns the link. */
export async function downloadPrepPdf(userId: string, id: string) {
  const pdf = await prisma.prepPdf.findFirst({ where: { id, ...live } });
  if (!pdf) throw new AppError(404, "PREP_PDF_NOT_FOUND", "That guide isn't available.");
  if (firstDownloadToday(userId, id)) {
    await prisma.prepPdf.update({ where: { id }, data: { downloads: { increment: 1 } } });
  }
  return { url: pdf.fileUrl };
}
