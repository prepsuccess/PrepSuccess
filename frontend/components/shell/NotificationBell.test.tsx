import { act, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CoachProvider } from "@/components/app/coach/CoachProvider";
import { notificationsApi } from "@/lib/api/endpoints/notifications";
import type { AppNotification } from "@/lib/api/types";
import { API, http, ok, server } from "@/test/server";
import { renderWithStore, testUser } from "@/test/render";
import { NotificationBell, isAppPath } from "./NotificationBell";

let pathname = "/dashboard";
vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));
const showNotice = vi.fn();
vi.mock("@/components/ui/AppToaster", () => ({
  showNotice: (...args: unknown[]) => showNotice(...args),
}));

const note = (id: string, createdAt: Date, extra: Partial<AppNotification> = {}) =>
  ({
    id,
    type: "TASK_REVIEWED",
    title: `Notification ${id}`,
    body: null,
    href: null,
    read: false,
    created_at: createdAt.toISOString(),
    ...extra,
  }) as AppNotification;

let list: AppNotification[] = [];
beforeEach(() => {
  pathname = "/dashboard";
  showNotice.mockReset();
  list = [note("n1", new Date(Date.now() - 3_600_000))];
  server.use(
    http.get(`${API}/api/v1/notifications`, () =>
      ok({ notifications: list, unread_count: list.filter((n) => !n.read).length }),
    ),
    http.post(`${API}/api/v1/ai/coach/ping`, () => ok({ nudged: false })),
  );
});

async function renderBell() {
  const view = renderWithStore(
    <CoachProvider>
      <NotificationBell />
    </CoachProvider>,
    { signedInAs: testUser },
  );
  await screen.findByRole("button", { name: "Notifications, 1 unread" });
  return view;
}

/** Simulates the next poll. */
async function poll(store: ReturnType<typeof renderWithStore>["store"], unread: number) {
  act(() => {
    store.dispatch(notificationsApi.util.invalidateTags(["Notifications"]));
  });
  await screen.findByRole("button", { name: `Notifications, ${unread} unread` });
}

describe("NotificationBell", () => {
  it("toasts only notifications created after this tab loaded", async () => {
    const { store } = await renderBell();
    expect(showNotice).not.toHaveBeenCalled();

    list = [
      note("n2", new Date(Date.now() + 1_000), { title: "Task passed" }),
      // Older, e.g. already toasted in another tab: stays quiet.
      note("n3", new Date(Date.now() - 600_000), { title: "Old news" }),
      ...list,
    ];
    await poll(store, 3);
    await waitFor(() => expect(showNotice).toHaveBeenCalledTimes(1));
    expect(showNotice).toHaveBeenCalledWith({ title: "Task passed", body: null });

    // The same list again toasts nothing new.
    list = [...list];
    act(() => {
      store.dispatch(notificationsApi.util.invalidateTags(["Notifications"]));
    });
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(showNotice).toHaveBeenCalledTimes(1);
  });

  it("offers to open the chat for the coach's tip, except where the coach is hidden", async () => {
    const tip = (id: string) =>
      note(id, new Date(Date.now() + 1_000), { type: "COACH_NUDGE", title: "Your coach" });

    const first = await renderBell();
    list = [tip("c1"), ...list];
    await poll(first.store, 2);
    await waitFor(() => expect(showNotice).toHaveBeenCalledTimes(1));
    expect(showNotice.mock.calls[0]![0]).toMatchObject({ action: { label: "Open chat" } });
    first.unmount();

    showNotice.mockReset();
    pathname = "/onboarding";
    list = [list.at(-1)!];
    const second = await renderBell();
    list = [tip("c2"), ...list];
    await poll(second.store, 2);
    await waitFor(() => expect(showNotice).toHaveBeenCalledTimes(1));
    expect(showNotice.mock.calls[0]![0]).not.toHaveProperty("action");
  });

  it("only follows links inside the app", () => {
    expect(isAppPath("/tasks/123")).toBe(true);
    expect(isAppPath("//evil.example/x")).toBe(false);
    expect(isAppPath("/\\evil.example/x")).toBe(false);
    expect(isAppPath("https://evil.example")).toBe(false);
    expect(isAppPath("javascript:alert(1)")).toBe(false);
  });
});
