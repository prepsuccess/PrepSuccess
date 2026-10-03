import { z } from "zod";

import { authUserSchema } from "../auth/auth.schemas.js";

export const sendMessageSchema = z
  .object({
    content: z
      .string()
      .trim()
      .min(1, "Type a message first.")
      .max(1000, "Keep it under 1000 characters.")
      .meta({ example: "Final year BCA. I know HTML, CSS and a bit of SQL." }),
    skills: z
      .array(z.string().trim().min(1).max(50))
      .max(40)
      .optional()
      .meta({
        description:
          "Skills or stacks picked from `skill_options`. Saved exactly as picked (no AI), so the student controls the list. Names not in the options are ignored.",
        example: ["MERN stack", "Git & GitHub"],
      }),
  })
  .meta({ id: "OnboardingMessageRequest" });

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  created_at: z.iso.datetime(),
});

export const onboardingStateSchema = z
  .object({
    conversation_id: z.uuid(),
    messages: z.array(chatMessageSchema),
    completed: z.boolean().meta({ description: "True once every required detail is collected." }),
    progress: z.object({
      collected: z.number().int(),
      total: z.number().int(),
      items: z.array(
        z.object({
          field: z.string().meta({ example: "skills" }),
          label: z.string().meta({ example: "Skills you know" }),
          done: z.boolean(),
        }),
      ),
    }),
    profile: z
      .record(z.string(), z.unknown())
      .meta({ description: "Everything collected so far (user_profiles.profile_data)." }),
    skill_options: z
      .object({
        stacks: z.array(
          z.object({
            name: z.string().meta({ example: "MERN stack" }),
            skills: z
              .array(z.string())
              .meta({ example: ["MongoDB", "Express.js", "React", "Node.js", "JavaScript"] }),
          }),
        ),
        topics: z.array(
          z.object({
            topic: z.string().meta({ example: "Web development" }),
            skills: z.array(z.string()).meta({ example: ["HTML", "CSS", "JavaScript"] }),
          }),
        ),
      })
      .meta({
        description:
          "What the student can pick for `skills`: common stacks and every catalogue skill.",
      }),
  })
  .meta({ id: "OnboardingState" });

export const onboardingReplySchema = z
  .object({ onboarding: onboardingStateSchema, user: authUserSchema })
  .meta({ id: "OnboardingReply" });

export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type OnboardingState = z.infer<typeof onboardingStateSchema>;
