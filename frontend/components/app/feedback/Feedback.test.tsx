import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { Feedback } from "@/lib/api/types";
import { AppToaster } from "@/components/ui/AppToaster";
import { API, fail, http, HttpResponse, ok, server } from "@/test/server";
import { renderWithStore, testUser } from "@/test/render";
import { SendFeedbackButton } from "./FeedbackDialog";
import { MyFeedback } from "./MyFeedback";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => "/questions",
  useRouter: () => ({ push, replace: vi.fn() }),
}));
vi.mock("@/lib/analytics", () => ({ track: vi.fn() }));

// jsdom has no pointer capture (Radix Select), object URLs (AuthImage) or
// matchMedia (the toaster checks for reduced motion).
const realCreate = URL.createObjectURL;
const realRevoke = URL.revokeObjectURL;
beforeAll(() => {
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.releasePointerCapture ??= () => {};
  URL.createObjectURL = vi.fn(() => "blob:feedback-image");
  URL.revokeObjectURL = vi.fn();
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
  URL.revokeObjectURL = realRevoke;
});
beforeEach(() => push.mockClear());

const user = userEvent.setup({ delay: null });
const now = "2026-10-03T10:00:00.000Z";
const jpeg = (name = "shot.jpg") =>
  new File([new Uint8Array([1, 2, 3])], name, { type: "image/jpeg" });

const sent: Feedback = {
  id: "0f9a7c2e-1b3d-4e5f-8a9b-0c1d2e3f4a5b",
  category: "bug",
  message: "The timer froze on question 3 of the SQL check.",
  page: "/assessment",
  status: "open",
  admin_remark: null,
  resolved_at: null,
  created_at: now,
  updated_at: now,
  images: [],
};

function renderDialog() {
  renderWithStore(
    <>
      <SendFeedbackButton />
      <AppToaster />
    </>,
    { signedInAs: testUser },
  );
}

async function openDialog() {
  await user.click(screen.getByRole("button", { name: "Send feedback" }));
  return screen.findByRole("dialog", { name: "Send feedback" });
}

async function fillIn(dialog: HTMLElement, message: string) {
  await user.click(within(dialog).getByRole("combobox", { name: "What's it about?" }));
  await user.click(await screen.findByRole("option", { name: "Bug" }));
  await user.click(within(dialog).getByRole("textbox", { name: /Your message/ }));
  await user.paste(message);
}

describe("FeedbackDialog", { timeout: 15_000 }, () => {
  it("asks for a category and a longer message before sending", async () => {
    let calls = 0;
    server.use(
      http.post(`${API}/api/v1/feedback`, () => {
        calls += 1;
        return ok(sent, 201);
      }),
    );
    renderDialog();
    const dialog = await openDialog();

    await user.click(within(dialog).getByRole("textbox", { name: /Your message/ }));
    await user.paste("Too short");
    expect(within(dialog).getByText("9 / 2000 characters (at least 10)")).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "Send feedback" }));

    expect(within(dialog).getByText("Pick what this is about.")).toBeInTheDocument();
    expect(
      within(dialog).getByText("Tell us a bit more: at least 10 characters."),
    ).toBeInTheDocument();
    expect(within(dialog).getByRole("combobox", { name: "What's it about?" })).toHaveFocus();
    expect(calls).toBe(0);
  });

  it("sends the category, message, page and screenshots, then thanks and resets", async () => {
    let body: unknown;
    server.use(
      http.post(`${API}/api/v1/feedback`, async ({ request }) => {
        body = await request.json();
        return ok(sent, 201);
      }),
      http.get(`${API}/api/v1/feedback/mine`, () => ok([sent])),
    );
    renderDialog();
    const dialog = await openDialog();
    await fillIn(dialog, "  The timer froze on question 3 of the SQL check.  ");

    await user.upload(within(dialog).getByLabelText("Choose screenshots"), jpeg());
    const shots = await within(dialog).findByRole("list", { name: "Screenshots to send" });
    expect(
      await within(shots).findByRole("img", { name: "Screenshot 1: shot.jpg" }),
    ).toBeInTheDocument();
    expect(shots).toHaveTextContent("3 B · shot.jpg");

    await user.click(within(dialog).getByRole("button", { name: "Send feedback" }));

    expect(await screen.findByText("Thanks! We got your feedback.")).toBeInTheDocument();
    expect(body).toEqual({
      category: "bug",
      message: "The timer froze on question 3 of the SQL check.",
      page: "/questions",
      images: [{ name: "shot.jpg", data: "data:image/jpeg;base64,AQID" }],
    });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

    // Opening it again starts from a clean form.
    const again = await openDialog();
    expect(within(again).getByRole("textbox", { name: /Your message/ })).toHaveValue("");
    expect(within(again).queryByRole("list", { name: "Screenshots to send" })).toBeNull();
  });

  it("takes a pasted screenshot, can remove it, and stops at three", async () => {
    renderDialog();
    const dialog = await openDialog();

    fireEvent.paste(within(dialog).getByRole("textbox", { name: /Your message/ }), {
      clipboardData: { files: [jpeg("image.jpg")] },
    });
    await user.click(await within(dialog).findByRole("button", { name: "Remove image.jpg" }));
    expect(within(dialog).queryByRole("list", { name: "Screenshots to send" })).toBeNull();

    await user.upload(within(dialog).getByLabelText("Choose screenshots"), [
      jpeg("a.jpg"),
      jpeg("b.jpg"),
      jpeg("c.jpg"),
      jpeg("d.jpg"),
    ]);
    expect(await within(dialog).findByText("You can add up to 3 images.")).toBeInTheDocument();
    expect(
      within(within(dialog).getByRole("list", { name: "Screenshots to send" })).getAllByRole(
        "listitem",
      ),
    ).toHaveLength(3);
    // Full: no button to add more.
    expect(within(dialog).queryByRole("button", { name: "Add screenshot" })).toBeNull();
  });

  it("shows the server's field errors next to the fields", async () => {
    server.use(
      http.post(`${API}/api/v1/feedback`, () =>
        fail(422, "VALIDATION_ERROR", "Check the highlighted fields.", [
          { path: ["message"], message: "Message looks like spam." },
          { path: ["images", 0], message: "That file isn't a real image." },
        ]),
      ),
    );
    renderDialog();
    const dialog = await openDialog();
    await fillIn(dialog, "Something odd happened here.");
    await user.upload(within(dialog).getByLabelText("Choose screenshots"), jpeg());
    await within(dialog).findByRole("button", { name: "Remove shot.jpg" });
    await user.click(within(dialog).getByRole("button", { name: "Send feedback" }));

    expect(await within(dialog).findByText("Message looks like spam.")).toBeInTheDocument();
    expect(within(dialog).getByText("That file isn't a real image.")).toBeInTheDocument();
    expect(within(dialog).getByRole("textbox", { name: /Your message/ })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("explains the hourly limit", async () => {
    server.use(
      http.post(`${API}/api/v1/feedback`, () =>
        fail(429, "TOO_MANY_REQUESTS", "Too many requests."),
      ),
    );
    renderDialog();
    const dialog = await openDialog();
    await fillIn(dialog, "Another idea for the dashboard.");
    await user.click(within(dialog).getByRole("button", { name: "Send feedback" }));

    expect(
      await within(dialog).findByText("You've sent a lot of feedback this hour. Try again later."),
    ).toBeInTheDocument();
    // The draft is kept so nothing is lost.
    expect(within(dialog).getByRole("textbox", { name: /Your message/ })).toHaveValue(
      "Another idea for the dashboard.",
    );
  });

  it("explains when the images are too big for the server", async () => {
    server.use(
      http.post(`${API}/api/v1/feedback`, () =>
        fail(413, "PAYLOAD_TOO_LARGE", "Request body too large."),
      ),
    );
    renderDialog();
    const dialog = await openDialog();
    await fillIn(dialog, "Screenshots of the broken chart.");
    await user.click(within(dialog).getByRole("button", { name: "Send feedback" }));

    expect(
      await within(dialog).findByText("Those images are too big. Try fewer or smaller ones."),
    ).toBeInTheDocument();
  });
});

const page = (feedback: Feedback[], total = feedback.length) =>
  HttpResponse.json({
    success: true,
    data: feedback,
    meta: { page: 1, limit: 10, total },
    request_id: "test",
    timestamp: now,
  });

describe("MyFeedback", () => {
  const imageUrl = `/api/v1/feedback/${sent.id}/images/9d8c7b6a-5f4e-4d3c-8b2a-1f0e9d8c7b6a`;
  const solved: Feedback = {
    ...sent,
    id: "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d",
    status: "solved",
    admin_remark: "Thanks! We fixed the timer today.",
    resolved_at: now,
    images: [
      {
        id: "9d8c7b6a-5f4e-4d3c-8b2a-1f0e9d8c7b6a",
        mime: "image/png",
        size: 2048,
        url: imageUrl,
      },
    ],
  };

  it("lists feedback with its status, the team's reply and screenshots fetched with the token", async () => {
    let auth: string | null = null;
    server.use(
      http.get(`${API}/api/v1/feedback/mine`, () =>
        page([solved, { ...sent, status: "in_progress" }]),
      ),
      http.get(`${API}${imageUrl}`, ({ request }) => {
        auth = request.headers.get("Authorization");
        return new HttpResponse(new Uint8Array([137, 80, 78, 71]), {
          headers: { "Content-Type": "image/png" },
        });
      }),
    );
    renderWithStore(<MyFeedback />, { signedInAs: testUser });

    const items = await screen.findAllByRole("listitem");
    const first = items[0]!;
    expect(first).toHaveTextContent("Bug");
    expect(within(first).getByText("Solved")).toBeInTheDocument();
    expect(first).toHaveTextContent("Reply from the PrepSuccess team");
    expect(first).toHaveTextContent("Thanks! We fixed the timer today.");
    expect(screen.getByText("In progress")).toBeInTheDocument();

    expect(await screen.findByRole("img", { name: "Screenshot 1" })).toHaveAttribute(
      "src",
      "blob:feedback-image",
    );
    expect(auth).toBe("Bearer test-access");

    await user.click(screen.getByRole("button", { name: "Open screenshot 1 of 1" }));
    const large = await screen.findByRole("dialog", { name: "Screenshot 1 of 1" });
    expect(
      await within(large).findByRole("img", { name: "Screenshot 1, full size" }),
    ).toBeInTheDocument();
  });

  it("says so when a screenshot can't be loaded", async () => {
    server.use(
      http.get(`${API}/api/v1/feedback/mine`, () => page([solved])),
      http.get(`${API}${imageUrl}`, () => new HttpResponse(null, { status: 404 })),
    );
    renderWithStore(<MyFeedback />, { signedInAs: testUser });
    expect(
      await screen.findByRole("img", { name: "Screenshot 1 (couldn't load)" }),
    ).toBeInTheDocument();
  });

  it("clamps long messages behind Show more", async () => {
    const long = "Line of detail. ".repeat(40);
    server.use(http.get(`${API}/api/v1/feedback/mine`, () => page([{ ...sent, message: long }])));
    renderWithStore(<MyFeedback />, { signedInAs: testUser });

    const more = await screen.findByRole("button", { name: "Show more" });
    expect(more).toHaveAttribute("aria-expanded", "false");
    await user.click(more);
    expect(screen.getByRole("button", { name: "Show less" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("invites the first message when there's none", async () => {
    server.use(http.get(`${API}/api/v1/feedback/mine`, () => page([])));
    renderWithStore(<MyFeedback />, { signedInAs: testUser });
    expect(await screen.findByText("No feedback yet")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send feedback" })).toBeInTheDocument();
  });

  it("pages through older feedback", async () => {
    const pages: string[] = [];
    server.use(
      http.get(`${API}/api/v1/feedback/mine`, ({ request }) => {
        pages.push(new URL(request.url).searchParams.get("page") ?? "");
        return page([sent], 12);
      }),
    );
    renderWithStore(<MyFeedback />, { signedInAs: testUser });
    expect(await screen.findByText("Page 1 of 2")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Next/ }));
    expect(await screen.findByText("Page 2 of 2")).toBeInTheDocument();
    expect(pages).toEqual(["1", "2"]);
  });
});
