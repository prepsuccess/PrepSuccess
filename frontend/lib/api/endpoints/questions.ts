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
  /** Only questions for the student: profile skills, goal skills or target role. */
  mine?: boolean;
  page: number;
  limit: number;
}

type NamedSkill = { slug: string; name: string };

/**
 * GET /questions/mine — what "My skills" covers (backend MyQuestionScope).
 * Defined here until the generated schema catches up.
 */
export interface MyQuestionScope {
  skills: NamedSkill[];
  /** Skills named in goals or interests that aren't already profile skills. */
  goal_skills: NamedSkill[];
  role: string | null;
  /** Profile skills the catalogue doesn't know. */
  unmatched: string[];
  /** Per skill (profile first, then goals): live questions and how many the student solved. */
  progress: (NamedSkill & { total: number; solved: number })[];
}

/** AI feedback on a written answer (backend QuestionFeedback). */
export interface QuestionFeedback {
  /** 0-10, whole number. */
  score: number;
  /** Follows the score: 8+ strong, 5-7 partial, 0-4 weak. */
  verdict: "strong" | "partial" | "weak";
  /** What the answer covered (up to 3). */
  strengths: string[];
  /** Key points left out, most important first (up to 4). */
  missing: string[];
  /** One sentence on how to say it better. */
  tip: string;
}

/** The student's latest written answer and its feedback (backend QuestionAttempt). */
export interface QuestionAttempt {
  answer: string;
  feedback: QuestionFeedback;
  attempted_at: string;
  attempts: number;
}

/** GET /questions/:id, with the latest attempt (null before the first). */
export type QuestionWithAttempt = QuestionDetail & { my_attempt?: QuestionAttempt | null };

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
    // Profile edits invalidate "Questions", so this refreshes with them.
    getMyQuestionScope: build.query<MyQuestionScope, void>({
      query: () => "/api/v1/questions/mine",
      providesTags: ["Questions"],
    }),
    getQuestion: build.query<QuestionWithAttempt, string>({
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
    // AI feedback on a written answer. Shown straight away, then the question refetches.
    attemptQuestion: build.mutation<QuestionAttempt, { id: string; answer: string }>({
      query: ({ id, answer }) => ({
        url: `/api/v1/questions/${id}/attempt`,
        method: "POST",
        body: { answer },
      }),
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            questionsApi.util.updateQueryData("getQuestion", id, (question) => {
              question.my_attempt = data;
            }),
          );
        } catch {
          // The page shows the error; the answer stays in the box.
        }
      },
      // Each feedback also counts toward the AI usage shown elsewhere.
      invalidatesTags: (result, _error, { id }) =>
        result ? [{ type: "Question", id }, "AiStatus"] : [],
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
  useGetMyQuestionScopeQuery,
  useGetQuestionQuery,
  useGetBookmarksQuery,
  useSetBookmarkMutation,
  useSetSolvedMutation,
  useAttemptQuestionMutation,
  useGetProgressQuery,
  useGetPrepPdfsQuery,
  useDownloadPrepPdfMutation,
} = questionsApi;
