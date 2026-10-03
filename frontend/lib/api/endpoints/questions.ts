import { baseApi, type ResponseMeta } from "../baseApi";
import type {
  PageMeta,
  PrepPdf,
  Progress,
  QuestionDetail,
  QuestionDifficulty,
  QuestionFilters,
  QuestionProgress,
  QuestionSummary,
} from "../types";

export interface QuestionsQuery {
  skill?: string;
  company?: string;
  role?: string;
  topic?: string;
  difficulty?: QuestionDifficulty;
  q?: string;
  status?: "bookmarked" | "solved" | "unsolved";
  page: number;
  limit: number;
}

export type QuestionPage = { questions: QuestionSummary[]; meta: PageMeta };
type Toggle = { id: string; on: boolean };

/** Drop empty filters so URLs (and cache keys) stay clean. */
const clean = (params: object) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v != null));

const toPage = (
  questions: QuestionSummary[],
  meta: ResponseMeta | undefined,
  arg: { page: number; limit: number },
): QuestionPage => ({
  questions,
  meta: meta?.pagination ?? { page: arg.page, limit: arg.limit, total: questions.length },
});

/** /api/v1/questions, /progress, /prep-pdfs — the interview question bank (Phase 2). */
export const questionsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getQuestions: build.query<QuestionPage, QuestionsQuery>({
      query: (params) => ({ url: "/api/v1/questions", params: clean(params) }),
      transformResponse: toPage,
      providesTags: ["Questions"],
    }),
    getQuestionFilters: build.query<QuestionFilters, string | undefined>({
      query: (skill) => ({ url: "/api/v1/questions/filters", params: clean({ skill }) }),
    }),
    getQuestion: build.query<QuestionDetail, string>({
      query: (id) => `/api/v1/questions/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Question", id }],
    }),
    getBookmarks: build.query<QuestionPage, { page: number; limit: number }>({
      query: (params) => ({ url: "/api/v1/questions/bookmarks", params }),
      transformResponse: toPage,
      providesTags: ["Questions"],
    }),
    setBookmark: build.mutation<QuestionProgress, Toggle>({
      query: ({ id, on }) => ({
        url: `/api/v1/questions/${id}/bookmark`,
        method: on ? "POST" : "DELETE",
      }),
      // Flip it on the open question straight away; undo if the server says no.
      async onQueryStarted({ id, on }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          questionsApi.util.updateQueryData("getQuestion", id, (question) => {
            question.bookmarked = on;
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: (result) => (result ? ["Questions", "Progress"] : []),
    }),
    setSolved: build.mutation<QuestionProgress, Toggle>({
      query: ({ id, on }) => ({
        url: `/api/v1/questions/${id}/solve`,
        method: on ? "POST" : "DELETE",
      }),
      async onQueryStarted({ id, on }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          questionsApi.util.updateQueryData("getQuestion", id, (question) => {
            question.solved = on;
          }),
        );
        try {
          const { data } = await queryFulfilled;
          dispatch(
            questionsApi.util.updateQueryData("getQuestion", id, (question) => {
              question.solved_at = data.solved_at;
            }),
          );
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: (result) => (result ? ["Questions", "Progress"] : []),
    }),
    getProgress: build.query<Progress, void>({
      query: () => "/api/v1/progress",
      providesTags: ["Progress"],
    }),
    getPrepPdfs: build.query<PrepPdf[], void>({
      query: () => "/api/v1/prep-pdfs",
      providesTags: ["PrepPdfs"],
    }),
    downloadPrepPdf: build.mutation<{ url: string }, string>({
      query: (id) => ({ url: `/api/v1/prep-pdfs/${id}/download`, method: "POST" }),
    }),
  }),
});

export const {
  useGetQuestionsQuery,
  useGetQuestionFiltersQuery,
  useGetQuestionQuery,
  useGetBookmarksQuery,
  useSetBookmarkMutation,
  useSetSolvedMutation,
  useGetProgressQuery,
  useGetPrepPdfsQuery,
  useDownloadPrepPdfMutation,
} = questionsApi;
