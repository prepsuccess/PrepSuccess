import { baseApi } from "../baseApi";
import type { SkillResources, SkillTasks, TaskDetail, TaskSubmission } from "../types";

/** /api/v1/resources and /api/v1/tasks — study material and practical tasks per skill. */
export const learningApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getResources: build.query<SkillResources, string>({
      query: (slug) => ({ url: "/api/v1/resources", params: { skill: slug } }),
      providesTags: (_result, _error, slug) => [{ type: "Resources", id: slug }],
    }),
    getTasks: build.query<SkillTasks, string>({
      query: (slug) => ({ url: "/api/v1/tasks", params: { skill: slug } }),
      providesTags: (_result, _error, slug) => [{ type: "Tasks", id: slug }],
    }),
    getTask: build.query<TaskDetail, string>({
      query: (id) => `/api/v1/tasks/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Task", id }],
    }),
    submitTask: build.mutation<TaskSubmission, { id: string; content: string }>({
      query: ({ id, content }) => ({
        url: `/api/v1/tasks/${id}/submit`,
        method: "POST",
        body: { content },
      }),
      // A review is one AI call, changes the task's attempts and best score,
      // the dashboard's task counts, and adds a notification.
      invalidatesTags: (result, _error, { id }) =>
        result
          ? [{ type: "Task", id }, "Tasks", "Dashboard", "AiStatus", "Notifications"]
          : ["AiStatus"],
    }),
  }),
});

export const { useGetResourcesQuery, useGetTasksQuery, useGetTaskQuery, useSubmitTaskMutation } =
  learningApi;
