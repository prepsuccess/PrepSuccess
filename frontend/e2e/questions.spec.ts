import { expect, test, type Page } from "@playwright/test";
import { API, FEEDBACK, QUESTION_ID, coachReply, envelope, signIn } from "./mockApi";

const TITLE = "What is the difference between WHERE and HAVING?";

/** Resolves with the next question-list request whose query matches. */
const listRequest = (page: Page, matches: (params: URLSearchParams) => boolean) =>
  page.waitForRequest((request) => {
    const url = new URL(request.url());
    return url.pathname === "/api/v1/questions" && matches(url.searchParams);
  });

// Phase 2: practise an interview question end to end — browse, open, reveal
// the answer, mark it solved, bookmark it, and find it under My bookmarks.

test("a student practises an interview question and bookmarks it", async ({ page }) => {
  const api = await signIn(page);
  await page.goto("/questions");

  await page.getByRole("link", { name: /WHERE and HAVING/ }).click();
  await expect(page).toHaveURL(new RegExp(`/questions/${QUESTION_ID}$`));
  await expect(page.getByRole("heading", { name: /WHERE and HAVING/ })).toBeVisible();

  await page.getByRole("button", { name: "Show answer" }).click();
  await expect(page.getByText("WHERE filters rows before grouping")).toBeVisible();

  await page.getByRole("button", { name: "Mark solved" }).click();
  await expect(page.getByRole("button", { name: "Solved" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.getByRole("button", { name: "Bookmark", exact: true }).click();
  await expect(page.getByRole("button", { name: "Bookmarked" })).toBeVisible();

  await page.goto("/questions/bookmarks");
  await expect(page.getByRole("link", { name: /WHERE and HAVING/ })).toBeVisible();
  expect(api.sent[`POST /api/v1/questions/${QUESTION_ID}/solve`]).toHaveLength(1);
  expect(api.unhandled).toEqual([]);
});

test("the dashboard links a student to interview practice", async ({ page }) => {
  const api = await signIn(page);
  await page.goto("/dashboard");
  const card = page.getByRole("region", { name: "Interview practice" });
  await expect(card).toContainText("Solve your first interview question");
  await card.getByRole("link", { name: "Browse all questions" }).click();
  await expect(page).toHaveURL(/\/questions$/);
  expect(api.unhandled).toEqual([]);
});

test("a student downloads a prep guide served by the app", async ({ page, context }) => {
  const api = await signIn(page);
  await page.route(`${API}/api/v1/prep-pdfs`, (route) =>
    route.fulfill({
      json: envelope([
        {
          id: "9a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d",
          title: "SQL interview guide",
          description: "Joins, window functions and classic problems.",
          skill: { id: "5c8b4d2f-3a1e-4b7c-8d9f-2e3a4b5c6d7e", slug: "sql", name: "SQL" },
          role: null,
          company: null,
          size_label: "17 pages",
        },
      ]),
    }),
  );
  await page.route(`${API}/api/v1/prep-pdfs/*/download`, (route) =>
    route.fulfill({
      json: envelope({ url: "http://localhost:3100/guides/sql-interview-guide.pdf" }),
    }),
  );
  await page.goto("/prep-guides");
  await expect(page.getByRole("heading", { name: "SQL interview guide" })).toBeVisible();
  await expect(page.getByText("17 pages")).toBeVisible();

  // The new tab opens the PDF (headless Chrome downloads it rather than showing it).
  const fetched = context.waitForEvent("request", (request) =>
    request.url().endsWith("/guides/sql-interview-guide.pdf"),
  );
  await page.getByRole("button", { name: "Download" }).click();
  await fetched;
  // The PDF itself is served from the app's public folder.
  const pdf = await page.request.get("/guides/sql-interview-guide.pdf");
  expect(pdf.status()).toBe(200);
  expect(pdf.headers()["content-type"]).toContain("application/pdf");
  expect(api.unhandled).toEqual([]);
});

test("a student writes an answer, gets feedback and tries again", async ({ page }) => {
  const api = await signIn(page);
  await page.goto(`/questions/${QUESTION_ID}`);

  const ANSWER = "WHERE filters rows; HAVING filters after grouping.";
  const box = page.getByRole("textbox", { name: "Your answer" });
  await box.fill(ANSWER);
  await page.getByRole("button", { name: "Get feedback" }).click();

  await expect(page.getByText(`${FEEDBACK.score}/10`)).toBeVisible();
  await expect(page.getByText("Partly there")).toBeVisible();
  await expect(page.getByRole("heading", { name: "What to add" })).toBeVisible();
  await expect(page.getByText(FEEDBACK.missing[0])).toBeVisible();
  await expect(page.getByText(FEEDBACK.tip)).toBeVisible();
  expect(api.sent[`POST /api/v1/questions/${QUESTION_ID}/attempt`]).toEqual([{ answer: ANSWER }]);

  // Locked while the feedback shows; Try again opens it with the answer kept.
  await expect(box).not.toBeEditable();
  await expect(page.getByRole("button", { name: "Get feedback" })).toBeHidden();
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(box).toBeEditable();
  await expect(box).toHaveValue(ANSWER);
  await expect(page.getByRole("button", { name: "Get feedback" })).toBeEnabled();
  expect(api.unhandled).toEqual([]);
});

test("My skills shows progress per skill and a chip narrows the list", async ({ page }) => {
  const api = await signIn(page);
  await page.goto("/questions");
  await expect(page.getByRole("link", { name: /WHERE and HAVING/ })).toBeVisible();

  const mineList = listRequest(page, (params) => params.get("mine") === "true");
  await page.getByRole("button", { name: "My skills" }).click();
  await expect(page).toHaveURL(/\/questions\?mine=1$/);
  await mineList;

  const chips = page.getByRole("group", { name: "Your skills" });
  await expect(chips.getByRole("button", { name: "SQL, 1 of 20 solved" })).toContainText("1/20");
  await expect(chips.getByRole("button", { name: "DSA, 0 of 12 solved" })).toContainText("0/12");
  await expect(page.getByText(/From your goals: DSA/)).toBeVisible();
  await expect(page.getByText(/Role: Data Analyst/)).toBeVisible();

  const sqlList = listRequest(
    page,
    (params) => params.get("mine") === "true" && params.get("skill") === "sql",
  );
  await chips.getByRole("button", { name: "SQL, 1 of 20 solved" }).click();
  await expect(page).toHaveURL(/\/questions\?mine=1&skill=sql$/);
  await sqlList;
  await expect(chips.getByRole("button", { name: "SQL, 1 of 20 solved" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(api.unhandled).toEqual([]);
});

test("a student asks the coach about the question on the page", async ({ page }) => {
  const api = await signIn(page);
  await page.goto(`/questions/${QUESTION_ID}`);
  await page.getByRole("button", { name: "Ask coach about this question" }).click();

  const chat = page.getByRole("dialog", { name: "PrepSuccess coach" });
  await expect(chat.getByText(`About: ${TITLE}`)).toBeVisible();
  const input = chat.getByRole("textbox", { name: "Ask your coach" });
  await input.fill("Why can't WHERE use COUNT?");
  await input.press("Enter");
  await expect(chat).toContainText(coachReply(1));

  // Dropping the chip: the next message goes without the question.
  await chat.getByRole("button", { name: "Stop asking about this question" }).click();
  await expect(chat.getByText(/^About:/)).toBeHidden();
  await input.fill("What should I study next?");
  await chat.getByRole("button", { name: "Send" }).click();
  await expect(chat).toContainText(coachReply(2));

  expect(api.sent["POST /api/v1/ai/coach/messages"]).toEqual([
    { content: "Why can't WHERE use COUNT?", context: { question_id: QUESTION_ID } },
    { content: "What should I study next?" },
  ]);
  expect(api.unhandled).toEqual([]);
});

test("the filters panel opens from the Filters button and a pick updates the URL", async ({
  page,
}) => {
  const api = await signIn(page);
  await page.goto("/questions");
  const panel = page.getByRole("region", { name: "Filters" });
  const toggle = page.getByRole("button", { name: "Filters" });
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(panel).toBeHidden();

  await toggle.click();
  await expect(panel).toBeVisible();
  const hardList = listRequest(page, (params) => params.get("difficulty") === "hard");
  await panel.getByRole("combobox", { name: "Difficulty" }).click();
  await page.getByRole("option", { name: "Hard" }).click();
  await expect(page).toHaveURL(/\/questions\?difficulty=hard$/);
  await hardList;
  await expect(page.getByRole("button", { name: "Filters, 1 on" })).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  expect(api.unhandled).toEqual([]);
});
