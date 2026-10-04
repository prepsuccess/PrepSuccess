import { expect, test } from "@playwright/test";
import { admin, signIn, student, TINY_PNG, type FeedbackStore } from "./mockApi";

// A student reports a bug with a screenshot from the dashboard; an admin marks
// it solved with a reply, and the student sees that reply on /feedback.
test("a student sends feedback with a screenshot and the team replies", async ({
  page,
  browser,
}) => {
  // Two signed-in sessions (student, then admin) in one journey.
  test.slow();
  const store: FeedbackStore = { items: [] };
  const api = await signIn(page, student, { feedback: store });
  await page.goto("/dashboard");

  const card = page.getByRole("region", { name: "Help us improve PrepSuccess" });
  await card.getByRole("button", { name: "Send feedback" }).click();
  const dialog = page.getByRole("dialog", { name: "Send feedback" });
  await dialog.getByRole("combobox", { name: "What's it about?" }).click();
  await page.getByRole("option", { name: "Bug" }).click();
  await dialog
    .getByRole("textbox", { name: /Your message/ })
    .fill("The timer froze on question 3 of my SQL check.");
  await dialog
    .locator('input[type="file"]')
    .setInputFiles({ name: "timer.png", mimeType: "image/png", buffer: TINY_PNG });
  // Shrunk and re-encoded in the browser before it's sent.
  await expect(dialog.getByRole("img", { name: "Screenshot 1: timer.jpg" })).toBeVisible();
  await dialog.getByRole("button", { name: "Send feedback" }).click();

  await expect(page.getByText("Thanks! We got your feedback.")).toBeVisible();
  await expect(dialog).toBeHidden();
  const sent = api.sent["POST /api/v1/feedback"]?.[0] as {
    page: string;
    images: { name: string; data: string }[];
  };
  expect(sent).toMatchObject({
    category: "bug",
    message: "The timer froze on question 3 of my SQL check.",
    page: "/dashboard",
  });
  expect(sent.images).toHaveLength(1);
  expect(sent.images[0]!.data).toMatch(/^data:image\/jpeg;base64,/);
  // The card lists it straight away.
  await expect(card.getByRole("list", { name: "Your latest feedback" })).toContainText("Open");

  // The team opens it from the emailed link and marks it solved with a reply.
  const adminContext = await browser.newContext();
  const adminPage = await adminContext.newPage();
  const adminApi = await signIn(adminPage, admin, { feedback: store });
  const id = store.items[0]!.id;
  await adminPage.goto(`/admin/feedback?id=${id}`);
  const panel = adminPage.getByRole("dialog", { name: "Feedback from Asha Verma" });
  await expect(panel).toContainText("/dashboard");
  await expect(panel.getByRole("img", { name: "Screenshot 1" })).toBeVisible();
  await panel.getByRole("combobox", { name: "Status" }).click();
  await adminPage.getByRole("option", { name: "Solved" }).click();
  await panel
    .getByRole("textbox", { name: "Remark for the student" })
    .fill("Thanks! The timer is fixed now.");
  await panel.getByRole("button", { name: "Save" }).click();
  await expect(adminPage.getByText("Saved.")).toBeVisible();
  expect(adminApi.sent[`PATCH /api/v1/admin/feedback/${id}`]?.[0]).toEqual({
    status: "solved",
    admin_remark: "Thanks! The timer is fixed now.",
  });
  await expect(panel).toContainText("Remark by Meera");
  // Closing the panel drops ?id= and shows the new counts.
  await adminPage.keyboard.press("Escape");
  await expect(adminPage).toHaveURL(/\/admin\/feedback$/);
  await expect(adminPage.getByRole("button", { name: "Solved 1" })).toBeVisible();
  expect(adminApi.unhandled).toEqual([]);
  await adminContext.close();

  // Back as the student: the reply is on their feedback page.
  await page.goto("/feedback");
  await expect(page.getByText("Reply from the PrepSuccess team")).toBeVisible();
  await expect(page.getByText("Thanks! The timer is fixed now.")).toBeVisible();
  await expect(page.getByText("Solved", { exact: true })).toBeVisible();
  expect(api.unhandled).toEqual([]);
});
