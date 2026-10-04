import { baseApi, type ResponseMeta } from "../baseApi";
import type { Feedback, FeedbackInput, PageMeta } from "../types";

export type {
  AdminFeedback,
  Feedback,
  FeedbackCategory,
  FeedbackImage,
  FeedbackStatus,
} from "../types";

/** POST /feedback. Each image's `data` is a data URL, e.g. "data:image/jpeg;base64,...". */
export type SendFeedbackRequest = FeedbackInput;

export type FeedbackPage = { feedback: Feedback[]; meta: PageMeta };

export const FEEDBACK_MESSAGE_MIN = 10;
export const FEEDBACK_MESSAGE_MAX = 2000;
export const FEEDBACK_MAX_IMAGES = 3;

/** Drop empty filters so URLs (and cache keys) stay clean. */
export const cleanParams = (params: object) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v != null));

/** /api/v1/feedback — what a student sends us, and the team's replies. */
export const feedbackApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMyFeedback: build.query<FeedbackPage, { page: number; limit: number }>({
      query: (params) => ({ url: "/api/v1/feedback/mine", params }),
      transformResponse: (feedback: Feedback[], meta: ResponseMeta | undefined, arg) => ({
        feedback,
        meta: meta?.pagination ?? { page: arg.page, limit: arg.limit, total: feedback.length },
      }),
      providesTags: ["Feedback"],
    }),
    sendFeedback: build.mutation<Feedback, SendFeedbackRequest>({
      query: (body) => ({ url: "/api/v1/feedback", method: "POST", body }),
      invalidatesTags: (result) => (result ? ["Feedback", "AdminFeedback"] : []),
    }),
  }),
});

export const { useGetMyFeedbackQuery, useSendFeedbackMutation } = feedbackApi;
