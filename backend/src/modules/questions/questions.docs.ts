import { z } from "zod";
import type { ZodOpenApiOperationObject, ZodOpenApiPathsObject } from "zod-openapi";

import { VALIDATION_422, bearerAuth, errors, ok, successEnvelope } from "../../docs/helpers.js";
import {
  adminListQuestionsQuerySchema,
  adminPrepPdfInputSchema,
  adminPrepPdfPatchSchema,
  adminPrepPdfSchema,
  adminQuestionInputSchema,
  adminQuestionPatchSchema,
  adminQuestionSchema,
  filtersQuerySchema,
  listQuestionsQuerySchema,
  mineScopeSchema,
  pageQuerySchema,
  prepPdfDownloadSchema,
  prepPdfIdParamsSchema,
  prepPdfSchema,
  progressSchema,
  questionAttemptInputSchema,
  questionAttemptSchema,
  questionDetailSchema,
  questionFiltersSchema,
  questionIdParamsSchema,
  questionProgressSchema,
  questionSummarySchema,
  taxonomySchema,
} from "./questions.schemas.js";

const studentAuth = {
  401: "`UNAUTHORIZED` or `INVALID_TOKEN`.",
  403: "`FORBIDDEN` — students only.",
};
const adminAuth = {
  401: "`UNAUTHORIZED` or `INVALID_TOKEN`.",
  403: "`FORBIDDEN` — not an admin.",
  429: "`TOO_MANY_REQUESTS`.",
};
const json = <T>(schema: T) => ({ content: { "application/json": { schema } } });
const paged = <T extends z.ZodType>(item: T) =>
  successEnvelope(z.array(item)).extend({
    meta: z.object({ page: z.number().int(), limit: z.number().int(), total: z.number().int() }),
  });
const deleted = z.object({ id: z.uuid(), deleted: z.literal(true) });
const questionPath = { path: questionIdParamsSchema };
const pdfPath = { path: prepPdfIdParamsSchema };

function student(summary: string, operation: Partial<ZodOpenApiOperationObject>) {
  return {
    tags: ["Interview prep"],
    summary,
    security: bearerAuth,
    ...operation,
  } as ZodOpenApiOperationObject;
}
function admin(summary: string, operation: Partial<ZodOpenApiOperationObject>) {
  return {
    tags: ["Admin"],
    summary,
    security: bearerAuth,
    ...operation,
  } as ZodOpenApiOperationObject;
}

const progressWrite = (summary: string, description: string) =>
  student(summary, {
    description,
    requestParams: questionPath,
    responses: {
      ...ok(questionProgressSchema, "Your progress on the question."),
      ...errors({ ...studentAuth, 404: "`QUESTION_NOT_FOUND`.", ...VALIDATION_422 }),
    },
  });

export const questionsPaths: ZodOpenApiPathsObject = {
  "/api/v1/questions": {
    get: student("Browse interview questions", {
      description:
        "Open-ended interview questions tagged by skill, company, role, topic and difficulty. Every " +
        "filter given is combined (AND). `status` filters by your own bookmarks/solves. Each item " +
        "says whether you bookmarked or solved it.",
      requestParams: { query: listQuestionsQuerySchema },
      responses: {
        200: { description: "One page of questions.", ...json(paged(questionSummarySchema)) },
        ...errors({ ...studentAuth, ...VALIDATION_422 }),
      },
    }),
  },
  "/api/v1/questions/filters": {
    get: student("Filter options", {
      description:
        "Skills, companies, roles and topics that have questions, with counts. Pass `skill` to " +
        "get only that skill's topics.",
      requestParams: { query: filtersQuerySchema },
      responses: {
        ...ok(questionFiltersSchema, "Filter values."),
        ...errors(studentAuth),
      },
    }),
  },
  "/api/v1/questions/mine": {
    get: student("What My skills covers", {
      description:
        "The skills on your profile, skills named in your goals, and your target role (matched to " +
        "a known role) that `mine=true` uses, with question counts and your solves per skill.",
      responses: {
        ...ok(mineScopeSchema, "Your question scope."),
        ...errors(studentAuth),
      },
    }),
  },
  "/api/v1/questions/bookmarks": {
    get: student("My bookmarked questions", {
      requestParams: { query: pageQuerySchema },
      responses: {
        200: {
          description: "Bookmarks, most recently bookmarked first.",
          ...json(paged(questionSummarySchema)),
        },
        ...errors({ ...studentAuth, ...VALIDATION_422 }),
      },
    }),
  },
  "/api/v1/questions/{id}": {
    get: student("One question", {
      description: "The full question and its model answer (the app hides the answer until asked).",
      requestParams: questionPath,
      responses: {
        ...ok(questionDetailSchema, "The question."),
        ...errors({ ...studentAuth, 404: "`QUESTION_NOT_FOUND`.", ...VALIDATION_422 }),
      },
    }),
  },
  "/api/v1/questions/{id}/bookmark": {
    post: progressWrite("Bookmark a question", "Idempotent: bookmarking twice keeps one row."),
    delete: progressWrite("Remove a bookmark", "Idempotent: fine if it wasn't bookmarked."),
  },
  "/api/v1/questions/{id}/solve": {
    post: progressWrite(
      "Mark a question solved",
      "Idempotent: solving again keeps the first solved date, so each question counts once.",
    ),
    delete: progressWrite("Mark a question not solved", "Idempotent."),
  },
  "/api/v1/questions/{id}/attempt": {
    post: student("Get AI feedback on my answer", {
      description:
        "One AI call. Compares the student's written answer with the question's model answer and " +
        "returns a 0-10 score, a verdict (8+ strong, 5-7 partial, 0-4 weak), what they covered, " +
        "what to add and one tip. The answer is treated strictly as the answer to judge — " +
        "instructions inside it are ignored. Only the latest attempt is kept (it comes back as " +
        "`my_attempt` on the question). Doesn't mark the question solved. Nothing is saved if " +
        "the AI call fails.",
      requestParams: questionPath,
      requestBody: json(questionAttemptInputSchema),
      responses: {
        ...ok(questionAttemptSchema, "The answer and its feedback."),
        ...errors({
          ...studentAuth,
          403: "`FORBIDDEN` — students only, or `AI_TRIAL_ENDED`.",
          404: "`QUESTION_NOT_FOUND`.",
          ...VALIDATION_422,
          429: "`AI_DAILY_LIMIT` or `TOO_MANY_REQUESTS`.",
          502: "`AI_BAD_RESPONSE` — try again.",
          503: "`AI_UNAVAILABLE` or `AI_NOT_CONFIGURED`.",
        }),
      },
    }),
  },
  "/api/v1/progress": {
    get: student("My progress over time", {
      description:
        "Readiness after each finished skill check, plus questions solved per week (IST, Monday " +
        "start) with a running total, pre-bucketed for charting. Empty arrays before any data.",
      responses: {
        ...ok(progressSchema, "Progress."),
        ...errors(studentAuth),
      },
    }),
  },
  "/api/v1/prep-pdfs": {
    get: student("Prep guides (PDFs)", {
      description: "Curated guides such as an SDE interview guide or an aptitude quick reference.",
      responses: {
        ...ok(z.array(prepPdfSchema), "The guides, A to Z."),
        ...errors(studentAuth),
      },
    }),
  },
  "/api/v1/prep-pdfs/{id}/download": {
    post: student("Download a prep guide", {
      description:
        "Counts the download (for admin analytics; once per student per guide per day) and returns the link to open.",
      requestParams: pdfPath,
      responses: {
        ...ok(prepPdfDownloadSchema, "The guide's link."),
        ...errors({ ...studentAuth, 404: "`PREP_PDF_NOT_FOUND`.", 429: "`TOO_MANY_REQUESTS`." }),
      },
    }),
  },

  // ---- Admin -----------------------------------------------------------------
  "/api/v1/admin/questions": {
    get: admin("List interview questions", {
      description: "Includes inactive questions unless `include_inactive=false`. Not deleted ones.",
      requestParams: { query: adminListQuestionsQuerySchema },
      responses: {
        200: { description: "One page of questions.", ...json(paged(adminQuestionSchema)) },
        ...errors({ ...adminAuth, ...VALIDATION_422 }),
      },
    }),
    post: admin("Add an interview question", {
      description:
        "If a deleted question in this skill has the same title, it is restored with this content.",
      requestBody: json(adminQuestionInputSchema),
      responses: {
        ...ok(adminQuestionSchema, "The new question.", "201"),
        ...errors({
          ...adminAuth,
          404: "`SKILL_NOT_FOUND`.",
          409: "`QUESTION_EXISTS` — a live question in this skill has that title.",
          ...VALIDATION_422,
        }),
      },
    }),
  },
  "/api/v1/admin/questions/{id}": {
    patch: admin("Edit an interview question", {
      description: "Send only the fields to change. `is_active: false` hides it from students.",
      requestParams: questionPath,
      requestBody: json(adminQuestionPatchSchema),
      responses: {
        ...ok(adminQuestionSchema, "The updated question."),
        ...errors({
          ...adminAuth,
          404: "`QUESTION_NOT_FOUND` or `SKILL_NOT_FOUND`.",
          409: "`QUESTION_EXISTS`.",
          ...VALIDATION_422,
        }),
      },
    }),
    delete: admin("Delete an interview question", {
      description: "Soft delete: hidden everywhere; students' progress rows stay valid.",
      requestParams: questionPath,
      responses: {
        ...ok(deleted, "Deleted."),
        ...errors({ ...adminAuth, 404: "`QUESTION_NOT_FOUND`.", ...VALIDATION_422 }),
      },
    }),
  },
  "/api/v1/admin/question-taxonomy": {
    get: admin("Company and role lists", {
      description: "The fixed lists questions and guides are tagged with.",
      responses: { ...ok(taxonomySchema, "The lists."), ...errors(adminAuth) },
    }),
  },
  "/api/v1/admin/prep-pdfs": {
    get: admin("List prep guides", {
      responses: {
        ...ok(z.array(adminPrepPdfSchema), "All guides, newest first."),
        ...errors(adminAuth),
      },
    }),
    post: admin("Add a prep guide", {
      description: "Paste a public link to the PDF (no file upload yet).",
      requestBody: json(adminPrepPdfInputSchema),
      responses: {
        ...ok(adminPrepPdfSchema, "The new guide.", "201"),
        ...errors({ ...adminAuth, 404: "`SKILL_NOT_FOUND`.", ...VALIDATION_422 }),
      },
    }),
  },
  "/api/v1/admin/prep-pdfs/{id}": {
    patch: admin("Edit a prep guide", {
      requestParams: pdfPath,
      requestBody: json(adminPrepPdfPatchSchema),
      responses: {
        ...ok(adminPrepPdfSchema, "The updated guide."),
        ...errors({
          ...adminAuth,
          404: "`PREP_PDF_NOT_FOUND` or `SKILL_NOT_FOUND`.",
          ...VALIDATION_422,
        }),
      },
    }),
    delete: admin("Delete a prep guide", {
      requestParams: pdfPath,
      responses: {
        ...ok(deleted, "Deleted."),
        ...errors({ ...adminAuth, 404: "`PREP_PDF_NOT_FOUND`.", ...VALIDATION_422 }),
      },
    }),
  },
};
