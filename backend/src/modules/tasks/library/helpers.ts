import type { Difficulty } from "../../../generated/prisma/client.js";
import type { RubricCriterion } from "../tasks.logic.js";

/**
 * Building blocks for the practical-task catalogue. Rubric points are
 * integers and must total 10. Descriptions use light formatting: blank line =
 * new paragraph, "- " = list item, ``` fences = code. `starter` is optional
 * code (or an outline) pre-filled in the editor, in the skill's editor
 * language (see TASK_LANGUAGE in tasks.logic.ts).
 */
export interface CatalogueTask {
  skill: string;
  title: string;
  difficulty: Difficulty;
  description: string;
  rubric: RubricCriterion[];
  starter?: string;
}

export const task = (
  skill: string,
  title: string,
  difficulty: Difficulty,
  description: string,
  rubric: RubricCriterion[],
  starter?: string,
): CatalogueTask => ({
  skill,
  title,
  difficulty,
  description: description.trim(),
  rubric,
  ...(starter ? { starter: starter.replace(/^\n/, "").replace(/\s+$/, "") + "\n" } : {}),
});

export const c = (id: string, description: string, points: number): RubricCriterion => ({
  id,
  description,
  points,
});
