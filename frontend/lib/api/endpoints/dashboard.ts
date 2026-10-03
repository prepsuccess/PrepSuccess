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
    }),
  }),
});

export const { useGetDashboardQuery, useGetInsightQuery } = dashboardApi;
