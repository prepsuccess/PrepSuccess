import { baseApi } from "../baseApi";
import type { AnswerRequest, AssessmentState, MySkills } from "../types";

/** /api/v1/skills and /api/v1/ai/assessment — the student's skills and their skill checks. */
export const skillsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMySkills: build.query<MySkills, void>({
      query: () => "/api/v1/skills/mine",
      providesTags: ["MySkills"],
    }),
    getAssessment: build.query<AssessmentState, string>({
      query: (id) => `/api/v1/ai/assessment/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Assessment", id }],
    }),
    startAssessment: build.mutation<AssessmentState, string>({
      query: (skillId) => ({
        url: "/api/v1/ai/assessment/start",
        method: "POST",
        body: { skill_id: skillId },
      }),
      // Seed the check's cache so its page opens without another request.
      async onQueryStarted(_skillId, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            skillsApi.util.upsertQueryEntries([
              { endpointName: "getAssessment", arg: data.id, value: data },
            ]),
          );
        } catch {
          // The caller shows the error.
        }
      },
      // A new check changes "Resume" buttons and uses one AI call.
      invalidatesTags: (result) => (result ? ["MySkills", "AiStatus", "Dashboard"] : []),
    }),
    answerQuestion: build.mutation<AssessmentState, AnswerRequest & { id: string }>({
      query: ({ id, ...body }) => ({
        url: `/api/v1/ai/assessment/${id}/answer`,
        method: "POST",
        body,
      }),
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            skillsApi.util.upsertQueryEntries([
              { endpointName: "getAssessment", arg: id, value: data },
            ]),
          );
        } catch {
          // The caller shows the error.
        }
      },
      // A finished check changes the skill list, the dashboard and the coach's take.
      invalidatesTags: (result) =>
        result?.status === "completed" ? ["MySkills", "Dashboard", "Insight"] : [],
    }),
  }),
});

export const {
  useGetMySkillsQuery,
  useGetAssessmentQuery,
  useStartAssessmentMutation,
  useAnswerQuestionMutation,
} = skillsApi;
