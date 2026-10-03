import { z } from "zod";

import type { LearningResource } from "../../generated/prisma/client.js";
import { skillSchema } from "../skills/skills.schemas.js";

export const resourceTypes = ["reference", "example", "lecture", "practice"] as const;

export const listResourcesQuerySchema = z
  .object({
    skill: z
      .string()
      .trim()
      .min(1, "Pick a skill.")
      .max(120)
      .meta({ description: "The skill's slug.", example: "sql" }),
  })
  .meta({ id: "ListResourcesQuery" });

export const resourceSchema = z
  .object({
    id: z.uuid(),
    title: z.string().meta({ example: "Interactive SQL lessons" }),
    type: z.enum(resourceTypes),
    url: z
      .string()
      .nullable()
      .meta({ description: "Outside link; null for notes hosted by PrepSuccess." }),
    content: z.string().nullable().meta({
      description:
        "Hosted notes (blank line = new paragraph, lines starting '- ' are a list); null for links.",
    }),
    source: z.string().nullable().meta({ example: "SQLBolt" }),
  })
  .meta({ id: "LearningResource" });

export const skillResourcesSchema = z
  .object({ skill: skillSchema, resources: z.array(resourceSchema) })
  .meta({ id: "SkillResources" });

export type ResourceResponse = z.infer<typeof resourceSchema>;
export type SkillResourcesResponse = z.infer<typeof skillResourcesSchema>;

export function toResource(resource: LearningResource): ResourceResponse {
  return {
    id: resource.id,
    title: resource.title,
    type: resource.type.toLowerCase() as ResourceResponse["type"],
    url: resource.url,
    content: resource.content,
    source: resource.source,
  };
}
