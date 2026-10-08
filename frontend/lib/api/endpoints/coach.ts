import { baseApi } from "../baseApi";
import type { CoachPing, CoachState } from "../types";

/**
 * POST /ai/coach/messages. `questionId` is the interview question open on the
 * page: the coach sees it for this reply only (sent as `context.question_id`).
 */
export interface CoachMessageInput {
  content: string;
  questionId?: string;
}

/** /api/v1/ai/coach — the coach chat in the bottom-right corner. */
export const coachApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCoach: build.query<CoachState, void>({
      query: () => "/api/v1/ai/coach",
      providesTags: ["Coach"],
    }),
    sendCoachMessage: build.mutation<CoachState, CoachMessageInput>({
      query: ({ content, questionId }) => ({
        url: "/api/v1/ai/coach/messages",
        method: "POST",
        body: questionId ? { content, context: { question_id: questionId } } : { content },
      }),
      // The response is the whole conversation; write it straight into the cache.
      async onQueryStarted(_content, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(coachApi.util.upsertQueryData("getCoach", undefined, data));
        } catch {
          // The chat shows the error; the question stays in the box.
        }
      },
      // Each message also counts toward the AI usage shown elsewhere.
      invalidatesTags: ["AiStatus"],
    }),
    clearCoach: build.mutation<CoachState, void>({
      query: () => ({ url: "/api/v1/ai/coach", method: "DELETE" }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(coachApi.util.upsertQueryData("getCoach", undefined, data));
        } catch {
          // Nothing to undo.
        }
      },
    }),
    pingCoach: build.mutation<CoachPing, void>({
      query: () => ({ url: "/api/v1/ai/coach/ping", method: "POST" }),
      // A check-in just landed: fetch it now so the toast shows straight away.
      invalidatesTags: (result) => (result?.nudged ? ["Notifications", "Coach"] : []),
    }),
  }),
});

export const {
  useGetCoachQuery,
  useSendCoachMessageMutation,
  useClearCoachMutation,
  usePingCoachMutation,
} = coachApi;
