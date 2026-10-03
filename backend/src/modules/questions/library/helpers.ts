import type { Difficulty } from "../../../generated/prisma/client.js";
import type { Company, Role } from "../taxonomy.js";

/**
 * One interview question in the starter bank (seeded by prisma/seed.ts,
 * matched by skill + title). Body and answer use the same light formatting
 * as task briefs: blank line = paragraph, "- " = list item, ``` = code.
 */
export interface CatalogueQuestion {
  skill: string;
  title: string;
  topic: string;
  difficulty: Difficulty;
  body: string;
  answer: string;
  company?: Company;
  role?: Role;
}

export const q = (
  skill: string,
  title: string,
  topic: string,
  difficulty: Difficulty,
  body: string,
  answer: string,
  tags: { company?: Company; role?: Role } = {},
): CatalogueQuestion => ({
  skill,
  title,
  topic,
  difficulty,
  body: body.trim(),
  answer: answer.trim(),
  ...tags,
});
