import { APTITUDE_QUESTIONS } from "./library/aptitude.js";
import { BACKEND_QUESTIONS } from "./library/backend.js";
import { CS_QUESTIONS } from "./library/cs.js";
import { DATA_QUESTIONS } from "./library/data.js";
import type { CatalogueQuestion } from "./library/helpers.js";
import { LANGUAGES_QUESTIONS } from "./library/languages.js";
import { SOFT_QUESTIONS } from "./library/soft.js";
import { TOOLS_QUESTIONS } from "./library/tools.js";
import { WEB_QUESTIONS } from "./library/web.js";

export type { CatalogueQuestion };

/**
 * Starter interview-question bank (Phase 2), about 20 per skill. Written with
 * AI help: the team reviews it before launch (docs/PHASE_2_PLAN.md §9).
 */
export const QUESTION_CATALOGUE: CatalogueQuestion[] = [
  ...WEB_QUESTIONS,
  ...BACKEND_QUESTIONS,
  ...LANGUAGES_QUESTIONS,
  ...CS_QUESTIONS,
  ...DATA_QUESTIONS,
  ...TOOLS_QUESTIONS,
  ...APTITUDE_QUESTIONS,
  ...SOFT_QUESTIONS,
];
