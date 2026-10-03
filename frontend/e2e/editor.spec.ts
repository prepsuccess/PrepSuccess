import { expect, test, type Page } from "@playwright/test";
import type { TaskDetail } from "@/lib/api/types";
import { API, TASK_ID, envelope, signIn, skill } from "./mockApi";

// The practice editor in a real browser: JavaScript runs in a worker and its
// console output shows up; HTML renders in a sandboxed live preview.

async function openTask(page: Page, overrides: Partial<TaskDetail>) {
  await signIn(page);
  const task: TaskDetail = {
    id: TASK_ID,
    skill,
    title: "Practice task",
    description: "Write the code.",
    difficulty: "easy",
    language: "javascript",
    runner: "run",
    starter_code: null,
    pass_mark: 60,
    rubric: [{ id: "works", description: "It works", points: 10 }],
    submissions: [],
    ...overrides,
  };
  // Registered after signIn's mocks, so it wins for this one URL.
  await page.route(`${API}/api/v1/tasks/${TASK_ID}`, (route) =>
    route.fulfill({ contentType: "application/json", json: envelope(task) }),
  );
  await page.goto(`/tasks/${TASK_ID}`);
}

test("JavaScript runs in the browser and prints console output", async ({ page }) => {
  await openTask(page, {
    starter_code: "function add(a, b) {\n  // your code here\n}\n\nconsole.log(add(2, 3));\n",
  });

  const editor = page.getByRole("textbox", { name: "Your JavaScript answer" });
  await expect(editor).toContainText("your code here");
  // A workspace: the app sidebar starts collapsed to give the editor room.
  await expect(page.locator("[data-slot=sidebar]").first()).toHaveAttribute(
    "data-state",
    "collapsed",
  );
  await expect(page.getByRole("button", { name: "Submit for review" })).toBeDisabled();

  await editor.fill(
    "const add = (a, b) => a + b;\nconsole.log(add(2, 3), [1, 2], { ok: true });\nsetTimeout(() => console.log('later'), 50);\nnull.x;",
  );
  await page.getByRole("button", { name: /^Run/ }).click();
  const output = page.getByRole("log", { name: "Console output" });
  await expect(output).toContainText("5 [1, 2] { ok: true }");
  await expect(output).toContainText("Uncaught TypeError");
  await expect(output).toContainText("later");

  // An infinite loop is stopped instead of freezing the tab.
  await editor.fill("while (true) {}\n// spin forever, please");
  await page.getByRole("button", { name: /^Run/ }).click();
  await expect(output).toContainText("Stopped after 3 seconds", { timeout: 6000 });
  await expect(page.getByRole("button", { name: "Submit for review" })).toBeEnabled();
});

test("HTML shows the page with the Preview button", async ({ page }) => {
  await openTask(page, {
    language: "html",
    runner: "preview",
    starter_code: "<!doctype html>\n<html><body><h1>Hello</h1></body></html>\n",
  });

  const editor = page.getByRole("textbox", { name: "Your HTML answer" });
  const frame = page.locator('iframe[title="Preview of your page"]');
  const preview = page.frameLocator('iframe[title="Preview of your page"]');
  await expect(editor).toBeVisible();
  await expect(frame).toHaveCount(0);

  // Preview swaps the editor for the rendered page, in the same space.
  await page.getByRole("button", { name: "Preview" }).click();
  await expect(preview.getByRole("heading", { name: "Hello" })).toBeVisible();

  // Back to the code, change it, and the preview shows the new page.
  await page.getByRole("button", { name: "Code" }).click();
  await editor.fill("<!doctype html><html><body><h1>Updated page</h1></body></html>");
  await page.getByRole("button", { name: "Preview" }).click();
  await expect(preview.getByRole("heading", { name: "Updated page" })).toBeVisible();
});
