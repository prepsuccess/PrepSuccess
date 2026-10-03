import { expect, test } from "@playwright/test";
import { QUESTION_ID, signIn } from "./mockApi";

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
