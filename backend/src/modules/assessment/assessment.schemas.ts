import { z } from "zod";

import { skillSchema } from "../skills/skills.schemas.js";
import { DEFAULT_QUESTIONS, MAX_QUESTIONS, MIN_QUESTIONS } from "./assessment.logic.js";

export const startAssessmentSchema = z
  .object({
    skill_id: z.uuid("Pick a skill to check."),
    question_count: z
      .number()
      .int()
      .min(MIN_QUESTIONS, `Pick at least ${MIN_QUESTIONS} questions.`)
      .max(MAX_QUESTIONS, `Pick at most ${MAX_QUESTIONS} questions.`)
      .default(DEFAULT_QUESTIONS)
      .meta({
        description: `How many questions to ask (${MIN_QUESTIONS}-${MAX_QUESTIONS}). Ignored when resuming an unfinished check.`,
        example: 10,
      }),
  })
  .meta({ id: "StartAssessmentRequest" });

export const answerSchema = z
  .object({
    question_id: z.string().min(1).meta({ example: "q5" }),
    choice_index: z
      .number("Pick an answer.")
      .int()
      .min(0)
      .max(3)
      .meta({ description: "0-based index of the chosen option." }),
  })
  .meta({ id: "AssessmentAnswerRequest" });

const difficulty = z.enum(["easy", "medium", "hard"]);

const currentQuestionSchema = z
  .object({
    id: z.string().meta({ example: "q5" }),
    number: z.number().int().meta({ description: "1-based position in this check." }),
    difficulty,
    question: z.string(),
    options: z.array(z.string()).length(4),
  })
  .meta({ id: "AssessmentQuestion" });

const answeredQuestionSchema = currentQuestionSchema
  .extend({
    chosen_index: z.number().int(),
    correct_index: z.number().int(),
    correct: z.boolean(),
    explanation: z.string(),
  })
  .meta({ id: "AssessmentAnsweredQuestion" });

export const assessmentStateSchema = z
  .object({
    id: z.uuid(),
    skill: skillSchema,
    status: z.enum(["in_progress", "completed"]),
    total_questions: z.number().int().meta({ example: 5 }),
    answered: z.number().int(),
    current_question: currentQuestionSchema
      .nullable()
      .meta({ description: "The question to answer now; null once complete." }),
    answers: z
      .array(answeredQuestionSchema)
      .meta({ description: "Answered questions in order, with the right answer and why." }),
    result: z
      .object({
        score: z.number(),
        max_score: z.number(),
        percent: z.number().int(),
        threshold: z.number().int(),
        mastery: z.enum(["mastered", "needs_revision"]),
      })
      .nullable(),
    started_at: z.iso.datetime(),
    completed_at: z.iso.datetime().nullable(),
  })
  .meta({ id: "AssessmentState" });

export type AssessmentState = z.infer<typeof assessmentStateSchema>;
