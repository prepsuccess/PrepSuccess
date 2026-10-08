import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { QuestionDetail, QuestionSummary } from "@/lib/api/types";
import { API, fail, http, ok, server } from "@/test/server";
import { renderWithStore, testUser } from "@/test/render";
import type { QuestionAttempt } from "@/lib/api/endpoints/questions";
import { CoachProvider } from "@/components/app/coach/CoachProvider";
import { CoachWidget } from "@/components/app/coach/CoachWidget";
import { track } from "@/lib/analytics";
import { Bookmarks } from "./Bookmarks";
import { PrepGuides, safeGuideUrl } from "./PrepGuides";
import { QuestionBank } from "./QuestionBank";
import { QuestionView } from "./QuestionView";

// The question bank keeps its filters in the URL; a stub router records changes
// and updates the address bar, but (like a render that hasn't happened yet)
// leaves the `useSearchParams` value as it was.
let search = new URLSearchParams();
const replace = vi.fn((url: string) => window.history.replaceState(null, "", url));
const setUrl = (query: string) => {
  search = new URLSearchParams(query);
  window.history.replaceState(null, "", query ? `/questions?${query}` : "/questions");
};
// Analytics: the events each action sends (never the answer text).
vi.mock("@/lib/analytics", () => ({ track: vi.fn() }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => search,
  usePathname: () => "/questions",
  useRouter: () => ({ replace, push: vi.fn() }),
}));

const skill = { id: "5c8b4d2f-3a1e-4b7c-8d9f-2e3a4b5c6d7e", slug: "sql", name: "SQL" };
const summary: QuestionSummary = {
  id: "11111111-1111-4111-8111-111111111111",
  title: "What is the difference between WHERE and HAVING?",
  topic: "Aggregation",
  difficulty: "easy",
  company: "TCS",
  role: "Data Analyst",
  skill,
  bookmarked: false,
  solved: true,
};
const detail: QuestionDetail = {
  ...summary,
  solved: false,
  body: "Explain with an example.",
  answer: "- WHERE filters rows\n- HAVING filters groups",
  solved_at: null,
  my_attempt: null,
};
const filters = {
  skills: [{ slug: "sql", name: "SQL", count: 20 }],
  companies: [{ name: "TCS", count: 28 }],
  roles: [{ name: "Data Analyst", count: 12 }],
  topics: [{ name: "Aggregation", count: 4 }],
};

beforeEach(() => {
  setUrl("");
  replace.mockClear();
  vi.mocked(track).mockClear();
});

describe("QuestionBank", () => {
  it("sends the URL's filters to the API and lists the results", async () => {
    setUrl("skill=sql&company=TCS&page=2");
    let sent: URLSearchParams | undefined;
    server.use(
      http.get(`${API}/api/v1/questions/filters`, () => ok(filters)),
      http.get(`${API}/api/v1/questions`, ({ request }) => {
        sent = new URL(request.url).searchParams;
        return HttpOk([summary], { page: 2, limit: 20, total: 21 });
      }),
    );
    renderWithStore(<QuestionBank />, { signedInAs: testUser });

    const card = await screen.findByRole("link", { name: /WHERE and HAVING/ });
    expect(card).toHaveAttribute("href", `/questions/${summary.id}`);
    expect(within(card).getByText("Solved")).toBeInTheDocument();
    expect(sent?.get("skill")).toBe("sql");
    expect(sent?.get("company")).toBe("TCS");
    expect(sent?.get("page")).toBe("2");
    expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();
    // Arriving already filtered opens the panel and counts the filters on its button.
    expect(screen.getByRole("button", { name: "Filters, 2 on" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    // A skill is chosen, so its topics can be picked.
    expect(screen.getByLabelText("Topic")).toBeInTheDocument();
  });

  it("puts search text in the URL after typing stops, starting from page 1", async () => {
    setUrl("page=3");
    server.use(
      http.get(`${API}/api/v1/questions/filters`, () => ok(filters)),
      http.get(`${API}/api/v1/questions`, () =>
        HttpOk([summary], { page: 3, limit: 20, total: 60 }),
      ),
    );
    renderWithStore(<QuestionBank />, { signedInAs: testUser });

    await userEvent.type(await screen.findByLabelText("Search questions"), "having");
    await waitFor(() =>
      expect(replace).toHaveBeenLastCalledWith("/questions?q=having", { scroll: false }),
    );
  });

  it("keeps a filter picked while the search was still waiting to apply", async () => {
    server.use(
      http.get(`${API}/api/v1/questions/filters`, () => ok(filters)),
      http.get(`${API}/api/v1/questions`, () =>
        HttpOk([summary], { page: 1, limit: 20, total: 1 }),
      ),
    );
    // Radix Select uses pointer capture, which jsdom doesn't implement.
    Element.prototype.hasPointerCapture ??= () => false;
    Element.prototype.releasePointerCapture ??= () => {};
    Element.prototype.scrollIntoView ??= () => {};
    renderWithStore(<QuestionBank />, { signedInAs: testUser });
    await screen.findByRole("link", { name: /WHERE and HAVING/ });

    // The filters start folded away behind their button.
    expect(screen.queryByRole("combobox", { name: "Company" })).not.toBeInTheDocument();
    const toggle = screen.getByRole("button", { name: "Filters" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    // The company changes the URL, but this render's search params are still the old ones
    // when the search debounce fires.
    await userEvent.click(screen.getByRole("combobox", { name: "Company" }));
    await userEvent.click(await screen.findByRole("option", { name: "TCS (28)" }));
    expect(replace).toHaveBeenLastCalledWith("/questions?company=TCS", { scroll: false });
    await userEvent.type(screen.getByLabelText("Search questions"), "having");
    await waitFor(() =>
      expect(replace).toHaveBeenLastCalledWith("/questions?company=TCS&q=having", {
        scroll: false,
      }),
    );
  });

  // GET /questions/mine for a student like Riya: skills, a goal skill and a role.
  const scope = {
    skills: [
      { slug: "sql", name: "SQL" },
      { slug: "java", name: "Java" },
    ],
    goal_skills: [{ slug: "dsa", name: "DSA" }],
    role: "Frontend Developer",
    unmatched: [],
    progress: [
      { slug: "sql", name: "SQL", total: 20, solved: 1 },
      // No questions yet, so no chip.
      { slug: "java", name: "Java", total: 0, solved: 0 },
      { slug: "dsa", name: "DSA", total: 12, solved: 0 },
    ],
  };
  const emptyScope = { skills: [], goal_skills: [], role: null, unmatched: [], progress: [] };

  it("My skills narrows the list to the skills on the profile", async () => {
    setUrl("mine=1");
    let sent: URLSearchParams | undefined;
    server.use(
      http.get(`${API}/api/v1/questions/filters`, () => ok(filters)),
      http.get(`${API}/api/v1/questions/mine`, () => ok(scope)),
      http.get(`${API}/api/v1/questions`, ({ request }) => {
        sent = new URL(request.url).searchParams;
        return HttpOk([summary], { page: 1, limit: 20, total: 1 });
      }),
    );
    renderWithStore(<QuestionBank />, { signedInAs: testUser });

    await screen.findByRole("link", { name: /WHERE and HAVING/ });
    expect(sent?.get("mine")).toBe("true");
    expect(await screen.findByText(/From your goals: DSA/)).toBeInTheDocument();
    expect(screen.getByText(/Role: Frontend Developer/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Edit" })).toHaveAttribute("href", "/profile");
    const toggle = screen.getByRole("button", { name: "My skills" });
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    // It isn't one of the panel's filters, so the Filters button stays uncounted.
    expect(screen.getByRole("button", { name: "Filters" })).toBeInTheDocument();

    await userEvent.click(toggle);
    expect(replace).toHaveBeenLastCalledWith("/questions", { scroll: false });
    expect(track).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith("my_skills_toggled", { on: false });
  });

  it("My skills shows progress per skill, and a chip filters to that skill", async () => {
    setUrl("mine=1");
    server.use(
      http.get(`${API}/api/v1/questions/filters`, () => ok(filters)),
      http.get(`${API}/api/v1/questions/mine`, () => ok(scope)),
      http.get(`${API}/api/v1/questions`, () =>
        HttpOk([summary], { page: 1, limit: 20, total: 1 }),
      ),
    );
    renderWithStore(<QuestionBank />, { signedInAs: testUser });

    const chips = await screen.findByRole("group", { name: "Your skills" });
    const sql = within(chips).getByRole("button", { name: "SQL, 1 of 20 solved" });
    expect(sql).toHaveTextContent("1/20");
    expect(within(chips).getByRole("button", { name: "DSA, 0 of 12 solved" })).toBeInTheDocument();
    expect(within(chips).queryByRole("button", { name: /Java/ })).not.toBeInTheDocument();
    expect(within(chips).getByRole("button", { name: "All" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    // Picking a skill keeps My skills on.
    await userEvent.click(sql);
    expect(replace).toHaveBeenLastCalledWith("/questions?mine=1&skill=sql", { scroll: false });
    await userEvent.click(within(chips).getByRole("button", { name: "All" }));
    expect(replace).toHaveBeenLastCalledWith("/questions?mine=1", { scroll: false });
  });

  it("My skills with nothing on the profile points to the profile", async () => {
    setUrl("mine=1");
    server.use(
      http.get(`${API}/api/v1/questions/filters`, () => ok(filters)),
      http.get(`${API}/api/v1/questions/mine`, () => ok(emptyScope)),
      http.get(`${API}/api/v1/questions`, () => HttpOk([], { page: 1, limit: 20, total: 0 })),
    );
    renderWithStore(<QuestionBank />, { signedInAs: testUser });

    expect(await screen.findByText("No skills on your profile yet")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Add skills" })).toHaveAttribute("href", "/profile");
  });

  it("moves to the last page when ?page is past the end", async () => {
    setUrl("page=5");
    server.use(
      http.get(`${API}/api/v1/questions/filters`, () => ok(filters)),
      http.get(`${API}/api/v1/questions`, () => HttpOk([], { page: 5, limit: 20, total: 21 })),
    );
    renderWithStore(<QuestionBank />, { signedInAs: testUser });
    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith("/questions?page=2", { scroll: false }),
    );
    expect(screen.queryByText("No questions match")).not.toBeInTheDocument();
  });

  it("explains an empty result and clears the filters", async () => {
    setUrl("company=Zoho");
    server.use(
      http.get(`${API}/api/v1/questions/filters`, () => ok(filters)),
      http.get(`${API}/api/v1/questions`, () => HttpOk([], { page: 1, limit: 20, total: 0 })),
    );
    renderWithStore(<QuestionBank />, { signedInAs: testUser });

    expect(await screen.findByText("No questions match")).toBeInTheDocument();
    await userEvent.click(screen.getAllByRole("button", { name: "Clear filters" })[0]!);
    expect(replace).toHaveBeenCalledWith("/questions", { scroll: false });
  });
});

describe("QuestionView", () => {
  it("hides the model answer until asked", async () => {
    server.use(http.get(`${API}/api/v1/questions/${summary.id}`, () => ok(detail)));
    renderWithStore(<QuestionView id={summary.id} />, { signedInAs: testUser });

    expect(await screen.findByRole("heading", { name: summary.title })).toBeInTheDocument();
    expect(screen.queryByText("WHERE filters rows")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Show answer" }));
    expect(screen.getByText("WHERE filters rows")).toBeInTheDocument();
  });

  it("marks solved and bookmarks, and rolls back if the server says no", async () => {
    server.use(
      http.get(`${API}/api/v1/questions/${summary.id}`, () => ok(detail)),
      http.post(`${API}/api/v1/questions/${summary.id}/solve`, () =>
        ok({ bookmarked: false, solved: true, solved_at: "2026-10-03T10:00:00.000Z" }),
      ),
      http.post(`${API}/api/v1/questions/${summary.id}/bookmark`, () =>
        fail(503, "SERVICE_UNAVAILABLE", "Try again in a moment."),
      ),
    );
    renderWithStore(<QuestionView id={summary.id} />, { signedInAs: testUser });

    await userEvent.click(await screen.findByRole("button", { name: "Mark solved" }));
    expect(await screen.findByRole("button", { name: "Solved" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(await screen.findByText(/Solved on/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Bookmark" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Bookmark" })).toHaveAttribute(
        "aria-pressed",
        "false",
      ),
    );
  });
});

describe("Bookmarks", () => {
  it("steps back a page after removing the last bookmark on it", async () => {
    const saved = Array.from({ length: 21 }, (_, i) => ({
      ...summary,
      id: `11111111-1111-4111-8111-${String(i).padStart(12, "0")}`,
      title: `Saved question ${i + 1}`,
    }));
    server.use(
      http.get(`${API}/api/v1/questions/bookmarks`, ({ request }) => {
        const page = Number(new URL(request.url).searchParams.get("page"));
        return HttpOk(saved.slice((page - 1) * 20, page * 20), {
          page,
          limit: 20,
          total: saved.length,
        });
      }),
      http.delete(`${API}/api/v1/questions/:id/bookmark`, ({ params }) => {
        saved.splice(
          saved.findIndex((q) => q.id === params.id),
          1,
        );
        return ok({ bookmarked: false, solved: false, solved_at: null });
      }),
    );
    renderWithStore(<Bookmarks />, { signedInAs: testUser });

    await userEvent.click(await screen.findByRole("button", { name: "Next" }));
    await userEvent.click(
      await screen.findByRole("button", { name: "Remove bookmark: Saved question 21" }),
    );
    expect(await screen.findByText("Saved question 1")).toBeInTheDocument();
    expect(screen.queryByText("No bookmarks yet")).not.toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Pages" })).not.toBeInTheDocument();
  });
});

describe("PrepGuides", () => {
  const guide = {
    id: "33333333-3333-4333-8333-333333333333",
    title: "SQL interview guide",
    description: null,
    skill: null,
    role: null,
    company: null,
    size_label: "8 pages",
  };

  it("opens https links and same-site guides only", () => {
    expect(safeGuideUrl("https://cdn.example.com/sql.pdf")).toBe("https://cdn.example.com/sql.pdf");
    const local = `${window.location.origin}/guides/sql.pdf`;
    expect(safeGuideUrl(local)).toBe(local);
    expect(safeGuideUrl("http://example.com/sql.pdf")).toBeNull();
    expect(safeGuideUrl("javascript:alert(document.cookie)")).toBeNull();
    expect(safeGuideUrl("data:text/html,<script>alert(1)</script>")).toBeNull();
  });

  it("refuses to open a guide whose link isn't safe", async () => {
    const tab = { close: vi.fn(), opener: {}, location: { href: "" } };
    const open = vi.spyOn(window, "open").mockReturnValue(tab as unknown as Window);
    server.use(
      http.get(`${API}/api/v1/prep-pdfs`, () => ok([guide])),
      http.post(`${API}/api/v1/prep-pdfs/${guide.id}/download`, () =>
        ok({ url: "javascript:alert(document.cookie)" }),
      ),
    );
    renderWithStore(<PrepGuides />, { signedInAs: testUser });
    await userEvent.click(await screen.findByRole("button", { name: "Download" }));
    await waitFor(() => expect(tab.close).toHaveBeenCalled());
    expect(tab.location.href).toBe("");
    open.mockRestore();
  });
});

/** A paginated success envelope, like the backend's list routes. */
function HttpOk(data: QuestionSummary[], meta: { page: number; limit: number; total: number }) {
  return Response.json({
    success: true,
    data,
    meta,
    request_id: "test",
    timestamp: "2026-10-03T10:00:00.000Z",
  });
}

describe("QuestionView: your answer and the coach", () => {
  const ANSWER = "WHERE filters rows before grouping, HAVING filters the groups.";
  const attempt: QuestionAttempt = {
    answer: ANSWER,
    feedback: {
      score: 7,
      verdict: "partial",
      strengths: ["Clear on when WHERE runs"],
      missing: ["HAVING can use aggregates like COUNT"],
      tip: "Give a one-line example query.",
    },
    attempted_at: "2026-10-03T10:00:00.000Z",
    attempts: 1,
  };
  const getDetail = (my_attempt: QuestionAttempt | null) =>
    http.get(`${API}/api/v1/questions/${summary.id}`, () => ok({ ...detail, my_attempt }));

  it("gets feedback on a written answer", async () => {
    let sent: unknown;
    let saved: QuestionAttempt | null = null;
    server.use(
      http.get(`${API}/api/v1/questions/${summary.id}`, () => ok({ ...detail, my_attempt: saved })),
      http.post(`${API}/api/v1/questions/${summary.id}/attempt`, async ({ request }) => {
        sent = await request.json();
        saved = attempt;
        return ok(attempt);
      }),
    );
    renderWithStore(<QuestionView id={summary.id} />, { signedInAs: testUser });

    const box = await screen.findByLabelText("Your answer");
    const button = screen.getByRole("button", { name: "Get feedback" });
    expect(button).toBeDisabled();
    await userEvent.type(box, ANSWER);
    await userEvent.click(button);

    expect(await screen.findByText("7/10")).toBeInTheDocument();
    expect(sent).toEqual({ answer: ANSWER });
    expect(screen.getByText("Partly there")).toBeInTheDocument();
    expect(screen.getByText("Clear on when WHERE runs")).toBeInTheDocument();
    expect(screen.getByText("HAVING can use aggregates like COUNT")).toBeInTheDocument();
    expect(screen.getByText("Give a one-line example query.")).toBeInTheDocument();
    // Getting feedback doesn't mark it solved, and the model answer is still there to open.
    expect(screen.getByRole("button", { name: "Mark solved" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Show answer" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Get feedback" })).not.toBeInTheDocument();
    // One event, with the score only.
    expect(track).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith("question_feedback_requested", { score: 7 });
  });

  it("shows the last answer and its feedback, and Try again opens the box", async () => {
    server.use(getDetail(attempt));
    renderWithStore(<QuestionView id={summary.id} />, { signedInAs: testUser });

    const box = await screen.findByLabelText("Your answer");
    expect(box).toHaveValue(ANSWER);
    expect(box).toHaveAttribute("readonly");
    expect(screen.getByText("7/10")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(box).not.toHaveAttribute("readonly");
    expect(screen.getByRole("button", { name: "Get feedback" })).toBeEnabled();
  });

  it("shows why feedback failed and keeps the answer", async () => {
    server.use(
      getDetail(null),
      http.post(`${API}/api/v1/questions/${summary.id}/attempt`, () =>
        fail(429, "AI_DAILY_LIMIT", "You've reached today's AI limit. It resets at midnight."),
      ),
    );
    renderWithStore(<QuestionView id={summary.id} />, { signedInAs: testUser });

    const box = await screen.findByLabelText("Your answer");
    await userEvent.type(box, ANSWER);
    await userEvent.click(screen.getByRole("button", { name: "Get feedback" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("You've reached today's AI limit.");
    expect(box).toHaveValue(ANSWER);
    expect(track).not.toHaveBeenCalled();
  });

  it("opens the coach about this question", async () => {
    server.use(
      getDetail(null),
      http.post(`${API}/api/v1/ai/coach/ping`, () => ok({ nudged: false })),
      http.get(`${API}/api/v1/ai/coach`, () =>
        ok({
          messages: [],
          usage: { used: 0, limit: 20, remaining: 20, resets_at: "2026-10-03T18:30:00.000Z" },
          suggestions: ["What should I work on next?"],
        }),
      ),
    );
    renderWithStore(
      <CoachProvider>
        <QuestionView id={summary.id} />
        <CoachWidget />
      </CoachProvider>,
      { signedInAs: testUser },
    );

    await userEvent.click(
      await screen.findByRole("button", { name: "Ask coach about this question" }),
    );
    const chat = screen.getByRole("dialog", { name: "PrepSuccess coach" });
    expect(within(chat).getByText(`About: ${summary.title}`)).toBeInTheDocument();
    expect(track).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith("coach_asked_about_question", {});
  });

  it("has no coach button outside the student app", async () => {
    server.use(getDetail(null));
    renderWithStore(<QuestionView id={summary.id} />, { signedInAs: testUser });
    expect(await screen.findByRole("heading", { name: summary.title })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Ask coach about this question" }),
    ).not.toBeInTheDocument();
  });
});
