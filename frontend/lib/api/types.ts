import type { components } from "./schema";

/**
 * API types, derived from schema.d.ts — which is generated from the backend's
 * OpenAPI spec (`npm run api:types`). Never hand-write a response shape here;
 * if the backend changes, regenerate and let TypeScript point at what broke.
 */
type Schemas = components["schemas"];

/**
 * The student's profile. The backend stores it as schemaless JSON, so the
 * known fields come from the PATCH schema; onboarding may add others.
 */
export type StudentProfile = {
  [K in keyof Schemas["ProfilePatch"]]?: NonNullable<Schemas["ProfilePatch"][K]>;
} & { [key: string]: unknown };

export type AuthUser = Omit<Schemas["AuthUser"], "profile"> & { profile: StudentProfile };
export type UserRole = AuthUser["role"];
export type TokenResponse = Omit<Schemas["TokenResponse"], "user"> & { user: AuthUser };

export type SendOtpRequest = Schemas["SendOtpRequest"];
export type SendOtpResponse = Schemas["SendOtpResponse"];
export type RegisterRequest = Schemas["RegisterRequest"];
export type LoginRequest = Schemas["LoginRequest"];
export type UpdateMeRequest = Schemas["UpdateMeRequest"];
export type AiStatus = Schemas["AiStatus"];

export type OnboardingState = Omit<Schemas["OnboardingState"], "profile"> & {
  profile: StudentProfile;
};
export type OnboardingMessage = OnboardingState["messages"][number];
export type OnboardingReply = { onboarding: OnboardingState; user: AuthUser };

export type Skill = Schemas["Skill"];
export type SkillCategory = Skill["category"];
export type MySkill = Schemas["MySkill"];
export type MySkills = Schemas["MySkills"];
export type AssessmentState = Schemas["AssessmentState"];
export type AssessmentQuestion = Schemas["AssessmentQuestion"];
export type AnsweredQuestion = Schemas["AssessmentAnsweredQuestion"];
export type AnswerRequest = Schemas["AssessmentAnswerRequest"];

export type Dashboard = Schemas["Dashboard"];
export type DashboardSkillResult = Schemas["DashboardSkillResult"];
export type NextStep = Dashboard["next_steps"][number];
export type AiInsight = Schemas["AiInsight"];
