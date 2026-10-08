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
  // Just created: the bell only toasts notifications newer than the page.
  created_at: new Date().toISOString(),
};

test("the coach checks in with a toast that opens the chat", async ({ page }) => {
  const api = await signIn(page);
  // Nothing on the first load; the check-in appears after the ping. The ping
  // answers only once the bell has shown that first (empty) load, as it would
  // 30 minutes in; otherwise the tip could land in the bell's starting list,
  // which never toasts.
  let firstLoadServed!: () => void;
  const firstLoad = new Promise<void>((resolve) => (firstLoadServed = resolve));
  await page.route(`${API}/api/v1/ai/coach/ping`, async (route) => {
    await firstLoad;
    await new Promise((resolve) => setTimeout(resolve, 500));
    await route.fulfill({ json: envelope({ nudged: true }) });
  });
  let loads = 0;
  await page.route(`${API}/api/v1/notifications`, (route) => {
    loads += 1;
    if (loads === 1) firstLoadServed();
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
  const toast = page.getByRole("status").filter({ hasText: "Your coach has a tip" });
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
