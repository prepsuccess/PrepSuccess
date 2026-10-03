import { expect, test } from "@playwright/test";
import { API, envelope, signIn } from "./mockApi";

// The coach's 30-minute check-in, end to end: the activity ping triggers it,
// the bell picks up the notification and toasts it, and "Open chat" opens the
// chat in the corner with the tip waiting.

const TIP = "You're close on SQL joins. Want a quick plan for today?";
const nudge = {
  id: "11111111-1111-4111-8111-111111111111",
  type: "COACH_NUDGE",
  title: "Your coach has a tip",
  body: TIP,
  href: null,
  read: false,
  created_at: "2026-10-03T10:30:00.000Z",
};

test("the coach checks in with a toast that opens the chat", async ({ page }) => {
  const api = await signIn(page);
  await page.route(`${API}/api/v1/ai/coach/ping`, (route) =>
    route.fulfill({ json: envelope({ nudged: true }) }),
  );
  // Nothing on the first load; the check-in appears after the ping.
  let loads = 0;
  await page.route(`${API}/api/v1/notifications`, (route) => {
    loads += 1;
    const list = loads === 1 ? [] : [nudge];
    return route.fulfill({
      json: envelope({ notifications: list, unread_count: list.length }),
    });
  });
  await page.route(`${API}/api/v1/notifications/*/read`, (route) =>
    route.fulfill({
      json: envelope({ notifications: [{ ...nudge, read: true }], unread_count: 0 }),
    }),
  );
  await page.route(`${API}/api/v1/ai/coach`, (route) =>
    route.fulfill({
      json: envelope({
        messages: [{ role: "assistant", content: TIP, created_at: nudge.created_at, nudge: true }],
        usage: { used: 0, limit: 20, remaining: 20, resets_at: nudge.created_at },
        suggestions: [],
      }),
    }),
  );

  await page.goto("/dashboard");
  const toast = page.getByRole("listitem").filter({ hasText: "Your coach has a tip" });
  await expect(toast).toContainText(TIP);
  await toast.getByRole("button", { name: "Open chat" }).click();

  const chat = page.getByRole("dialog", { name: "PrepSuccess coach" });
  await expect(chat).toContainText("Check-in");
  await expect(chat).toContainText(TIP);
  await expect(chat).toContainText("20 of 20 messages left today");
  expect(api.unhandled).toEqual([]);
});

test("the corner button opens and closes the coach", async ({ page }) => {
  const api = await signIn(page);
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Ask your AI coach" }).click();
  const chat = page.getByRole("dialog", { name: "PrepSuccess coach" });
  await expect(chat.getByRole("button", { name: "What should I work on next?" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(chat).toBeHidden();
  expect(api.unhandled).toEqual([]);
});
