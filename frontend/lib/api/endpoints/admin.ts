import { baseApi, type ResponseMeta } from "../baseApi";
import type {
  AdminAnalytics,
  AdminPrepPdf,
  AdminPrepPdfInput,
  AdminQuestion,
  AdminQuestionInput,
  QuestionTaxonomy,
  AdminCreateResourceRequest,
  AdminResource,
  AdminSkill,
  AdminTask,
  AdminUpdateSkillRequest,
  AdminUpdateUserRequest,
  AdminUser,
  PageMeta,
} from "../types";
import type {
  AdminFeedback,
  AdminFeedbackPatch,
  FeedbackCategory,
  FeedbackStatus,
  FeedbackSummary,
} from "../types";
import { cleanParams } from "./feedback";

export interface AdminUsersQuery {
  q?: string;
  role?: AdminUser["role"];
  status?: "active" | "inactive";
  page: number;
  limit: number;
}

export interface AdminQuestionsQuery {
  skill?: string;
  q?: string;
  page: number;
  limit: number;
}

// POST /admin/questions/import. Local types until schema.d.ts is regenerated.
export interface AdminQuestionImportRequest {
  /** Rows as read from the file; the server checks each one on its own. */
  questions: Record<string, unknown>[];
  /** true: report what would happen, save nothing. */
  dry_run?: boolean;
}

export interface AdminQuestionImportResult {
  created: number;
  restored: number;
  skipped: number;
  /** `row` is 1-based, in file order. */
  errors: { row: number; title?: string; message: string }[];
}

export interface AdminFeedbackQuery {
  status?: FeedbackStatus;
  category?: FeedbackCategory;
  /** Searches the message and the student's name and email. */
  q?: string;
  page: number;
  limit: number;
}

/** GET /admin/feedback/summary — how many items are in each status. */
export type AdminFeedbackSummary = FeedbackSummary;

/** PATCH /admin/feedback/:id. A null remark clears it. */
export type AdminFeedbackUpdate = AdminFeedbackPatch & { id: string };

/** /api/v1/admin — admins only; the backend enforces the role on every route. */
export const adminApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAdminUsers: build.query<{ users: AdminUser[]; meta: PageMeta }, AdminUsersQuery>({
      query: (params) => ({
        url: "/api/v1/admin/users",
        // Drop empty filters so the URL stays clean.
        params: Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v != null)),
      }),
      transformResponse: (users: AdminUser[], meta: ResponseMeta | undefined, arg) => ({
        users,
        meta: meta?.pagination ?? { page: arg.page, limit: arg.limit, total: users.length },
      }),
      providesTags: ["AdminUsers"],
    }),
    updateAdminUser: build.mutation<AdminUser, AdminUpdateUserRequest & { id: string }>({
      query: ({ id, ...body }) => ({ url: `/api/v1/admin/users/${id}`, method: "PATCH", body }),
      invalidatesTags: (result) => (result ? ["AdminUsers", "AdminAnalytics"] : []),
    }),
    getAdminAnalytics: build.query<AdminAnalytics, void>({
      query: () => "/api/v1/admin/analytics",
      providesTags: ["AdminAnalytics"],
    }),
    getAdminSkills: build.query<AdminSkill[], void>({
      query: () => "/api/v1/admin/skills",
      providesTags: ["AdminSkills"],
    }),
    updateAdminSkill: build.mutation<AdminSkill, AdminUpdateSkillRequest & { id: string }>({
      query: ({ id, ...body }) => ({ url: `/api/v1/admin/skills/${id}`, method: "PATCH", body }),
      invalidatesTags: (result) => (result ? ["AdminSkills", "MySkills"] : []),
    }),
    getAdminResources: build.query<AdminResource[], string>({
      query: (skillId) => `/api/v1/admin/skills/${skillId}/resources`,
      providesTags: (_result, _error, skillId) => [{ type: "AdminResources", id: skillId }],
    }),
    createAdminResource: build.mutation<AdminResource, AdminCreateResourceRequest>({
      query: (body) => ({ url: "/api/v1/admin/resources", method: "POST", body }),
      invalidatesTags: (result) =>
        result ? [{ type: "AdminResources", id: result.skill_id }, "AdminSkills", "Resources"] : [],
    }),
    deleteAdminResource: build.mutation<{ id: string }, { id: string; skillId: string }>({
      query: ({ id }) => ({ url: `/api/v1/admin/resources/${id}`, method: "DELETE" }),
      invalidatesTags: (result, _error, { skillId }) =>
        result ? [{ type: "AdminResources", id: skillId }, "AdminSkills", "Resources"] : [],
    }),
    getAdminTasks: build.query<AdminTask[], string>({
      query: (skillId) => `/api/v1/admin/skills/${skillId}/tasks`,
      providesTags: (_result, _error, skillId) => [{ type: "AdminTasks", id: skillId }],
    }),
    updateAdminTask: build.mutation<AdminTask, { id: string; is_active: boolean }>({
      query: ({ id, ...body }) => ({ url: `/api/v1/admin/tasks/${id}`, method: "PATCH", body }),
      invalidatesTags: (result) =>
        result ? [{ type: "AdminTasks", id: result.skill_id }, "AdminSkills", "Tasks"] : [],
    }),

    // ---- Phase 2: interview questions and prep PDFs ----
    getAdminQuestions: build.query<
      { questions: AdminQuestion[]; meta: PageMeta },
      AdminQuestionsQuery
    >({
      query: (params) => ({
        url: "/api/v1/admin/questions",
        params: Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v != null)),
      }),
      transformResponse: (questions: AdminQuestion[], meta: ResponseMeta | undefined, arg) => ({
        questions,
        meta: meta?.pagination ?? { page: arg.page, limit: arg.limit, total: questions.length },
      }),
      providesTags: ["AdminQuestions"],
    }),
    createAdminQuestion: build.mutation<AdminQuestion, AdminQuestionInput>({
      query: (body) => ({ url: "/api/v1/admin/questions", method: "POST", body }),
      invalidatesTags: (result) => (result ? ["AdminQuestions", "Questions"] : []),
    }),
    updateAdminQuestion: build.mutation<
      AdminQuestion,
      Partial<AdminQuestionInput> & { id: string }
    >({
      query: ({ id, ...body }) => ({ url: `/api/v1/admin/questions/${id}`, method: "PATCH", body }),
      invalidatesTags: (result) => (result ? ["AdminQuestions", "Questions"] : []),
    }),
    importAdminQuestions: build.mutation<AdminQuestionImportResult, AdminQuestionImportRequest>({
      query: (body) => ({ url: "/api/v1/admin/questions/import", method: "POST", body }),
      invalidatesTags: (result, _error, { dry_run }) =>
        result && !dry_run && result.created + result.restored > 0
          ? ["AdminQuestions", "Questions"]
          : [],
    }),
    deleteAdminQuestion: build.mutation<{ id: string; deleted: true }, string>({
      query: (id) => ({ url: `/api/v1/admin/questions/${id}`, method: "DELETE" }),
      invalidatesTags: (result) => (result ? ["AdminQuestions", "Questions"] : []),
    }),
    getQuestionTaxonomy: build.query<QuestionTaxonomy, void>({
      query: () => "/api/v1/admin/question-taxonomy",
    }),
    getAdminPrepPdfs: build.query<AdminPrepPdf[], void>({
      query: () => "/api/v1/admin/prep-pdfs",
      providesTags: ["AdminPrepPdfs"],
    }),
    createAdminPrepPdf: build.mutation<AdminPrepPdf, AdminPrepPdfInput>({
      query: (body) => ({ url: "/api/v1/admin/prep-pdfs", method: "POST", body }),
      invalidatesTags: (result) => (result ? ["AdminPrepPdfs", "PrepPdfs"] : []),
    }),
    updateAdminPrepPdf: build.mutation<AdminPrepPdf, Partial<AdminPrepPdfInput> & { id: string }>({
      query: ({ id, ...body }) => ({ url: `/api/v1/admin/prep-pdfs/${id}`, method: "PATCH", body }),
      invalidatesTags: (result) => (result ? ["AdminPrepPdfs", "PrepPdfs"] : []),
    }),
    deleteAdminPrepPdf: build.mutation<{ id: string; deleted: true }, string>({
      query: (id) => ({ url: `/api/v1/admin/prep-pdfs/${id}`, method: "DELETE" }),
      invalidatesTags: (result) => (result ? ["AdminPrepPdfs", "PrepPdfs"] : []),
    }),

    // ---- Student feedback ----
    getAdminFeedback: build.query<
      { feedback: AdminFeedback[]; meta: PageMeta },
      AdminFeedbackQuery
    >({
      query: (params) => ({ url: "/api/v1/admin/feedback", params: cleanParams(params) }),
      transformResponse: (feedback: AdminFeedback[], meta: ResponseMeta | undefined, arg) => ({
        feedback,
        meta: meta?.pagination ?? { page: arg.page, limit: arg.limit, total: feedback.length },
      }),
      providesTags: ["AdminFeedback"],
    }),
    getAdminFeedbackSummary: build.query<AdminFeedbackSummary, void>({
      query: () => "/api/v1/admin/feedback/summary",
      providesTags: ["AdminFeedback"],
    }),
    getAdminFeedbackItem: build.query<AdminFeedback, string>({
      query: (id) => `/api/v1/admin/feedback/${id}`,
      providesTags: ["AdminFeedback"],
    }),
    // The list, the counts and the open item all carry the tag, so they all refresh.
    updateAdminFeedback: build.mutation<AdminFeedback, AdminFeedbackUpdate>({
      query: ({ id, ...body }) => ({ url: `/api/v1/admin/feedback/${id}`, method: "PATCH", body }),
      // Show the saved item straight away, while the list and counts refetch.
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(adminApi.util.upsertQueryData("getAdminFeedbackItem", id, data));
        } catch {
          // The form shows the error.
        }
      },
      invalidatesTags: (result) => (result ? ["AdminFeedback"] : []),
    }),
  }),
});

export const {
  useGetAdminFeedbackQuery,
  useGetAdminFeedbackSummaryQuery,
  useGetAdminFeedbackItemQuery,
  useUpdateAdminFeedbackMutation,
  useGetAdminQuestionsQuery,
  useCreateAdminQuestionMutation,
  useUpdateAdminQuestionMutation,
  useDeleteAdminQuestionMutation,
  useImportAdminQuestionsMutation,
  useGetQuestionTaxonomyQuery,
  useGetAdminPrepPdfsQuery,
  useCreateAdminPrepPdfMutation,
  useUpdateAdminPrepPdfMutation,
  useDeleteAdminPrepPdfMutation,
  useGetAdminUsersQuery,
  useUpdateAdminUserMutation,
  useGetAdminAnalyticsQuery,
  useGetAdminSkillsQuery,
  useUpdateAdminSkillMutation,
  useGetAdminResourcesQuery,
  useCreateAdminResourceMutation,
  useDeleteAdminResourceMutation,
  useGetAdminTasksQuery,
  useUpdateAdminTaskMutation,
} = adminApi;
