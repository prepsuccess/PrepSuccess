import { baseApi } from "../baseApi";
import type { AiInsight, Dashboard } from "../types";

/** /api/v1/dashboard and the AI coach's take (/api/v1/ai/insight). */
export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDashboard: build.query<Dashboard, void>({
      query: () => "/api/v1/dashboard",
      providesTags: ["Dashboard"],
    }),
    getInsight: build.query<AiInsight, void>({
      query: () => "/api/v1/ai/insight",
      providesTags: ["Insight"],
      // Writing a new take is an AI call (a cached one isn't, but the client
      // can't tell), so refetch AI usage once it lands, success or not.
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch {
          // The card shows the error.
        }
        dispatch(baseApi.util.invalidateTags(["AiStatus"]));
      },
    }),
  }),
});

export const { useGetDashboardQuery, useGetInsightQuery } = dashboardApi;
