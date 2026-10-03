import { expect, test } from "@playwright/test";
import { API, QUESTION_ID, envelope, signIn } from "./mockApi";

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
