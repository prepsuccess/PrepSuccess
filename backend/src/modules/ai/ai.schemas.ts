import { z } from "zod";

export const aiStatusSchema = z
  .object({
    available: z.boolean().meta({ description: "False when AI isn't configured on the server." }),
    allowed: z
      .boolean()
      .meta({ description: "Whether this user can make an AI request right now." }),
    reason: z
      .enum(["AI_NOT_CONFIGURED", "AI_TRIAL_ENDED", "AI_DAILY_LIMIT"])
      .nullable()
      .meta({ description: "Why `allowed` is false." }),
    trial: z.object({
      active: z.boolean(),
      ends_at: z.iso.datetime(),
      days_left: z.number().int().meta({ example: 87 }),
      enforced: z
        .boolean()
        .meta({ description: "While false, an ended trial is shown but doesn't block AI." }),
    }),
    today: z.object({
      requests: z.number().int().meta({ example: 12 }),
      limit: z.number().int().meta({ example: 200 }),
    }),
  })
  .meta({ id: "AiStatus" });
