import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type { AiInsight, Dashboard } from "@/lib/api/types";
import { API, fail, http, ok, server } from "@/test/server";
import { renderWithStore, testUser } from "@/test/render";
import { DashboardView } from "./DashboardView";

const weights = { technical: 50, aptitude: 30, soft: 20 };

const empty: Dashboard = {
  onboarding_completed: true,
  readiness: {
    score: null,
    change: null,
    history: [],
    weights,
    categories: [
      { category: "technical", score: null, checked: 0 },
      { category: "aptitude", score: null, checked: 0 },
      { category: "soft", score: null, checked: 0 },
    ],
  },
  counts: {
    checked: 0,
    mastered: 0,
    needs_revision: 0,
    claimed: 2,
    claimed_checked: 0,
    in_progress: 0,
  },
  skills: [],
  gaps: [],
  next_steps: [
    {
      id: "check-SQL",
      kind: "check",
      title: "Check your SQL",
      detail: "You said you know it.",
      href: "/assessment",
    },
  ],
};

const dsa = {
  skill_id: "00000000-0000-4000-8000-000000000001",
  slug: "dsa",
  name: "Data structures & algorithms",
  category: "technical" as const,
  assessment_id: "00000000-0000-4000-8000-0000000000a1",
  percent: 29,
  mastery: "needs_revision" as const,
  completed_at: "2026-10-03T10:00:00.000Z",
  attempts: 1,
  change: null,
};
const sql = {
  ...dsa,
  skill_id: "00000000-0000-4000-8000-000000000002",
  slug: "sql",
  name: "SQL",
  assessment_id: "00000000-0000-4000-8000-0000000000a2",
  percent: 50,
  mastery: "mastered" as const,
  attempts: 2,
  change: 29,
};

const now = new Date().toISOString();
const withResults: Dashboard = {
  ...empty,
  readiness: {
    score: 40,
    change: 11,
    history: [
      { date: now, score: 21, skill: "SQL", percent: 21 },
      { date: now, score: 25, skill: "Data structures & algorithms", percent: 29 },
      { date: now, score: 40, skill: "SQL", percent: 50 },
    ],
    weights,
    categories: [
      { category: "technical", score: 40, checked: 2 },
      { category: "aptitude", score: null, checked: 0 },
      { category: "soft", score: null, checked: 0 },
    ],
  },
  counts: {
    checked: 2,
    mastered: 1,
    needs_revision: 1,
    claimed: 3,
    claimed_checked: 2,
    in_progress: 0,
  },
  skills: [dsa, sql],
  gaps: [dsa],
  next_steps: [
    {
      id: "revise-dsa",
      kind: "revise",
      title: "Revise Data structures & algorithms",
      detail: "You scored 29%.",
      href: `/assessment/${dsa.assessment_id}`,
    },
  ],
};

const insight: AiInsight = {
  status: "ready",
  summary: "You're on track for a backend role; DSA is the gap.",
  gaps: [
    {
      skill_id: dsa.skill_id,
      name: dsa.name,
      why: "Interviews lean on it.",
      how: "Practise arrays.",
    },
  ],
  plan: [{ title: "Revise DSA", detail: "Go through your missed answers." }],
  generated_at: now,
};

const aiStatus = {
  available: true,
  allowed: true,
  reason: null,
  trial: { active: true, ends_at: "2027-01-01T00:00:00.000Z", days_left: 87, enforced: false },
  today: { requests: 3, limit: 200 },
};

const renderDashboard = () => renderWithStore(<DashboardView />, { signedInAs: testUser });
const card = (name: string) => screen.getByRole("region", { name });

describe("DashboardView", () => {
  it("shows the full frame with guidance before any result, without asking the AI", async () => {
    let insightCalls = 0;
    server.use(
      http.get(`${API}/api/v1/dashboard`, () => ok(empty)),
      http.get(`${API}/api/v1/ai/insight`, () => {
        insightCalls += 1;
        return ok(insight);
      }),
      http.get(`${API}/api/v1/ai/status`, () => ok(aiStatus)),
    );
    renderDashboard();

    const standing = await screen.findByRole("region", { name: "Your standing" });
    expect(standing).toHaveTextContent("appears after your first check");
    expect(card("Progress over time")).toHaveTextContent("starts after your first two checks");
    expect(card("Skill scores")).toHaveTextContent("appears here");
    // The gauge's button is the top next step.
    expect(within(card("Readiness")).getByRole("link", { name: "Check your SQL" })).toHaveAttribute(
      "href",
      "/assessment",
    );
    expect(screen.queryByRole("region", { name: "Your coach's take" })).not.toBeInTheDocument();
    expect(insightCalls).toBe(0);
  });

  it("shows standing, categories, skills and the coach's take from real results", async () => {
    server.use(
      http.get(`${API}/api/v1/dashboard`, () => ok(withResults)),
      http.get(`${API}/api/v1/ai/insight`, () => ok(insight)),
      http.get(`${API}/api/v1/ai/status`, () => ok(aiStatus)),
    );
    renderDashboard();

    const standing = await screen.findByRole("region", { name: "Your standing" });
    expect(standing).toHaveTextContent("Readiness out of 100, up 11 since your last check");
    expect(standing).toHaveTextContent("below the 40% pass mark, of 2 checked");

    expect(screen.getByRole("meter", { name: "Technical score" })).toHaveAttribute(
      "aria-valuetext",
      "40%",
    );
    expect(screen.getByRole("meter", { name: "Aptitude score" })).toHaveAttribute(
      "aria-valuetext",
      "Not checked yet",
    );
    expect(
      screen.getByRole("img", { name: "Mastered: 1, Needs revision: 1, Not checked yet: 1" }),
    ).toBeInTheDocument();
    expect(card("Mastery")).toHaveTextContent("50%");
    expect(card("Before and after")).toHaveTextContent("1 skill retaken");
    expect(
      within(card("Skill scores")).getByRole("link", {
        name: "SQL: 50%, mastered. Review answers",
      }),
    ).toHaveAttribute("href", `/assessment/${sql.assessment_id}`);
    expect(
      within(card("Next steps")).getByRole("link", { name: /Revise Data structures/ }),
    ).toHaveAttribute("href", `/assessment/${dsa.assessment_id}`);

    // The skeleton shares the card's title, so wait for the AI text itself.
    await screen.findByText(insight.summary!);
    expect(card("Your coach's take")).toHaveTextContent("Practise arrays.");
  });

  it("marks practice days on the calendar", async () => {
    server.use(
      http.get(`${API}/api/v1/dashboard`, () => ok(withResults)),
      http.get(`${API}/api/v1/ai/insight`, () => ok(insight)),
      http.get(`${API}/api/v1/ai/status`, () => ok(aiStatus)),
    );
    renderDashboard();

    const day = new Date().getDate();
    expect(
      await screen.findByRole("gridcell", { name: `${day}, checks taken, today` }),
    ).toBeInTheDocument();
    expect(screen.getByText("3 checks this month")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next month" })).toBeDisabled();
  });

  it("keeps the numbers when the coach's take fails, and offers a retry", async () => {
    let attempts = 0;
    server.use(
      http.get(`${API}/api/v1/dashboard`, () => ok(withResults)),
      http.get(`${API}/api/v1/ai/insight`, () => {
        attempts += 1;
        return attempts === 1
          ? fail(503, "AI_UNAVAILABLE", "The AI is busy right now. Please try again in a moment.")
          : ok(insight);
      }),
      http.get(`${API}/api/v1/ai/status`, () => ok(aiStatus)),
    );
    renderDashboard();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Couldn't get your coach's take.");
    expect(card("Skill scores")).toBeInTheDocument();

    await userEvent.click(within(alert).getByRole("button", { name: "Try again" }));
    expect(await screen.findByText(insight.summary!)).toBeInTheDocument();
  });

  it("shows an error with a retry when the dashboard can't load", async () => {
    server.use(
      http.get(`${API}/api/v1/dashboard`, () => fail(500, "INTERNAL_SERVER_ERROR", "Boom.")),
    );
    renderDashboard();
    expect(await screen.findByRole("alert")).toHaveTextContent("Couldn't load your dashboard");
  });
});
