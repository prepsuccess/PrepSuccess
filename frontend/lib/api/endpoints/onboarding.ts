import { baseApi } from "../baseApi";
import type { OnboardingReply, OnboardingState } from "../types";
import { authApi } from "./auth";

/** /api/v1/ai/onboarding — the AI onboarding chat. */
export const onboardingApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getOnboarding: build.query<OnboardingState, void>({
      query: () => "/api/v1/ai/onboarding",
      providesTags: ["Onboarding"],
    }),
    /** A typed answer, or picked skills (`skills`) with a short summary as `content`. */
    sendOnboardingMessage: build.mutation<OnboardingReply, { content: string; skills?: string[] }>({
      query: (body) => ({
        url: "/api/v1/ai/onboarding/messages",
        method: "POST",
        body,
      }),
      // The student's message shows at once; the AI reply replaces the whole
      // state when it lands. On failure the message is taken back out — the
      // server saved nothing — and the chat puts it back in the box to resend.
      async onQueryStarted({ content }, { dispatch, queryFulfilled }) {
        const optimistic = dispatch(
          onboardingApi.util.updateQueryData("getOnboarding", undefined, (draft) => {
            draft.messages.push({ role: "user", content, created_at: new Date().toISOString() });
          }),
        );
        try {
          const { data } = await queryFulfilled;
          dispatch(
            onboardingApi.util.upsertQueryEntries([
              { endpointName: "getOnboarding", arg: undefined, value: data.onboarding },
            ]),
          );
          // Profile and onboarding_completed changed — every screen showing the user updates.
          dispatch(
            authApi.util.upsertQueryEntries([
              { endpointName: "getMe", arg: undefined, value: data.user },
            ]),
          );
        } catch {
          optimistic.undo();
        }
      },
      // Every reply is one AI call, and a failure may be the daily limit, so AI
      // usage is refetched either way. Finishing onboarding also changes the
      // dashboard's next steps and the claimed skills.
      invalidatesTags: (result) =>
        result?.onboarding.completed
          ? ["AiStatus", "Dashboard", "MySkills", "Questions"]
          : ["AiStatus"],
    }),
  }),
});

export const { useGetOnboardingQuery, useSendOnboardingMessageMutation } = onboardingApi;
