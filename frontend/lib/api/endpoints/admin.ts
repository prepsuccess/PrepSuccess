import { baseApi, type ResponseMeta } from "../baseApi";
import type {
  AdminAnalytics,
  AdminCreateResourceRequest,
  AdminResource,
  AdminSkill,
  AdminTask,
  AdminUpdateSkillRequest,
  AdminUpdateUserRequest,
  AdminUser,
  PageMeta,
} from "../types";

export interface AdminUsersQuery {
  q?: string;
  role?: AdminUser["role"];
  status?: "active" | "inactive";
  page: number;
  limit: number;
}

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
  }),
});

export const {
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
