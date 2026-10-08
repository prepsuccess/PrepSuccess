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
    skill_options: {
      stacks: [
        { name: "MERN stack", skills: ["MongoDB", "Express.js", "React", "Node.js", "JavaScript"] },
      ],
      topics: [{ topic: "Databases", skills: ["SQL", "DBMS"] }],
    },
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
    // The reply is held at the gate, so waiting here still proves the message is
    // optimistic; the cache patch can land a render after the pending state.
    expect(await within(log()).findByText("Final year BCA")).toBeInTheDocument();
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

  it("offers skill chips on the skills question and sends exactly what was picked", async () => {
    const asked = state({ degree: "BCA", student_year: 3 }, [
      greeting,
      { role: "assistant", content: "Which skills do you know?", created_at: at },
    ]);
    let sent: unknown;
    server.use(
      http.get(`${API}/api/v1/ai/onboarding`, () => ok(asked)),
      http.post(`${API}/api/v1/ai/onboarding/messages`, async ({ request }) => {
        sent = await request.json();
        const next = state({ degree: "BCA", student_year: 3, skills: ["MERN stack", "SQL"] }, [
          ...asked.messages,
          { role: "user", content: "I know: MERN stack, SQL", created_at: at },
          { role: "assistant", content: "Great! What role are you aiming for?", created_at: at },
        ]);
        return ok({ onboarding: next, user: { ...testUser, profile: next.profile } });
      }),
      http.get(`${API}/api/v1/ai/status`, () => ok({})),
    );
    renderChat();

    const picker = await screen.findByRole("region", { name: "Pick what you know" });
    await userEvent.click(within(picker).getByRole("button", { name: "MERN stack" }));
    await userEvent.click(within(picker).getByRole("button", { name: "Choose single skills" }));
    await userEvent.click(within(picker).getByRole("button", { name: "SQL" }));
    expect(within(picker).getByRole("button", { name: "MERN stack" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await userEvent.click(within(picker).getByRole("button", { name: "Add 2 skills" }));

    expect(await screen.findByText("Great! What role are you aiming for?")).toBeInTheDocument();
    expect(sent).toEqual({ content: "I know: MERN stack, SQL", skills: ["MERN stack", "SQL"] });
    // The skills question is answered, so the chips go away.
    expect(screen.queryByRole("region", { name: "Pick what you know" })).not.toBeInTheDocument();
  });

  it("still works without skill options from an older API — typing only", async () => {
    const legacy: Partial<ReturnType<typeof state>> = state({ degree: "BCA", student_year: 3 }, [
      greeting,
    ]);
    delete legacy.skill_options;
    server.use(http.get(`${API}/api/v1/ai/onboarding`, () => ok(legacy)));
    renderChat();

    expect(await screen.findByText("Hi Asha! What are you studying?")).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Pick what you know" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Your message")).toBeInTheDocument();
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
    // Rolled back: the message isn't in the chat, it's back in the box. The undo
    // runs after the rejected action, so it can land a render after the alert.
    await waitFor(() => expect(within(log()).queryByText("BCA")).not.toBeInTheDocument());
    expect(screen.getByLabelText("Your message")).toHaveValue("BCA");

    await userEvent.click(within(alert).getByRole("button", { name: "Try again" }));

    expect(await screen.findByText("Which year are you in?")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(attempts).toBe(2);
  });

  it("reloads the chat when another tab's message got there first", async () => {
    let loads = 0;
    const otherTurn = state({ degree: "BCA" }, [
      greeting,
      { role: "user", content: "BCA from the other tab", created_at: at },
      { role: "assistant", content: "Which year are you in?", created_at: at },
    ]);
    server.use(
      http.get(`${API}/api/v1/ai/onboarding`, () => ok(loads++ === 0 ? start : otherTurn)),
      http.post(`${API}/api/v1/ai/onboarding/messages`, () =>
        fail(
          409,
          "ONBOARDING_BUSY",
          "Your last message is still being answered. Try again in a moment.",
        ),
      ),
    );
    renderChat();

    await userEvent.type(await screen.findByLabelText("Your message"), "B.Tech{Enter}");

    expect(await screen.findByRole("alert")).toHaveTextContent("still being answered");
    expect(await screen.findByText("BCA from the other tab")).toBeInTheDocument();
    expect(screen.getByLabelText("Your message")).toHaveValue("B.Tech");
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

  it("includes the branch and college in the summary when they're known", async () => {
    const profile = {
      degree: "B.Tech",
      branch: "CSE",
      college: "IIT Delhi",
      student_year: 3,
      skills: ["React"],
      target_role: "SDE",
      goals: ["Get placed"],
    };
    server.use(http.get(`${API}/api/v1/ai/onboarding`, () => ok(state(profile, [greeting]))));
    renderChat();

    expect(await screen.findByText("B.Tech CSE, year 3, IIT Delhi")).toBeInTheDocument();
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
