import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { AdminFeedback as AdminFeedbackItem } from "@/lib/api/types";
import { AppToaster } from "@/components/ui/AppToaster";
import { API, http, HttpResponse, ok, server } from "@/test/server";
import { renderWithStore, testUser } from "@/test/render";
import { AdminFeedback } from "./AdminFeedback";

// The open item lives in ?id=. A stub router keeps a tiny URL store, so
// router.replace re-renders the page the way Next's would.
let search = new URLSearchParams();
const listeners = new Set<() => void>();
const replace = vi.fn((url: string) => {
  search = new URLSearchParams(url.split("?")[1] ?? "");
  listeners.forEach((notify) => notify());
});
vi.mock("next/navigation", async () => {
  const { useSyncExternalStore } = await import("react");
  return {
    useSearchParams: () =>
      useSyncExternalStore(
        (notify) => {
          listeners.add(notify);
          return () => listeners.delete(notify);
        },
        () => search,
      ),
    usePathname: () => "/admin/feedback",
    useRouter: () => ({ replace, push: vi.fn() }),
  };
});

const realCreate = URL.createObjectURL;
beforeAll(() => {
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.releasePointerCapture ??= () => {};
  URL.createObjectURL = vi.fn(() => "blob:admin-image");
  URL.revokeObjectURL ??= vi.fn();
  window.matchMedia ??= (query: string) =>
    ({
      matches: false,
      media: query,
      addEventListener() {},
      removeEventListener() {},
    }) as unknown as MediaQueryList;
});
afterAll(() => {
  URL.createObjectURL = realCreate;
});

const admin = { ...testUser, role: "admin" as const };
const now = "2026-10-03T10:00:00.000Z";
const ID = "0f9a7c2e-1b3d-4e5f-8a9b-0c1d2e3f4a5b";
const imageUrl = `/api/v1/feedback/${ID}/images/9d8c7b6a-5f4e-4d3c-8b2a-1f0e9d8c7b6a`;

const item: AdminFeedbackItem = {
  id: ID,
  category: "bug",
  message: "The timer froze on question 3.\nIt happened twice.",
  page: "/assessment/abc",
  status: "open",
  admin_remark: null,
  resolved_at: null,
  created_at: now,
  updated_at: now,
  images: [
    { id: "9d8c7b6a-5f4e-4d3c-8b2a-1f0e9d8c7b6a", mime: "image/png", size: 2048, url: imageUrl },
  ],
  user: { id: testUser.id, first_name: "Asha", last_name: "Verma", email: "asha@college.edu" },
  remarked_by: null,
};
const idea: AdminFeedbackItem = {
  ...item,
  id: "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d",
  category: "idea",
  message: "Dark mode for the coach, please!",
  images: [],
  user: { id: "u2", first_name: "Ravi", last_name: null, email: "ravi@college.edu" },
};

const page = (feedback: AdminFeedbackItem[]) =>
  HttpResponse.json({
    success: true,
    data: feedback,
    meta: { page: 1, limit: 20, total: feedback.length },
    request_id: "test",
    timestamp: now,
  });

/** Every list request's query string, in order. */
let listed: URLSearchParams[] = [];
let summaries = 0;
let current: AdminFeedbackItem = item;

beforeEach(() => {
  search = new URLSearchParams();
  replace.mockClear();
  listed = [];
  summaries = 0;
  current = item;
  server.use(
    http.get(`${API}/api/v1/admin/feedback`, ({ request }) => {
      listed.push(new URL(request.url).searchParams);
      return page([current, idea]);
    }),
    http.get(`${API}/api/v1/admin/feedback/summary`, () => {
      summaries += 1;
      return ok({ open: 2, in_progress: 1, solved: 5 });
    }),
    http.get(`${API}/api/v1/admin/feedback/${ID}`, () => ok(current)),
    http.get(`${API}${imageUrl}`, () => new HttpResponse(new Uint8Array([1]))),
  );
});

const user = userEvent.setup({ delay: null });
const renderPage = () =>
  renderWithStore(
    <>
      <AdminFeedback />
      <AppToaster />
    </>,
    { signedInAs: admin },
  );

describe("AdminFeedback", { timeout: 15_000 }, () => {
  it("lists feedback with counts per status, and filters by status and category", async () => {
    renderPage();
    const table = await screen.findByRole("table", { name: "Student feedback, newest first" });
    const rows = within(table).getAllByRole("row").slice(1);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent("Asha Verma");
    expect(rows[0]).toHaveTextContent("asha@college.edu");
    expect(rows[0]).toHaveTextContent("The timer froze on question 3.");
    expect(rows[0]).not.toHaveTextContent("It happened twice.");
    expect(rows[0]).toHaveTextContent("1 image");
    expect(rows[1]).toHaveTextContent("Ravi");

    const chips = screen.getByRole("group", { name: "Filter by status" });
    expect(await within(chips).findByRole("button", { name: "All 8" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await user.click(within(chips).getByRole("button", { name: "Solved 5" }));
    await waitFor(() => expect(listed.at(-1)?.get("status")).toBe("solved"));
    expect(within(chips).getByRole("button", { name: "Solved 5" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await user.click(screen.getByRole("combobox", { name: "Category" }));
    await user.click(await screen.findByRole("option", { name: "Idea" }));
    await waitFor(() => expect(listed.at(-1)?.get("category")).toBe("idea"));
    expect(listed.at(-1)?.get("status")).toBe("solved");
  });

  it("searches a moment after typing stops", async () => {
    renderPage();
    await screen.findByRole("table");
    await user.type(screen.getByRole("searchbox", { name: "Search" }), "timer");
    await waitFor(() => expect(listed.at(-1)?.get("q")).toBe("timer"));
    // One request for the finished word, not one per letter.
    expect(listed.filter((params) => params.get("q")).length).toBe(1);
  });

  it("opens the item from ?id= with the full message, page, screenshots and student", async () => {
    search = new URLSearchParams(`id=${ID}`);
    current = {
      ...item,
      status: "solved",
      admin_remark: "Fixed today, thanks!",
      resolved_at: now,
      remarked_by: { id: "a1", first_name: "Meera" },
    };
    renderPage();

    const panel = await screen.findByRole("dialog", { name: "Feedback from Asha Verma" });
    expect(panel).toHaveTextContent("It happened twice.");
    expect(panel).toHaveTextContent("/assessment/abc");
    expect(within(panel).getByRole("link", { name: "asha@college.edu" })).toHaveAttribute(
      "href",
      "mailto:asha@college.edu",
    );
    expect(await within(panel).findByRole("img", { name: "Screenshot 1" })).toBeInTheDocument();
    expect(within(panel).getByRole("textbox", { name: "Remark for the student" })).toHaveValue(
      "Fixed today, thanks!",
    );
    expect(panel).toHaveTextContent("Remark by Meera");
    expect(panel).toHaveTextContent("Solved on");
  });

  it("opens a row in the panel and puts its id in the URL", async () => {
    renderPage();
    await user.click(await screen.findByRole("button", { name: /Ravi/ }));
    expect(replace).toHaveBeenCalledWith(`/admin/feedback?id=${idea.id}`, { scroll: false });
  });

  it("saves only what changed, then refreshes the list and counts", async () => {
    search = new URLSearchParams(`id=${ID}`);
    let body: unknown;
    server.use(
      http.patch(`${API}/api/v1/admin/feedback/${ID}`, async ({ request }) => {
        body = await request.json();
        current = {
          ...item,
          status: "solved",
          admin_remark: "Fixed in today's update.",
          resolved_at: now,
          updated_at: "2026-10-04T09:00:00.000Z",
          remarked_by: { id: "a1", first_name: "Meera" },
        };
        return ok(current);
      }),
    );
    renderPage();
    const panel = await screen.findByRole("dialog", { name: "Feedback from Asha Verma" });
    const save = within(panel).getByRole("button", { name: "Save" });
    expect(save).toBeDisabled();

    await user.click(within(panel).getByRole("combobox", { name: "Status" }));
    await user.click(await screen.findByRole("option", { name: "Solved" }));
    await user.click(within(panel).getByRole("textbox", { name: "Remark for the student" }));
    await user.paste("  Fixed in today's update.  ");
    const listsBefore = listed.length;
    const summariesBefore = summaries;
    await user.click(save);

    expect(await screen.findByText("Saved.")).toBeInTheDocument();
    expect(body).toEqual({ status: "solved", admin_remark: "Fixed in today's update." });
    await waitFor(() => expect(listed.length).toBeGreaterThan(listsBefore));
    await waitFor(() => expect(summaries).toBeGreaterThan(summariesBefore));
    expect(await within(panel).findByText(/Remark by Meera/)).toBeInTheDocument();
    expect(within(panel).getByRole("button", { name: "Save" })).toBeDisabled();
  });

  it("clears the remark with null", async () => {
    search = new URLSearchParams(`id=${ID}`);
    current = { ...item, admin_remark: "Looking into it." };
    let body: unknown;
    server.use(
      http.patch(`${API}/api/v1/admin/feedback/${ID}`, async ({ request }) => {
        body = await request.json();
        return ok({ ...current, admin_remark: null });
      }),
    );
    renderPage();
    const panel = await screen.findByRole("dialog", { name: "Feedback from Asha Verma" });
    await user.clear(within(panel).getByRole("textbox", { name: "Remark for the student" }));
    await user.click(within(panel).getByRole("button", { name: "Save" }));
    await waitFor(() => expect(body).toEqual({ admin_remark: null }));
  });
});
