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
export type SkillOptions = OnboardingState["skill_options"];
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

export type ForgotPasswordRequest = Schemas["ForgotPasswordRequest"];
export type ResetPasswordRequest = Schemas["ResetPasswordRequest"];

export type LearningResource = Schemas["LearningResource"];
export type SkillResources = Schemas["SkillResources"];
export type TaskSummary = Schemas["TaskSummary"];
export type SkillTasks = Schemas["SkillTasks"];
export type TaskDetail = Schemas["TaskDetail"];
export type TaskSubmission = Schemas["TaskSubmission"];
export type RubricCriterion = Schemas["RubricCriterion"];

export type AppNotification = Schemas["Notification"];
export type NotificationList = Schemas["NotificationList"];

export type AdminUser = Schemas["AdminUser"];
export type AdminUpdateUserRequest = Schemas["AdminUpdateUserRequest"];
export type AdminAnalytics = Schemas["AdminAnalytics"];
export type AdminSkill = Schemas["AdminSkill"];
export type AdminUpdateSkillRequest = Schemas["AdminUpdateSkillRequest"];
export type AdminResource = Schemas["AdminResource"];
export type AdminCreateResourceRequest = Schemas["AdminCreateResourceRequest"];
export type AdminTask = Schemas["AdminTask"];
export type PageMeta = { page: number; limit: number; total: number };

export type CoachState = Schemas["CoachState"];
export type CoachMessage = CoachState["messages"][number];
export type CoachPing = Schemas["CoachPing"];

// Phase 2: interview question bank.
export type QuestionSummary = Schemas["QuestionSummary"];
export type QuestionDetail = Schemas["QuestionDetail"];
export type QuestionFilters = Schemas["QuestionFilters"];
export type QuestionProgress = Schemas["QuestionProgress"];
export type QuestionDifficulty = QuestionSummary["difficulty"];
export type Progress = Schemas["Progress"];
export type PrepPdf = Schemas["PrepPdf"];
export type AdminQuestion = Schemas["AdminQuestion"];
export type AdminQuestionInput = Schemas["AdminQuestionInput"];
export type AdminPrepPdf = Schemas["AdminPrepPdf"];
export type AdminPrepPdfInput = Schemas["AdminPrepPdfInput"];
export type QuestionTaxonomy = Schemas["QuestionTaxonomy"];

// Student feedback (bug reports, ideas, content issues) and the admin's replies.
export type Feedback = Schemas["Feedback"];
export type FeedbackImage = Schemas["FeedbackImage"];
export type FeedbackCategory = Feedback["category"];
export type FeedbackStatus = Feedback["status"];
export type FeedbackInput = Schemas["FeedbackInput"];
export type AdminFeedback = Schemas["AdminFeedback"];
export type AdminFeedbackPatch = Schemas["AdminFeedbackPatch"];
export type FeedbackSummary = Schemas["FeedbackSummary"];
