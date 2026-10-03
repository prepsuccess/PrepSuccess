import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { QuestionDetail, QuestionSummary } from "@/lib/api/types";
import { API, fail, http, ok, server } from "@/test/server";
import { renderWithStore, testUser } from "@/test/render";
import { QuestionBank } from "./QuestionBank";
import { QuestionView } from "./QuestionView";

// The question bank keeps its filters in the URL; a stub router records changes.
let search = new URLSearchParams();
const replace = vi.fn();
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
};
const filters = {
  skills: [{ slug: "sql", name: "SQL", count: 20 }],
  companies: [{ name: "TCS", count: 28 }],
  roles: [{ name: "Data Analyst", count: 12 }],
  topics: [{ name: "Aggregation", count: 4 }],
};

beforeEach(() => {
  search = new URLSearchParams();
  replace.mockReset();
});

describe("QuestionBank", () => {
  it("sends the URL's filters to the API and lists the results", async () => {
    search = new URLSearchParams("skill=sql&company=TCS&page=2");
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
    // A skill is chosen, so its topics can be picked.
    expect(screen.getByLabelText("Topic")).toBeInTheDocument();
  });

  it("puts search text in the URL after typing stops, starting from page 1", async () => {
    search = new URLSearchParams("page=3");
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

  it("explains an empty result and clears the filters", async () => {
    search = new URLSearchParams("company=Zoho");
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
