import { z } from "zod";

import { skillSchema } from "../skills/skills.schemas.js";
import {
  MAX_SUBMISSION_CHARS,
  MIN_SUBMISSION_CHARS,
  TASK_LANGUAGES,
  TASK_PASS_PERCENT,
} from "./tasks.logic.js";

export const listTasksQuerySchema = z
  .object({
    skill: z
      .string()
      .trim()
      .min(1, "Pick a skill.")
      .max(120)
      .meta({ description: "The skill's slug.", example: "sql" }),
  })
  .meta({ id: "ListTasksQuery" });

export const taskIdParamsSchema = z.object({ id: z.uuid("That task doesn't exist.") });

export const submitTaskSchema = z
  .object({
    content: z
      .string()
      .trim()
      .min(MIN_SUBMISSION_CHARS, `Write at least ${MIN_SUBMISSION_CHARS} characters.`)
      .max(
        MAX_SUBMISSION_CHARS,
        `Keep it under ${MAX_SUBMISSION_CHARS.toLocaleString()} characters.`,
      )
      .meta({ description: "The student's code or written answer." }),
  })
  .meta({ id: "SubmitTaskRequest" });

const difficulty = z.enum(["easy", "medium", "hard"]);
const language = z.enum(TASK_LANGUAGES).meta({
  description: "Editor language. 'text' is a plain written answer.",
  example: "javascript",
});
const runner = z.enum(["run", "preview"]).nullable().meta({
  description:
    "How the browser can try the answer: 'run' executes JavaScript and shows console output, 'preview' renders an HTML page; null if neither.",
});

const bestSchema = z
  .object({
    percent: z.number().int(),
    passed: z.boolean(),
  })
  .nullable()
  .meta({ description: "The student's best attempt so far; null if never attempted." });

export const taskSummarySchema = z
  .object({
    id: z.uuid(),
    skill_id: z.uuid(),
    title: z.string().meta({ example: "Top earners per department" }),
    difficulty,
    language,
    runner,
    attempts: z.number().int(),
    best: bestSchema,
  })
  .meta({ id: "TaskSummary" });

export const skillTasksSchema = z
  .object({ skill: skillSchema, tasks: z.array(taskSummarySchema) })
  .meta({ id: "SkillTasks" });

export const rubricCriterionSchema = z
  .object({
    id: z.string().meta({ example: "join" }),
    description: z.string(),
    points: z.number().int(),
  })
  .meta({ id: "RubricCriterion" });

export const submissionSchema = z
  .object({
    id: z.uuid(),
    content: z.string(),
    percent: z.number().int().meta({ example: 70 }),
    passed: z.boolean(),
    pass_mark: z.number().int().meta({ example: TASK_PASS_PERCENT }),
    feedback: z.object({
      summary: z.string(),
      strengths: z.array(z.string()),
      improvements: z.array(z.string()),
      criteria: z.array(
        rubricCriterionSchema.extend({
          score: z.number().meta({ description: "Points awarded, in halves." }),
          comment: z.string(),
        }),
      ),
    }),
    created_at: z.iso.datetime(),
  })
  .meta({ id: "TaskSubmission" });

export const taskDetailSchema = z
  .object({
    id: z.uuid(),
    skill: skillSchema,
    title: z.string(),
    description: z.string().meta({
      description:
        "Blank line = new paragraph, lines starting '- ' are a list, ``` fences are code.",
    }),
    difficulty,
    language,
    runner,
    starter_code: z
      .string()
      .nullable()
      .meta({ description: "Code or an outline pre-filled in the editor." }),
    pass_mark: z.number().int().meta({ example: TASK_PASS_PERCENT }),
    rubric: z.array(rubricCriterionSchema),
    submissions: z
      .array(submissionSchema)
      .meta({ description: "The student's attempts, newest first." }),
  })
  .meta({ id: "TaskDetail" });

export type TaskSummaryResponse = z.infer<typeof taskSummarySchema>;
export type SkillTasksResponse = z.infer<typeof skillTasksSchema>;
export type SubmissionResponse = z.infer<typeof submissionSchema>;
export type TaskDetailResponse = z.infer<typeof taskDetailSchema>;
