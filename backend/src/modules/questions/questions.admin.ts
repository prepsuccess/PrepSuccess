import { prisma } from "../../db/prisma.js";
import type { PrepPdf, Prisma, QuestionBank, Skill } from "../../generated/prisma/client.js";
import { AppError } from "../../lib/http.js";
import type { AdminPrepPdfInput, AdminQuestionInput } from "./questions.schemas.js";
import { toPrepPdf, upper } from "./questions.service.js";
import { COMPANIES, ROLES } from "./taxonomy.js";

/**
 * Admin content tools for the question bank and prep PDFs (PRD-04 §3.1).
 * Routes are mounted under /admin, which already requires the ADMIN role.
 * Deletes are soft (is_deleted), so students' progress rows stay valid.
 */

const notDeleted = { isDeleted: false } as const;

function toAdminQuestion(row: QuestionBank & { skill: Skill }) {
  return {
    id: row.id,
    title: row.title,
    topic: row.topic,
    difficulty: row.difficulty.toLowerCase() as "easy" | "medium" | "hard",
    company: row.company,
    role: row.role,
    skill: { id: row.skill.id, slug: row.skill.slug, name: row.skill.name },
    body: row.body,
    answer: row.answer,
    is_active: row.isActive,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
  };
}

async function assertSkill(skillId: string) {
  const skill = await prisma.skill.findFirst({ where: { id: skillId, ...notDeleted } });
  if (!skill) throw new AppError(404, "SKILL_NOT_FOUND", "That skill doesn't exist.");
}

/** Prisma's unique-constraint error, turned into a clear 409. */
function duplicateTitle(error: unknown): never {
  if ((error as { code?: string }).code === "P2002") {
    throw new AppError(
      409,
      "QUESTION_EXISTS",
      "This skill already has a question with that title.",
    );
  }
  throw error;
}

export async function listQuestions(query: {
  skill?: string;
  q?: string;
  include_inactive: boolean;
  page: number;
  limit: number;
}) {
  const where: Prisma.QuestionBankWhereInput = {
    ...notDeleted,
    ...(query.include_inactive ? {} : { isActive: true }),
    ...(query.skill ? { skill: { slug: query.skill } } : {}),
    ...(query.q ? { title: { contains: query.q, mode: "insensitive" } } : {}),
  };
  const [rows, total] = await Promise.all([
    prisma.questionBank.findMany({
      where,
      include: { skill: true },
      orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
    prisma.questionBank.count({ where }),
  ]);
  return {
    questions: rows.map(toAdminQuestion),
    meta: { page: query.page, limit: query.limit, total },
  };
}

/** A soft-deleted question holding this skill + title (it still owns the unique pair). */
function findDeleted(skillId: string, title: string) {
  return prisma.questionBank.findFirst({ where: { skillId, title, isDeleted: true } });
}

/**
 * Adds a question. If a deleted question already has this skill and title,
 * it's brought back with the new content instead of failing with a 409
 * (students' progress on it comes back too).
 */
export async function createQuestion(adminId: string, input: AdminQuestionInput) {
  await assertSkill(input.skill_id);
  const data = {
    skillId: input.skill_id,
    title: input.title,
    body: input.body,
    answer: input.answer ?? null,
    topic: input.topic,
    difficulty: upper(input.difficulty),
    company: input.company ?? null,
    role: input.role ?? null,
    isActive: input.is_active ?? true,
    createdById: adminId,
  };
  const deleted = await findDeleted(input.skill_id, input.title);
  const row = deleted
    ? await prisma.questionBank.update({
        where: { id: deleted.id },
        data: { ...data, isDeleted: false },
        include: { skill: true },
      })
    : await prisma.questionBank.create({ data, include: { skill: true } }).catch(duplicateTitle);
  return toAdminQuestion(row);
}

/** Title for a deleted question moved out of the way: "<title> [deleted 1a2b3c4d]". */
export function deletedTitle(title: string, id: string) {
  const suffix = ` [deleted ${id.slice(0, 8)}]`;
  return `${title.slice(0, 200 - suffix.length)}${suffix}`;
}

export async function updateQuestion(id: string, input: Partial<AdminQuestionInput>) {
  const existing = await prisma.questionBank.findFirst({ where: { id, ...notDeleted } });
  if (!existing) throw new AppError(404, "QUESTION_NOT_FOUND", "That question doesn't exist.");
  if (input.skill_id) await assertSkill(input.skill_id);
  // Renaming (or moving) onto a deleted question's title: rename the deleted one first.
  const skillId = input.skill_id ?? existing.skillId;
  const title = input.title ?? existing.title;
  if (skillId !== existing.skillId || title !== existing.title) {
    const deleted = await findDeleted(skillId, title);
    if (deleted && deleted.id !== id) {
      await prisma.questionBank.update({
        where: { id: deleted.id },
        data: { title: deletedTitle(deleted.title, deleted.id) },
      });
    }
  }
  const row = await prisma.questionBank
    .update({
      where: { id },
      data: {
        ...(input.skill_id !== undefined ? { skillId: input.skill_id } : {}),
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.body !== undefined ? { body: input.body } : {}),
        ...(input.answer !== undefined ? { answer: input.answer } : {}),
        ...(input.topic !== undefined ? { topic: input.topic } : {}),
        ...(input.difficulty !== undefined ? { difficulty: upper(input.difficulty) } : {}),
        ...(input.company !== undefined ? { company: input.company } : {}),
        ...(input.role !== undefined ? { role: input.role } : {}),
        ...(input.is_active !== undefined ? { isActive: input.is_active } : {}),
      },
      include: { skill: true },
    })
    .catch(duplicateTitle);
  return toAdminQuestion(row);
}

export async function deleteQuestion(id: string) {
  const { count } = await prisma.questionBank.updateMany({
    where: { id, ...notDeleted },
    data: { isDeleted: true, isActive: false },
  });
  if (!count) throw new AppError(404, "QUESTION_NOT_FOUND", "That question doesn't exist.");
  return { id, deleted: true };
}

// ---- Prep PDFs ---------------------------------------------------------------

function toAdminPdf(pdf: PrepPdf & { skill: Skill | null }) {
  return {
    ...toPrepPdf(pdf),
    file_url: pdf.fileUrl,
    downloads: pdf.downloads,
    is_active: pdf.isActive,
    created_at: pdf.createdAt.toISOString(),
  };
}

export async function listPrepPdfs() {
  const pdfs = await prisma.prepPdf.findMany({
    where: notDeleted,
    include: { skill: true },
    orderBy: { createdAt: "desc" },
  });
  return pdfs.map(toAdminPdf);
}

const pdfData = (input: Partial<AdminPrepPdfInput>) => ({
  ...(input.title !== undefined ? { title: input.title } : {}),
  ...(input.description !== undefined ? { description: input.description } : {}),
  ...(input.skill_id !== undefined ? { skillId: input.skill_id } : {}),
  ...(input.role !== undefined ? { role: input.role } : {}),
  ...(input.company !== undefined ? { company: input.company } : {}),
  ...(input.file_url !== undefined ? { fileUrl: input.file_url } : {}),
  ...(input.size_label !== undefined ? { sizeLabel: input.size_label } : {}),
  ...(input.is_active !== undefined ? { isActive: input.is_active } : {}),
});

export async function createPrepPdf(input: AdminPrepPdfInput) {
  if (input.skill_id) await assertSkill(input.skill_id);
  const pdf = await prisma.prepPdf.create({
    data: { ...pdfData(input), title: input.title, fileUrl: input.file_url },
    include: { skill: true },
  });
  return toAdminPdf(pdf);
}

export async function updatePrepPdf(id: string, input: Partial<AdminPrepPdfInput>) {
  const existing = await prisma.prepPdf.findFirst({ where: { id, ...notDeleted } });
  if (!existing) throw new AppError(404, "PREP_PDF_NOT_FOUND", "That guide doesn't exist.");
  if (input.skill_id) await assertSkill(input.skill_id);
  const pdf = await prisma.prepPdf.update({
    where: { id },
    data: pdfData(input),
    include: { skill: true },
  });
  return toAdminPdf(pdf);
}

export async function deletePrepPdf(id: string) {
  const { count } = await prisma.prepPdf.updateMany({
    where: { id, ...notDeleted },
    data: { isDeleted: true, isActive: false },
  });
  if (!count) throw new AppError(404, "PREP_PDF_NOT_FOUND", "That guide doesn't exist.");
  return { id, deleted: true };
}

/** The fixed company and role lists, for the admin form's dropdowns. */
export const taxonomy = () => ({ companies: [...COMPANIES], roles: [...ROLES] });
