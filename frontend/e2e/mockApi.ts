import type { Page, Route } from "@playwright/test";
import type {
  AiStatus,
  AssessmentState,
  AuthUser,
  Dashboard,
  MySkills,
  OnboardingState,
  Progress,
  QuestionDetail,
  QuestionSummary,
  SkillResources,
  SkillTasks,
  TaskDetail,
  TaskSubmission,
} from "@/lib/api/types";

/**
 * A stand-in for the backend: every request to the API origin is answered
 * here with the real response envelope. Anything a test didn't expect fails
 * loudly (`unhandled`), so a page can't quietly call a new endpoint.
 */
export const API = "http://localhost:8000";

const now = "2026-10-03T10:00:00.000Z";
export const envelope = (data: unknown) => ({
  success: true,
  data,
  request_id: "e2e",
  timestamp: now,
});
const errorEnvelope = (code: string, message: string) => ({
  success: false,
  error: { code, message, details: [] },
  request_id: "e2e",
  timestamp: now,
});

export const student: AuthUser = {
  id: "4b7a3c1e-2f0d-4a6b-9c8e-1d2f3a4b5c6d",
  first_name: "Asha",
  last_name: "Verma",
  email: "asha@college.edu",
  profile_image_url: null,
  role: "student",
  auth_provider: "local",
  is_verified: true,
  onboarding_completed: true,
  profile: { student_year: 3, skills: ["SQL"] },
  created_at: "2026-10-01T00:00:00.000Z",
};

export const tokens = (user: AuthUser) => ({
  access_token: "e2e-access",
  refresh_token: "e2e-refresh",
  token_type: "bearer",
  expires_in: 1800,
  user,
});

export const skill = {
  id: "5c8b4d2f-3a1e-4b7c-8d9f-2e3a4b5c6d7e",
  slug: "sql",
  name: "SQL",
  category: "technical" as const,
  topic: "Databases",
  description: "Queries, joins and aggregates.",
  mastery_threshold: 40,
};

export const ASSESSMENT_ID = "6d9c5e3a-4b2f-4c8d-9eaf-3f4b5c6d7e8f";
export const TASK_ID = "7e0d6f4b-5c3a-4d9e-8fb0-4a5b6c7d8e9f";
export const QUESTION_ID = "8f2e1d0c-9b8a-4c7d-8e6f-5a4b3c2d1e0f";

const question: QuestionDetail = {
  id: QUESTION_ID,
  title: "What is the difference between WHERE and HAVING?",
  topic: "Aggregation",
  difficulty: "easy",
  company: "TCS",
  role: "Data Analyst",
  skill: { id: "5c8b4d2f-3a1e-4b7c-8d9f-2e3a4b5c6d7e", slug: "sql", name: "SQL" },
  bookmarked: false,
  solved: false,
  body: "Explain the difference, with an example query for each.",
  answer: "- WHERE filters rows before grouping\n- HAVING filters groups after GROUP BY",
  solved_at: null,
};

const aiStatus: AiStatus = {
  available: true,
  allowed: true,
  reason: null,
  trial: { active: true, ends_at: "2027-01-29T00:00:00.000Z", days_left: 118, enforced: false },
  today: { requests: 3, limit: 200 },
};

const emptyDashboard: Dashboard = {
  onboarding_completed: true,
  readiness: {
    score: null,
    change: null,
    history: [],
    weights: { technical: 50, aptitude: 30, soft: 20 },
    categories: [
      { category: "technical", score: null, checked: 0 },
      { category: "aptitude", score: null, checked: 0 },
      { category: "soft", score: null, checked: 0 },
    ],
  },
  counts: {
    checked: 0,
    mastered: 0,
    needs_revision: 0,
    claimed: 1,
    claimed_checked: 0,
    in_progress: 0,
    tasks_attempted: 0,
    tasks_passed: 0,
  },
  skills: [],
  gaps: [],
  check_dates: [],
  next_steps: [
    {
      id: "check-SQL",
      kind: "check",
      title: "Check your SQL",
      detail: "You said you know it — a short check shows where you really stand.",
      href: "/assessment",
    },
  ],
};

const lastResult = {
  assessment_id: ASSESSMENT_ID,
  percent: 21,
  mastery: "needs_revision" as const,
  completed_at: now,
};

const mySkills: MySkills = {
  skills: [{ ...skill, claimed: true, in_progress_id: null, last_result: lastResult, attempts: 1 }],
  unmatched_claims: [],
};

const failedCheck: AssessmentState = {
  id: ASSESSMENT_ID,
  skill,
  status: "completed",
  total_questions: 5,
  answered: 5,
  current_question: null,
  answers: [1, 2, 3, 4, 5].map((n) => ({
    id: `q${n}`,
    number: n,
    difficulty: "medium" as const,
    question: `SQL question ${n}?`,
    options: ["A", "B", "C", "D"],
    chosen_index: 1,
    correct_index: n === 1 ? 1 : 0,
    correct: n === 1,
    explanation: `Because of rule ${n}.`,
  })),
  result: { score: 3, max_score: 14, percent: 21, threshold: 40, mastery: "needs_revision" },
  started_at: now,
  completed_at: now,
};

const resources: SkillResources = {
  skill,
  resources: [
    {
      id: "r1",
      title: "Joins, in one page",
      type: "reference",
      url: null,
      content: "Use an INNER JOIN when:\n- both sides must match\n- you want only matching rows",
      source: "PrepSuccess",
    },
    {
      id: "r2",
      title: "Interactive SQL lessons",
      type: "practice",
      url: "https://sqlbolt.com/",
      content: null,
      source: "SQLBolt",
    },
  ],
};

const rubric = [
  { id: "join", description: "Correct JOIN", points: 4 },
  { id: "group", description: "GROUP BY with AVG", points: 6 },
];

const submission: TaskSubmission = {
  id: "s1",
  content:
    "SELECT d.name, AVG(e.salary) FROM employees e JOIN departments d ON d.id = e.department_id GROUP BY d.name;",
  percent: 80,
  passed: true,
  pass_mark: 60,
  feedback: {
    summary: "Correct join and grouping.",
    strengths: ["Clean join"],
    improvements: ["Order by the average, highest first"],
    criteria: [
      { ...rubric[0]!, score: 4, comment: "Joins on the right key." },
      { ...rubric[1]!, score: 4, comment: "Missing ORDER BY." },
    ],
  },
  created_at: now,
};

const onboarding = (user: AuthUser): OnboardingState => ({
  conversation_id: "8f1e7a5c-6d4b-4e0f-9a1c-5b6c7d8e9f0a",
  messages: [
    {
      role: "assistant",
      content: `Hi ${user.first_name}! What are you studying, and which year are you in?`,
      created_at: now,
    },
  ],
  completed: false,
  progress: { collected: 0, total: 5, items: [] },
  profile: {},
  skill_options: {
    stacks: [
      { name: "MERN stack", skills: ["MongoDB", "Express.js", "React", "Node.js", "JavaScript"] },
    ],
    topics: [{ topic: "Databases", skills: ["SQL", "DBMS"] }],
  },
});

export interface MockOptions {
  /** Who the API thinks is signed in (for /auth/me). */
  user?: AuthUser;
  /** Account that /auth/login accepts, with this password. */
  login?: { user: AuthUser; password: string };
}

export interface MockApi {
  /** Requests nobody handled, as "METHOD /path". */
  unhandled: string[];
  /** Bodies the app sent, keyed by "METHOD /path". */
  sent: Record<string, unknown[]>;
}

/** Answers the app's API calls for one test. */
export async function mockApi(page: Page, options: MockOptions = {}): Promise<MockApi> {
  const state: MockApi = { unhandled: [], sent: {} };
  let me = options.user;
  let taskSubmissions: TaskSubmission[] = [];
  // The interview question's progress, so bookmark/solve show up across pages.
  const progress = { bookmarked: false, solvedAt: null as string | null };
  const current = (): QuestionDetail => ({
    ...question,
    bookmarked: progress.bookmarked,
    solved: Boolean(progress.solvedAt),
    solved_at: progress.solvedAt,
  });
  const summary = (): QuestionSummary => {
    const q = current();
    return {
      id: q.id,
      title: q.title,
      topic: q.topic,
      difficulty: q.difficulty,
      company: q.company,
      role: q.role,
      skill: q.skill,
      bookmarked: q.bookmarked,
      solved: q.solved,
    };
  };
  const paged = (route: Route, rows: QuestionSummary[]) =>
    route.fulfill({
      contentType: "application/json",
      json: { ...envelope(rows), meta: { page: 1, limit: 20, total: rows.length } },
    });
  const progressReply = (): Progress => ({
    readiness: [],
    solved_by_week: progress.solvedAt
      ? [{ week_start: "2026-09-28", solved: 1, total_solved: 1 }]
      : [],
    totals: {
      solved: progress.solvedAt ? 1 : 0,
      bookmarked: progress.bookmarked ? 1 : 0,
      by_skill: [],
    },
  });

  const reply = (route: Route, data: unknown, status = 200) =>
    route.fulfill({ status, contentType: "application/json", json: envelope(data) });
  const fail = (route: Route, status: number, code: string, message: string) =>
    route.fulfill({ status, contentType: "application/json", json: errorEnvelope(code, message) });

  await page.route(`${API}/**`, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const key = `${request.method()} ${url.pathname}`;
    if (request.method() !== "GET") {
      (state.sent[key] ??= []).push(request.postDataJSON());
    }

    switch (key) {
      case "GET /api/v1/auth/me":
        return me ? reply(route, me) : fail(route, 401, "UNAUTHORIZED", "Sign in to continue.");
      case "POST /api/v1/auth/login": {
        const body = request.postDataJSON() as { email: string; password: string };
        if (
          options.login &&
          body.email === options.login.user.email &&
          body.password === options.login.password
        ) {
          me = options.login.user;
          return reply(route, tokens(me));
        }
        return fail(route, 401, "INVALID_CREDENTIALS", "Invalid email or password.");
      }
      case "POST /api/v1/auth/send-otp": {
        const { email } = request.postDataJSON() as { email: string };
        return reply(route, { message: `We sent a 6-digit code to ${email}.`, email });
      }
      case "POST /api/v1/auth/register": {
        const body = request.postDataJSON() as { first_name: string; email: string };
        me = {
          ...student,
          first_name: body.first_name,
          email: body.email,
          onboarding_completed: false,
          profile: {},
        };
        return reply(route, tokens(me), 201);
      }
      case "POST /api/v1/auth/forgot-password": {
        const { email } = request.postDataJSON() as { email: string };
        return reply(route, {
          message: `If ${email} has a PrepSuccess account, we sent a 6-digit code to it.`,
          email,
        });
      }
      case "POST /api/v1/auth/reset-password": {
        const { otp } = request.postDataJSON() as { otp: string };
        if (otp !== "482913")
          return fail(route, 400, "OTP_INVALID", "That code isn't right. 2 attempts left.");
        me = student;
        return reply(route, tokens(student));
      }
      case "POST /api/v1/auth/logout":
        return reply(route, { message: "Signed out." });
      case "GET /api/v1/ai/status":
        return reply(route, aiStatus);
      case "GET /api/v1/ai/onboarding":
        return reply(route, onboarding(me ?? student));
      case "GET /api/v1/notifications":
        return reply(route, { notifications: [], unread_count: 0 });
      // Phase 2: the interview question bank.
      case "GET /api/v1/questions":
        return paged(route, [summary()]);
      case "GET /api/v1/questions/filters":
        return reply(route, {
          skills: [{ slug: "sql", name: "SQL", count: 1 }],
          companies: [{ name: "TCS", count: 1 }],
          roles: [{ name: "Data Analyst", count: 1 }],
          topics: [{ name: "Aggregation", count: 1 }],
        });
      case "GET /api/v1/questions/bookmarks":
        return paged(route, progress.bookmarked ? [summary()] : []);
      case `GET /api/v1/questions/${QUESTION_ID}`:
        return reply(route, current());
      case `POST /api/v1/questions/${QUESTION_ID}/bookmark`:
      case `DELETE /api/v1/questions/${QUESTION_ID}/bookmark`:
        progress.bookmarked = request.method() === "POST";
        return reply(route, {
          bookmarked: progress.bookmarked,
          solved: Boolean(progress.solvedAt),
          solved_at: progress.solvedAt,
        });
      case `POST /api/v1/questions/${QUESTION_ID}/solve`:
      case `DELETE /api/v1/questions/${QUESTION_ID}/solve`:
        progress.solvedAt = request.method() === "POST" ? (progress.solvedAt ?? now) : null;
        return reply(route, {
          bookmarked: progress.bookmarked,
          solved: Boolean(progress.solvedAt),
          solved_at: progress.solvedAt,
        });
      case "GET /api/v1/progress":
        return reply(route, progressReply());
      case "GET /api/v1/prep-pdfs":
        return reply(route, []);
      // The coach: activity pings while the tab is visible, and the chat.
      case "POST /api/v1/ai/coach/ping":
        return reply(route, { nudged: false });
      case "GET /api/v1/ai/coach":
        return reply(route, {
          messages: [],
          usage: { used: 0, limit: 20, remaining: 20, resets_at: now },
          suggestions: ["What should I work on next?"],
        });
      case "GET /api/v1/dashboard":
        return reply(route, emptyDashboard);
      case "GET /api/v1/skills/mine":
        return reply(route, mySkills);
      case `GET /api/v1/ai/assessment/${ASSESSMENT_ID}`:
        return reply(route, failedCheck);
      case "GET /api/v1/resources":
        return reply(route, resources);
      case "GET /api/v1/tasks":
        return reply(route, {
          skill,
          tasks: [
            {
              id: TASK_ID,
              skill_id: skill.id,
              title: "Top earners per department",
              difficulty: "medium",
              language: "sql",
              runner: null,
              attempts: taskSubmissions.length,
              best: taskSubmissions[0] ? { percent: 80, passed: true } : null,
            },
          ],
        } satisfies SkillTasks);
      case `GET /api/v1/tasks/${TASK_ID}`:
        return reply(route, {
          id: TASK_ID,
          skill,
          title: "Top earners per department",
          description: "Write a query for the average salary per department.",
          difficulty: "medium",
          language: "sql",
          runner: null,
          starter_code: "-- employees(id, name, salary, department_id)\n-- departments(id, name)\n",
          pass_mark: 60,
          rubric,
          submissions: taskSubmissions,
        } satisfies TaskDetail);
      case `POST /api/v1/tasks/${TASK_ID}/submit`:
        taskSubmissions = [submission];
        return reply(route, submission, 201);
      default:
        state.unhandled.push(key);
        return fail(route, 500, "UNHANDLED_IN_TEST", `No mock for ${key}`);
    }
  });

  return state;
}

/** Starts the page signed in as `user`, the way a returning visitor would be. */
export async function signIn(page: Page, user: AuthUser = student) {
  await page.addInitScript(() => {
    localStorage.setItem("ps-access-token", "e2e-access");
    localStorage.setItem("ps-refresh-token", "e2e-refresh");
  });
  return mockApi(page, { user });
}
