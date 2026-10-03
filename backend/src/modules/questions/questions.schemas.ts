import { z } from "zod";

import { PAGE_LIMIT_DEFAULT, PAGE_LIMIT_MAX } from "./questions.logic.js";
import { COMPANIES, ROLES } from "./taxonomy.js";

const difficulty = z.enum(["easy", "medium", "hard"]);
const company = z.enum(COMPANIES);
const role = z.enum(ROLES);

export const listQuestionsQuerySchema = z
  .object({
    skill: z
      .string()
      .trim()
      .max(120)
      .optional()
      .meta({ description: "Skill slug.", example: "sql" }),
    company: company.optional(),
    role: role.optional(),
    topic: z.string().trim().max(100).optional().meta({ example: "Joins" }),
    difficulty: difficulty.optional(),
    q: z.string().trim().max(100).optional().meta({ description: "Searches title and text." }),
    status: z
      .enum(["bookmarked", "solved", "unsolved"])
      .optional()
      .meta({ description: "Your own progress on the question." }),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(PAGE_LIMIT_MAX).default(PAGE_LIMIT_DEFAULT),
  })
  .meta({ id: "ListQuestionsQuery" });

export const pageQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(PAGE_LIMIT_MAX).default(PAGE_LIMIT_DEFAULT),
});

export const questionIdParamsSchema = z.object({ id: z.uuid("That question doesn't exist.") });
export const prepPdfIdParamsSchema = z.object({ id: z.uuid("That guide doesn't exist.") });

const skillRef = z.object({ id: z.uuid(), slug: z.string(), name: z.string() });

export const questionProgressSchema = z
  .object({
    bookmarked: z.boolean(),
    solved: z.boolean(),
    solved_at: z.iso
      .datetime()
      .nullable()
      .meta({ description: "First time it was marked solved." }),
  })
  .meta({ id: "QuestionProgress" });

export const questionSummarySchema = z
  .object({
    id: z.uuid(),
    title: z.string().meta({ example: "What is the difference between WHERE and HAVING?" }),
    topic: z.string().meta({ example: "Aggregation" }),
    difficulty,
    company: z.string().nullable(),
    role: z.string().nullable(),
    skill: skillRef,
    bookmarked: z.boolean(),
    solved: z.boolean(),
  })
  .meta({ id: "QuestionSummary" });

export const questionDetailSchema = questionSummarySchema
  .extend({
    body: z.string().meta({
      description:
        "Blank line = new paragraph, lines starting '- ' are a list, ``` fences are code.",
    }),
    answer: z
      .string()
      .nullable()
      .meta({ description: "Model answer / hints. The app hides it until the student asks." }),
    solved_at: z.iso.datetime().nullable(),
  })
  .meta({ id: "QuestionDetail" });

const countOf = <T extends z.ZodType>(key: string, value: T) =>
  z.object({ [key]: value, count: z.number().int() });

export const questionFiltersSchema = z
  .object({
    skills: z.array(z.object({ slug: z.string(), name: z.string(), count: z.number().int() })),
    companies: z.array(countOf("name", z.string())),
    roles: z.array(countOf("name", z.string())),
    topics: z.array(countOf("name", z.string())),
  })
  .meta({
    id: "QuestionFilters",
    description: "Values that have at least one question, with counts.",
  });

export const progressSchema = z
  .object({
    readiness: z
      .array(z.object({ date: z.iso.datetime(), score: z.number().int() }))
      .meta({ description: "Readiness after each finished skill check, oldest first." }),
    solved_by_week: z
      .array(
        z.object({
          week_start: z
            .string()
            .meta({ description: "Monday (IST), YYYY-MM-DD.", example: "2026-09-28" }),
          solved: z.number().int(),
          total_solved: z.number().int(),
        }),
      )
      .meta({ description: "Questions solved per week since the first solve (up to 26 weeks)." }),
    totals: z.object({
      solved: z.number().int(),
      bookmarked: z.number().int(),
      by_skill: z.array(
        z.object({
          skill_id: z.uuid(),
          slug: z.string(),
          name: z.string(),
          solved: z.number().int(),
        }),
      ),
    }),
  })
  .meta({ id: "Progress" });

export const prepPdfSchema = z
  .object({
    id: z.uuid(),
    title: z.string().meta({ example: "SDE interview guide" }),
    description: z.string().nullable(),
    skill: skillRef.nullable(),
    role: z.string().nullable(),
    company: z.string().nullable(),
    size_label: z.string().nullable().meta({ example: "12 pages" }),
  })
  .meta({ id: "PrepPdf" });

export const prepPdfDownloadSchema = z
  .object({ url: z.url().meta({ description: "Open this to download the guide." }) })
  .meta({ id: "PrepPdfDownload" });

// ---- Admin -----------------------------------------------------------------

const title = z.string().trim().min(5, "Use at least 5 characters.").max(200);

export const adminQuestionInputSchema = z
  .object({
    skill_id: z.uuid(),
    title,
    body: z.string().trim().min(10, "Write the question.").max(10_000),
    answer: z.string().trim().max(10_000).nullable().optional(),
    topic: z.string().trim().min(2).max(100),
    difficulty,
    company: company.nullable().optional(),
    role: role.nullable().optional(),
    is_active: z.boolean().optional(),
  })
  .meta({ id: "AdminQuestionInput" });

export const adminQuestionPatchSchema = adminQuestionInputSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, "Send at least one field to change.")
  .meta({ id: "AdminQuestionPatch" });

export const adminListQuestionsQuerySchema = z
  .object({
    skill: z.string().trim().max(120).optional(),
    q: z.string().trim().max(100).optional(),
    include_inactive: z.coerce.boolean().default(true),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .meta({ id: "AdminListQuestionsQuery" });

export const adminQuestionSchema = questionDetailSchema
  .omit({ bookmarked: true, solved: true, solved_at: true })
  .extend({ is_active: z.boolean(), created_at: z.iso.datetime(), updated_at: z.iso.datetime() })
  .meta({ id: "AdminQuestion" });

export const adminPrepPdfInputSchema = z
  .object({
    title,
    description: z.string().trim().max(500).nullable().optional(),
    skill_id: z.uuid().nullable().optional(),
    role: role.nullable().optional(),
    company: company.nullable().optional(),
    file_url: z.url("Paste a full link, starting with https://").max(500),
    size_label: z.string().trim().max(50).nullable().optional(),
    is_active: z.boolean().optional(),
  })
  .meta({ id: "AdminPrepPdfInput" });

export const adminPrepPdfPatchSchema = adminPrepPdfInputSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, "Send at least one field to change.")
  .meta({ id: "AdminPrepPdfPatch" });

export const adminPrepPdfSchema = prepPdfSchema
  .extend({
    file_url: z.string(),
    downloads: z.number().int(),
    is_active: z.boolean(),
    created_at: z.iso.datetime(),
  })
  .meta({ id: "AdminPrepPdf" });

export const taxonomySchema = z
  .object({ companies: z.array(z.string()), roles: z.array(z.string()) })
  .meta({ id: "QuestionTaxonomy" });

export type ListQuestionsQuery = z.infer<typeof listQuestionsQuerySchema>;
export type QuestionSummary = z.infer<typeof questionSummarySchema>;
export type QuestionDetail = z.infer<typeof questionDetailSchema>;
export type AdminQuestionInput = z.infer<typeof adminQuestionInputSchema>;
export type AdminPrepPdfInput = z.infer<typeof adminPrepPdfInputSchema>;
