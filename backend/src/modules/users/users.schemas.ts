import { z } from "zod";

/**
 * The known fields of `user_profiles.profile_data`. The column is schemaless
 * JSONB so the AI onboarding can grow, but everything written through the API
 * — manual edits now, the onboarding agent later — goes through these rules,
 * so both produce the same shape. Keys are snake_case, like the rest of the API.
 */
export const profileFields = {
  college: z.string().trim().min(1).max(150).meta({ example: "Christ University" }),
  degree: z.string().trim().min(1).max(100).meta({ example: "BCA" }),
  branch: z.string().trim().min(1).max(100).meta({ example: "Computer Applications" }),
  student_year: z
    .number()
    .int()
    .min(1)
    .max(6)
    .meta({ description: "Current year of study.", example: 3 }),
  graduation_year: z.number().int().min(2000).max(2100).meta({ example: 2027 }),
  target_role: z.string().trim().min(1).max(100).meta({ example: "SDE" }),
  mobile_no: z
    .string()
    .trim()
    .regex(/^\+?\d[\d\s-]{6,18}\d$/, "Enter a valid phone number.")
    .meta({ example: "+91 98765 43210" }),
  age: z.number().int().min(13).max(100).meta({ example: 21 }),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]),
  location: z.string().trim().min(1).max(100).meta({ example: "Bengaluru" }),
  skills: z
    .array(z.string().trim().min(1).max(50))
    .max(50)
    .meta({
      description: "Skills the student claims; the assessment verifies them.",
      example: ["HTML", "CSS", "JavaScript"],
    }),
  interests: z
    .array(z.string().trim().min(1).max(50))
    .max(20)
    .meta({ example: ["Web development"] }),
  goals: z
    .array(z.string().trim().min(1).max(200))
    .max(10)
    .meta({ example: ["Get placed as a frontend developer"] }),
  experience: z
    .string()
    .trim()
    .max(2000)
    .meta({ example: "Built a college fest website; 2-month internship." }),
};

type PatchShape = {
  [K in keyof typeof profileFields]: z.ZodOptional<z.ZodNullable<(typeof profileFields)[K]>>;
};

/** Every field optional; `null` removes it. Unknown keys are rejected. */
export const profilePatchSchema = z
  .strictObject(
    Object.fromEntries(
      Object.entries(profileFields).map(([key, schema]) => [key, schema.nullable().optional()]),
    ) as PatchShape,
  )
  .meta({ id: "ProfilePatch" });

export const updateMeSchema = z
  .strictObject({
    first_name: z
      .string()
      .trim()
      .min(1, "Enter your first name.")
      .max(100)
      .optional()
      .meta({ example: "Asha" }),
    last_name: z.string().trim().max(100).nullable().optional().meta({ example: "Verma" }),
    profile: profilePatchSchema.optional(),
  })
  .refine((body) => Object.values(body).some((value) => value !== undefined), {
    message: "Send at least one field to update.",
  })
  .meta({
    id: "UpdateMeRequest",
    description:
      "Partial update. Profile fields are merged into the existing profile: omitted fields are kept, `null` clears one.",
  });

export type UpdateMeInput = z.infer<typeof updateMeSchema>;
