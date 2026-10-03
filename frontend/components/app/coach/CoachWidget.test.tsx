import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CoachState } from "@/lib/api/types";
import { API, fail, http, ok, server } from "@/test/server";
import { renderWithStore, testUser } from "@/test/render";
import { CoachProvider } from "./CoachProvider";
import { CoachWidget, coachHiddenOn } from "./CoachWidget";

let pathname = "/dashboard";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));

const usage = (used: number) => ({
  used,
  limit: 20,
  remaining: 20 - used,
  resets_at: "2026-10-03T18:30:00.000Z",
});
const empty: CoachState = {
  messages: [],
  usage: usage(0),
  suggestions: ["What should I work on next?", "How do I improve my SQL?"],
};

let pings = 0;
beforeEach(() => {
  pathname = "/dashboard";
  pings = 0;
  server.use(
    http.post(`${API}/api/v1/ai/coach/ping`, () => {
      pings += 1;
      return ok({ nudged: false });
    }),
  );
});

const renderCoach = () =>
  renderWithStore(
    <CoachProvider>
      <CoachWidget />
    </CoachProvider>,
    { signedInAs: testUser },
  );

describe("CoachWidget", () => {
  it("opens from the corner button with starter questions and today's allowance", async () => {
    server.use(http.get(`${API}/api/v1/ai/coach`, () => ok(empty)));
    renderCoach();

    await userEvent.click(screen.getByRole("button", { name: "Ask your AI coach" }));
    const chat = screen.getByRole("dialog", { name: "PrepSuccess coach" });
    expect(await within(chat).findByText("20 of 20 messages left today")).toBeInTheDocument();
    expect(
      within(chat).getByRole("button", { name: "How do I improve my SQL?" }),
    ).toBeInTheDocument();
    // It tells the server the student is active (for the 30-minute check-in).
    await waitFor(() => expect(pings).toBe(1));
  });

  it("sends a question and shows the coach's reply", async () => {
    let body: unknown;
    server.use(
      http.get(`${API}/api/v1/ai/coach`, () => ok(empty)),
      http.post(`${API}/api/v1/ai/coach/messages`, async ({ request }) => {
        body = await request.json();
        return ok({
          ...empty,
          usage: usage(1),
          messages: [
            {
              role: "user",
              content: "How do I improve my SQL?",
              created_at: "2026-10-03T10:00:00.000Z",
            },
            {
              role: "assistant",
              content: "Start with joins:\n- INNER JOIN\n- LEFT JOIN",
              created_at: "2026-10-03T10:00:05.000Z",
            },
          ],
        });
      }),
    );
    renderCoach();
    await userEvent.click(screen.getByRole("button", { name: "Ask your AI coach" }));
    const chat = screen.getByRole("dialog", { name: "PrepSuccess coach" });

    await userEvent.click(
      await within(chat).findByRole("button", { name: "How do I improve my SQL?" }),
    );
    expect(await within(chat).findByText("INNER JOIN")).toBeInTheDocument();
    expect(body).toEqual({ content: "How do I improve my SQL?" });
    expect(within(chat).getByText("19 of 20 messages left today")).toBeInTheDocument();
  });

  it("keeps the question when the AI fails", async () => {
    server.use(
      http.get(`${API}/api/v1/ai/coach`, () => ok(empty)),
      http.post(`${API}/api/v1/ai/coach/messages`, () =>
        fail(503, "AI_UNAVAILABLE", "The AI is busy right now. Please try again in a moment."),
      ),
    );
    renderCoach();
    await userEvent.click(screen.getByRole("button", { name: "Ask your AI coach" }));
    const chat = screen.getByRole("dialog", { name: "PrepSuccess coach" });

    const box = await within(chat).findByLabelText("Ask your coach");
    await userEvent.type(box, "Explain normalisation{Enter}");
    expect(await within(chat).findByRole("alert")).toHaveTextContent("The AI is busy right now.");
    expect(box).toHaveValue("Explain normalisation");
  });

  it("disables the box once today's messages are used", async () => {
    server.use(http.get(`${API}/api/v1/ai/coach`, () => ok({ ...empty, usage: usage(20) })));
    renderCoach();
    await userEvent.click(screen.getByRole("button", { name: "Ask your AI coach" }));
    const chat = screen.getByRole("dialog", { name: "PrepSuccess coach" });
    expect(await within(chat).findByText(/used today's 20 messages/)).toBeInTheDocument();
    expect(within(chat).getByLabelText("Ask your coach")).toBeDisabled();
  });

  it("stays out of the onboarding chat and skill checks", () => {
    expect(coachHiddenOn("/onboarding")).toBe(true);
    expect(coachHiddenOn("/assessment/6d9c5e3a-4b2f-4c8d-9eaf-3f4b5c6d7e8f")).toBe(true);
    expect(coachHiddenOn("/assessment")).toBe(false);
    pathname = "/assessment/abc";
    renderCoach();
    expect(screen.queryByRole("button", { name: "Ask your AI coach" })).not.toBeInTheDocument();
  });
});
