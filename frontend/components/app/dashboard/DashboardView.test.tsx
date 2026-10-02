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

const withResults: Dashboard = {
  ...empty,
  readiness: {
    score: 40,
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
    claimed: 2,
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
  generated_at: new Date().toISOString(),
};

const aiStatus = {
  available: true,
  allowed: true,
  reason: null,
  trial: { active: true, ends_at: "2027-01-01T00:00:00.000Z", days_left: 87, enforced: false },
  today: { requests: 3, limit: 200 },
};

const renderDashboard = () => renderWithStore(<DashboardView />, { signedInAs: testUser });

describe("DashboardView", () => {
  it("guides a student with no results to their first check, without asking the AI", async () => {
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

    expect(await screen.findByText("No results yet")).toBeInTheDocument();
    expect(screen.getByText("Appears after your first skill check")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Check your SQL/ })).toHaveAttribute(
      "href",
      "/assessment",
    );
    expect(screen.queryByText("By category")).not.toBeInTheDocument();
    expect(insightCalls).toBe(0);
  });

  it("shows readiness, results weakest first, and the coach's take", async () => {
    server.use(
      http.get(`${API}/api/v1/dashboard`, () => ok(withResults)),
      http.get(`${API}/api/v1/ai/insight`, () => ok(insight)),
      http.get(`${API}/api/v1/ai/status`, () => ok(aiStatus)),
    );
    renderDashboard();

    expect(await screen.findByText("Of 2 checked · pass mark 40%")).toBeInTheDocument();
    expect(screen.getByText("2 of your 2 skills checked")).toBeInTheDocument();
    expect(screen.getByRole("meter", { name: "Technical score" })).toHaveAttribute(
      "aria-valuetext",
      "40%",
    );
    expect(screen.getByRole("meter", { name: "Aptitude score" })).toHaveAttribute(
      "aria-valuetext",
      "Not checked yet",
    );

    const rows = screen.getAllByRole("meter", { name: /^(Data structures|SQL)/ });
    expect(rows.map((r) => r.getAttribute("aria-label"))).toEqual([
      "Data structures & algorithms score",
      "SQL score",
    ]);
    expect(screen.getByText("29 points up since last time")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Review your SQL answers" })).toHaveAttribute(
      "href",
      `/assessment/${sql.assessment_id}`,
    );

    expect(await screen.findByText(insight.summary!)).toBeInTheDocument();
    expect(screen.getByText("Practise arrays.")).toBeInTheDocument();
    expect(screen.getByText(/refreshes after each skill check/)).toBeInTheDocument();
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
    expect(screen.getByText("Your results")).toBeInTheDocument();

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
