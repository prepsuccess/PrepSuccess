import { z } from "zod";

import { COACH_DAILY_LIMIT, MAX_MESSAGE_CHARS } from "./coach.logic.js";

export const coachMessageSchema = z
  .object({
    content: z
      .string()
      .trim()
      .min(1, "Type a question.")
      .max(MAX_MESSAGE_CHARS, `Keep it under ${MAX_MESSAGE_CHARS} characters.`),
    context: z
      .object({
        question_id: z.uuid().meta({ description: "The interview question open on the page." }),
      })
      .optional()
      .meta({
        description:
          "What the student is looking at. Used for this reply only and not saved; an unknown or " +
          "removed question is ignored.",
      }),
  })
  .meta({ id: "CoachMessageRequest" });

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  created_at: z.iso.datetime(),
  nudge: z
    .boolean()
    .optional()
    .meta({ description: "True for the coach's own check-in (not a reply)." }),
});

export const coachStateSchema = z
  .object({
    messages: z.array(chatMessageSchema).meta({ description: "Oldest first." }),
    usage: z.object({
      used: z.number().int().meta({ description: "Messages sent to the coach today." }),
      limit: z.number().int().meta({ example: COACH_DAILY_LIMIT }),
      remaining: z.number().int(),
      resets_at: z.iso.datetime().meta({ description: "Next midnight IST." }),
    }),
    suggestions: z
      .array(z.string())
      .meta({ description: "Starter questions based on the student's data." }),
  })
  .meta({ id: "CoachState" });

export const coachPingSchema = z
  .object({
    nudged: z
      .boolean()
      .meta({ description: "True when this ping triggered the coach's daily check-in." }),
  })
  .meta({ id: "CoachPing" });

export type CoachChatMessage = z.infer<typeof chatMessageSchema>;
export type CoachState = z.infer<typeof coachStateSchema>;
