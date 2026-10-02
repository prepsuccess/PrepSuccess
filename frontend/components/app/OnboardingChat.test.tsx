import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type { OnboardingState } from "@/lib/api/types";
import { API, fail, http, ok, server } from "@/test/server";
import { renderWithStore, testUser } from "@/test/render";
import { OnboardingChat } from "./OnboardingChat";

const labels = {
  degree: "What you're studying",
  student_year: "Year of study",
  skills: "Skills you know",
  target_role: "Role you're aiming for",
  goals: "Your goals",
};

function state(profile: Record<string, unknown>, messages: OnboardingState["messages"]) {
  const items = Object.entries(labels).map(([field, label]) => ({
    field,
    label,
    done: profile[field] !== undefined,
  }));
  const collected = items.filter((item) => item.done).length;
  return {
    conversation_id: "c0ffee00-0000-4000-8000-000000000001",
    messages,
    completed: collected === items.length,
    progress: { collected, total: items.length, items },
    profile,
  };
}

const at = "2026-10-02T10:00:00.000Z";
const greeting = {
  role: "assistant" as const,
  content: "Hi Asha! What are you studying?",
  created_at: at,
};
const start = state({}, [greeting]);

const renderChat = () => renderWithStore(<OnboardingChat />, { signedInAs: testUser });
const log = () => screen.getByRole("log", { name: "Onboarding chat" });

describe("OnboardingChat", () => {
  it("shows the coach's greeting and what's still needed", async () => {
    server.use(http.get(`${API}/api/v1/ai/onboarding`, () => ok(start)));
    renderChat();

    expect(await screen.findByText("Hi Asha! What are you studying?")).toBeInTheDocument();
    expect(screen.getByText("0 of 5 details")).toBeInTheDocument();
    expect(screen.getByText(/Year of study/)).toHaveTextContent("still needed");
    expect(screen.getByRole("link", { name: "Finish later" })).toHaveAttribute(
      "href",
      "/dashboard",
    );
  });

  it("sends on Enter, shows the message at once, then the reply and progress", async () => {
    let sent: unknown;
    let release!: () => void;
    const gate = new Promise<void>((resolve) => (release = resolve));
    const reply = {
      role: "assistant" as const,
      content: "Nice! Which skills do you know?",
      created_at: at,
    };
    server.use(
      http.get(`${API}/api/v1/ai/onboarding`, () => ok(start)),
      http.post(`${API}/api/v1/ai/onboarding/messages`, async ({ request }) => {
        sent = await request.json();
        await gate;
        return ok({
          onboarding: state({ degree: "BCA", student_year: 3 }, [
            greeting,
            { role: "user", content: "Final year BCA", created_at: at },
            reply,
          ]),
          user: { ...testUser, profile: { degree: "BCA", student_year: 3 } },
        });
      }),
    );
    const { store } = renderChat();

    await userEvent.type(await screen.findByLabelText("Your message"), "Final year BCA{Enter}");

    // Optimistic: the student's message and the typing dots appear before the reply.
    expect(within(log()).getByText("Final year BCA")).toBeInTheDocument();
    expect(screen.getByLabelText("Coach is typing")).toBeInTheDocument();
    expect(screen.getByLabelText("Your message")).toHaveValue("");

    release();
    expect(await screen.findByText("Nice! Which skills do you know?")).toBeInTheDocument();
    expect(sent).toEqual({ content: "Final year BCA" });
    expect(screen.getByText("2 of 5 details")).toBeInTheDocument();
    expect(screen.queryByLabelText("Coach is typing")).not.toBeInTheDocument();
    // The returned user went into the getMe cache.
    const me = store.getState().api.queries["getMe(undefined)"]?.data as typeof testUser;
    expect(me.profile.degree).toBe("BCA");
  });

  it("Shift+Enter adds a new line instead of sending", async () => {
    server.use(http.get(`${API}/api/v1/ai/onboarding`, () => ok(start)));
    renderChat();

    const box = await screen.findByLabelText("Your message");
    await userEvent.type(box, "HTML{Shift>}{Enter}{/Shift}CSS");
    expect(box).toHaveValue("HTML\nCSS");
  });

  it("takes a failed message back out and lets the student try again", async () => {
    let attempts = 0;
    server.use(
      http.get(`${API}/api/v1/ai/onboarding`, () => ok(start)),
      http.post(`${API}/api/v1/ai/onboarding/messages`, () => {
        attempts += 1;
        if (attempts === 1) {
          return fail(503, "AI_UNAVAILABLE", "The AI is busy right now. Try again in a moment.");
        }
        return ok({
          onboarding: state({ degree: "BCA" }, [
            greeting,
            { role: "user", content: "BCA", created_at: at },
            { role: "assistant", content: "Which year are you in?", created_at: at },
          ]),
          user: { ...testUser, profile: { degree: "BCA" } },
        });
      }),
    );
    renderChat();

    await userEvent.type(await screen.findByLabelText("Your message"), "BCA{Enter}");

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Your message wasn't sent");
    expect(alert).toHaveTextContent("The AI is busy right now.");
    // Rolled back: the message isn't in the chat, it's back in the box.
    expect(within(log()).queryByText("BCA")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Your message")).toHaveValue("BCA");

    await userEvent.click(within(alert).getByRole("button", { name: "Try again" }));

    expect(await screen.findByText("Which year are you in?")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(attempts).toBe(2);
  });

  it("shows a summary and the way to the dashboard once complete", async () => {
    const profile = {
      degree: "BCA",
      student_year: 3,
      skills: ["HTML", "CSS"],
      target_role: "Frontend developer",
      goals: ["Get placed"],
    };
    server.use(http.get(`${API}/api/v1/ai/onboarding`, () => ok(state(profile, [greeting]))));
    renderChat();

    expect(await screen.findByText("You're all set")).toBeInTheDocument();
    expect(screen.getByText("BCA, year 3")).toBeInTheDocument();
    expect(screen.getByText("Frontend developer")).toBeInTheDocument();
    expect(screen.getByText("CSS")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go to your dashboard" })).toHaveAttribute(
      "href",
      "/dashboard",
    );
    expect(screen.queryByLabelText("Your message")).not.toBeInTheDocument();
  });

  it("shows an error with a retry when the chat can't load", async () => {
    server.use(
      http.get(`${API}/api/v1/ai/onboarding`, () => fail(500, "INTERNAL_SERVER_ERROR", "Boom.")),
    );
    renderChat();

    expect(await screen.findByRole("alert")).toHaveTextContent("Couldn't load your chat");
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument(),
    );
  });
});
