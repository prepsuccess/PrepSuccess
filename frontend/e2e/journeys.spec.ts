import { expect, test } from "@playwright/test";
import { ASSESSMENT_ID, mockApi, signIn, student } from "./mockApi";

// The critical journeys from PRD-04 §3.4, end to end in a real browser against
// the built app. The API is mocked (e2e/mockApi.ts), so these cover the
// frontend's flows, routing and guards; the backend has its own API tests.

test("signup with an emailed code lands on the onboarding chat", async ({ page }) => {
  const api = await mockApi(page);
  await page.goto("/signup");

  await expect(page.getByRole("link", { name: "Terms of Service" })).toHaveAttribute(
    "href",
    "/terms",
  );
  await page.getByLabel("First name").fill("Ravi");
  await page.getByLabel("Email").fill("ravi@college.edu");
  await page.getByLabel(/^Password/).fill("a-strong-password");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Email me a code" }).click();

  await page.getByLabel("Verification code").fill("123456");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(/\/onboarding$/);
  await expect(page.getByText("Hi Ravi! What are you studying")).toBeVisible();
  expect(api.sent["POST /api/v1/auth/register"]?.[0]).toMatchObject({
    first_name: "Ravi",
    email: "ravi@college.edu",
    otp: "123456",
  });
  expect(api.unhandled).toEqual([]);
});

test("login shows a wrong password inline, then reaches the dashboard", async ({ page }) => {
  const api = await mockApi(page, { login: { user: student, password: "right-password" } });
  await page.goto("/login");

  await page.getByLabel("Email").fill(student.email);
  await page.getByLabel(/^Password/).fill("wrong-password");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page.getByText("Invalid email or password.")).toBeVisible();

  await page.getByLabel(/^Password/).fill("right-password");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("link", { name: /Check your SQL/ })).toBeVisible();
  expect(api.unhandled).toEqual([]);
});

test("a failed check leads to study material, a task and AI feedback", async ({ page }) => {
  const api = await signIn(page);
  await page.goto(`/assessment/${ASSESSMENT_ID}`);

  await expect(page.getByText("21%", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Study before you retake" })).toBeVisible();
  const outside = page.getByRole("link", { name: /Interactive SQL lessons/ });
  await expect(outside).toHaveAttribute("target", "_blank");

  await page.getByRole("link", { name: "See everything, plus practical tasks" }).click();
  await expect(page).toHaveURL(/\/learn\/sql$/);
  await page.getByRole("button", { name: /Joins, in one page/ }).click();
  await expect(page.getByText("both sides must match")).toBeVisible();

  await page.getByRole("link", { name: /Top earners per department/ }).click();
  await expect(page).toHaveURL(/\/tasks\//);
  // A real SQL editor, pre-filled with the starter code.
  const editor = page.getByRole("textbox", { name: "Your SQL answer" });
  await expect(editor).toContainText("departments(id, name)");
  await editor.fill(
    "SELECT d.name, AVG(e.salary) FROM employees e JOIN departments d ON d.id = e.department_id GROUP BY d.name;",
  );
  await page.getByRole("button", { name: "Submit for review" }).click();

  await expect(page.getByText("Latest feedback")).toBeVisible();
  await expect(page.getByText("80%", { exact: true })).toBeVisible();
  await expect(page.getByText("Order by the average, highest first")).toBeVisible();
  expect(api.unhandled).toEqual([]);
});

test("forgot password resets with the emailed code and signs in", async ({ page }) => {
  const api = await mockApi(page);
  await page.goto("/login");
  await page.getByLabel("Email").fill(student.email);
  await page.getByRole("link", { name: "Forgot password?" }).click();

  await expect(page).toHaveURL(/\/forgot-password\?email=/);
  await expect(page.getByLabel("Email")).toHaveValue(student.email);
  await page.getByRole("button", { name: "Send reset code" }).click();

  await page.getByLabel(/Reset code/).fill("111111");
  await page.getByLabel(/New password/).fill("a-new-password");
  await page.getByRole("button", { name: "Set new password" }).click();
  await expect(page.getByText("That code isn't right. 2 attempts left.")).toBeVisible();

  await page.getByLabel(/Reset code/).fill("482913");
  await page.getByRole("button", { name: "Set new password" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  expect(api.unhandled).toEqual([]);
});

test("a student who opens the admin panel is sent to their dashboard", async ({ page }) => {
  const api = await signIn(page);
  await page.goto("/admin/users");
  await expect(page).toHaveURL(/\/dashboard$/);
  expect(api.unhandled).toEqual([]);
});

test("the legal pages are public", async ({ page }) => {
  for (const [path, heading] of [
    ["/terms", "Terms of Service"],
    ["/privacy", "Privacy Policy"],
  ] as const) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
  }
});
