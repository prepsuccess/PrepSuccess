import type { Request, Response } from "express";

import { sendSuccess } from "../../lib/http.js";
import * as admin from "./questions.admin.js";
import {
  adminListQuestionsQuerySchema,
  adminPrepPdfInputSchema,
  adminPrepPdfPatchSchema,
  adminQuestionImportInputSchema,
  adminQuestionInputSchema,
  adminQuestionPatchSchema,
  filtersQuerySchema,
  listQuestionsQuerySchema,
  pageQuerySchema,
  prepPdfIdParamsSchema,
  questionAttemptInputSchema,
  questionIdParamsSchema,
} from "./questions.schemas.js";
import * as questions from "./questions.service.js";

const questionId = (req: Request) => questionIdParamsSchema.parse(req.params).id;
const pdfId = (req: Request) => prepPdfIdParamsSchema.parse(req.params).id;

// ---- Students ----------------------------------------------------------------

export async function list(req: Request, res: Response) {
  const { questions: rows, meta } = await questions.listQuestions(
    req.user!.id,
    listQuestionsQuerySchema.parse(req.query),
  );
  sendSuccess(req, res, rows, { meta });
}

export async function filters(req: Request, res: Response) {
  const { skill } = filtersQuerySchema.parse(req.query);
  sendSuccess(req, res, await questions.filterOptions(skill));
}

export async function mine(req: Request, res: Response) {
  sendSuccess(req, res, await questions.getMyScope(req.user!.id));
}

export async function get(req: Request, res: Response) {
  sendSuccess(req, res, await questions.getQuestion(req.user!.id, questionId(req)));
}

export async function bookmark(req: Request, res: Response) {
  sendSuccess(req, res, await questions.setBookmark(req.user!.id, questionId(req), true));
}

export async function unbookmark(req: Request, res: Response) {
  sendSuccess(req, res, await questions.setBookmark(req.user!.id, questionId(req), false));
}

export async function solve(req: Request, res: Response) {
  sendSuccess(req, res, await questions.setSolved(req.user!.id, questionId(req), true));
}

export async function unsolve(req: Request, res: Response) {
  sendSuccess(req, res, await questions.setSolved(req.user!.id, questionId(req), false));
}

export async function attempt(req: Request, res: Response) {
  const { answer } = questionAttemptInputSchema.parse(req.body);
  sendSuccess(req, res, await questions.attemptQuestion(req.user!.id, questionId(req), answer));
}

export async function bookmarks(req: Request, res: Response) {
  const { page, limit } = pageQuerySchema.parse(req.query);
  const { questions: rows, meta } = await questions.listBookmarks(req.user!.id, page, limit);
  sendSuccess(req, res, rows, { meta });
}

export async function progress(req: Request, res: Response) {
  sendSuccess(req, res, await questions.getProgress(req.user!.id));
}

export async function prepPdfs(req: Request, res: Response) {
  sendSuccess(req, res, await questions.listPrepPdfs());
}

export async function downloadPrepPdf(req: Request, res: Response) {
  sendSuccess(req, res, await questions.downloadPrepPdf(req.user!.id, pdfId(req)));
}

// ---- Admins ------------------------------------------------------------------

export async function adminList(req: Request, res: Response) {
  const { questions: rows, meta } = await admin.listQuestions(
    adminListQuestionsQuerySchema.parse(req.query),
  );
  sendSuccess(req, res, rows, { meta });
}

export async function adminCreate(req: Request, res: Response) {
  const input = adminQuestionInputSchema.parse(req.body);
  sendSuccess(req, res, await admin.createQuestion(req.user!.id, input), { status: 201 });
}

export async function adminImport(req: Request, res: Response) {
  const { questions: rows, dry_run } = adminQuestionImportInputSchema.parse(req.body);
  sendSuccess(req, res, await admin.importQuestions(req.user!.id, rows, dry_run));
}

export async function adminUpdate(req: Request, res: Response) {
  const input = adminQuestionPatchSchema.parse(req.body);
  sendSuccess(req, res, await admin.updateQuestion(questionId(req), input));
}

export async function adminDelete(req: Request, res: Response) {
  sendSuccess(req, res, await admin.deleteQuestion(questionId(req)));
}

export async function adminPdfList(req: Request, res: Response) {
  sendSuccess(req, res, await admin.listPrepPdfs());
}

export async function adminPdfCreate(req: Request, res: Response) {
  const input = adminPrepPdfInputSchema.parse(req.body);
  sendSuccess(req, res, await admin.createPrepPdf(input), { status: 201 });
}

export async function adminPdfUpdate(req: Request, res: Response) {
  const input = adminPrepPdfPatchSchema.parse(req.body);
  sendSuccess(req, res, await admin.updatePrepPdf(pdfId(req), input));
}

export async function adminPdfDelete(req: Request, res: Response) {
  sendSuccess(req, res, await admin.deletePrepPdf(pdfId(req)));
}

export async function adminTaxonomy(req: Request, res: Response) {
  sendSuccess(req, res, admin.taxonomy());
}
