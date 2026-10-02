import { baseApi } from "../baseApi";
import type { AiStatus } from "../types";

/** /api/v1/ai — AI trial status (onboarding and assessment endpoints join here). */
export const aiApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAiStatus: build.query<AiStatus, void>({
      query: () => "/api/v1/ai/status",
      providesTags: ["AiStatus"],
    }),
  }),
});

export const { useGetAiStatusQuery } = aiApi;
