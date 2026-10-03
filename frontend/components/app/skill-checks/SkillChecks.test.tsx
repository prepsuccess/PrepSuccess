import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { MySkill } from "@/lib/api/types";
import { API, fail, http, ok, server } from "@/test/server";
import { renderWithStore, testUser } from "@/test/render";
import { SkillChecks } from "./SkillChecks";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

let n = 0;
const skill = (overrides: Partial<MySkill>): MySkill => ({
  id: `00000000-0000-4000-8000-${String(++n).padStart(12, "0")}`,
  slug: `skill-${n}`,
  name: `Skill ${n}`,
  category: "technical",
  topic: "CS fundamentals",
  description: "What it covers.",
  mastery_threshold: 40,
  claimed: false,
  in_progress_id: null,
  last_result: null,
  attempts: 0,
  ...overrides,
});

const dsa = skill({ name: "Data structures & algorithms", claimed: true });
const sql = skill({
  name: "SQL",
  claimed: true,
  last_result: {
    assessment_id: "11111111-1111-4111-8111-111111111111",
    percent: 29,
    mastery: "needs_revision",
    completed_at: "2026-10-03T10:00:00.000Z",
  },
  attempts: 1,
});
const python = skill({
  name: "Python",
  claimed: true,
  in_progress_id: "22222222-2222-4222-8222-222222222222",
});
const quant = skill({ name: "Quantitative aptitude", category: "aptitude", topic: "Aptitude" });
const teamwork = skill({ name: "Teamwork", category: "soft", topic: "Soft skills" });

const mine = { skills: [dsa, sql, python, quant, teamwork], unmatched_claims: ["Kotlin"] };

const renderList = () => renderWithStore(<SkillChecks />, { signedInAs: testUser });

describe("SkillChecks", () => {
  afterEach(() => push.mockReset());

  it("puts the student's own skills first, with where they stand", async () => {
    server.use(http.get(`${API}/api/v1/skills/mine`, () => ok(mine)));
    renderList();

    const yours = await screen.findByRole("region", { name: "Your skills" });
    expect(within(yours).getByText("Data structures & algorithms")).toBeInTheDocument();
    expect(within(yours).getByText("Not checked")).toBeInTheDocument();
    expect(within(yours).getByText("Needs revision · 29%")).toBeInTheDocument();
    expect(within(yours).getByText("In progress")).toBeInTheDocument();
    // The name opens the skill's Learn page (answers, study material, tasks).
    expect(within(yours).getByRole("link", { name: "SQL" })).toHaveAttribute(
      "href",
      `/learn/${sql.slug}`,
    );
    expect(screen.getByText(/Not in our catalogue yet: Kotlin/)).toBeInTheDocument();
  });

  it("shows progress and one recommended next step", async () => {
    server.use(http.get(`${API}/api/v1/skills/mine`, () => ok(mine)));
    renderList();

    expect((await screen.findByText(/skills checked/)).closest("p")).toHaveTextContent(
      "1 of 5 skills checked",
    );
    expect(
      screen.getByRole("img", {
        name: /0 mastered, 1 need revision, 1 in progress, 3 not checked yet/,
      }),
    ).toBeInTheDocument();
    // An unfinished check comes first.
    expect(screen.getByRole("heading", { name: "Finish your Python check" })).toBeInTheDocument();
  });

  it("groups other skills by topic, each name linking to its Learn page", async () => {
    server.use(http.get(`${API}/api/v1/skills/mine`, () => ok(mine)));
    renderList();

    const aptitude = await screen.findByRole("region", { name: "Aptitude" });
    expect(
      within(aptitude).getByRole("button", { name: "Start check — Quantitative aptitude" }),
    ).toBeInTheDocument();
    expect(within(aptitude).getByRole("link", { name: "Quantitative aptitude" })).toHaveAttribute(
      "href",
      `/learn/${quant.slug}`,
    );
    expect(
      within(screen.getByRole("region", { name: "Soft skills" })).getByText("Teamwork"),
    ).toBeInTheDocument();
  });

  it("finds skills by search and explains an empty result", async () => {
    server.use(http.get(`${API}/api/v1/skills/mine`, () => ok(mine)));
    renderList();

    await userEvent.type(await screen.findByLabelText("Find a skill"), "team");
    expect(screen.getByRole("button", { name: "Start check — Teamwork" })).toBeInTheDocument();
    expect(screen.queryByText("Data structures & algorithms")).not.toBeInTheDocument();

    await userEvent.clear(screen.getByLabelText("Find a skill"));
    await userEvent.type(screen.getByLabelText("Find a skill"), "cobol");
    expect(screen.getByText("No skills match")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Show all skills" }));
    expect(screen.getByLabelText("Find a skill")).toHaveValue("");
    expect(screen.getByText("Python")).toBeInTheDocument();
  });

  it("explains the wait while the AI writes the questions, then opens the check", async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => (release = resolve));
    let body: unknown;
    server.use(
      http.get(`${API}/api/v1/skills/mine`, () => ok(mine)),
      http.post(`${API}/api/v1/ai/assessment/start`, async ({ request }) => {
        body = await request.json();
        await gate;
        return ok({ id: "33333333-3333-4333-8333-333333333333" });
      }),
      http.get(`${API}/api/v1/ai/status`, () => ok({})),
    );
    renderList();

    await userEvent.click(
      await screen.findByRole("button", { name: "Start check — Data structures & algorithms" }),
    );

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveTextContent("Preparing your Data structures & algorithms check");
    expect(dialog).toHaveTextContent("10–30 seconds");
    expect(body).toEqual({ skill_id: dsa.id });

    release();
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith("/assessment/33333333-3333-4333-8333-333333333333"),
    );
  });

  it("resumes an unfinished check without starting a new one", async () => {
    server.use(http.get(`${API}/api/v1/skills/mine`, () => ok(mine)));
    renderList();

    await userEvent.click(await screen.findByRole("button", { name: "Resume — Python" }));
    expect(push).toHaveBeenCalledWith("/assessment/22222222-2222-4222-8222-222222222222");
  });

  it("offers a retry when the AI can't write the check", async () => {
    let attempts = 0;
    server.use(
      http.get(`${API}/api/v1/skills/mine`, () => ok(mine)),
      http.post(`${API}/api/v1/ai/assessment/start`, () => {
        attempts += 1;
        return attempts === 1
          ? fail(503, "AI_UNAVAILABLE", "The AI is busy right now. Please try again in a moment.")
          : ok({ id: "44444444-4444-4444-8444-444444444444" });
      }),
      http.get(`${API}/api/v1/ai/status`, () => ok({})),
    );
    renderList();

    await userEvent.click(await screen.findByRole("button", { name: "Retake — SQL" }));
    const dialog = await screen.findByRole("dialog");
    expect(await within(dialog).findByText("Couldn't start the check")).toBeInTheDocument();
    expect(dialog).toHaveTextContent("The AI is busy right now.");

    await userEvent.click(within(dialog).getByRole("button", { name: "Try again" }));
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith("/assessment/44444444-4444-4444-8444-444444444444"),
    );
  });
});
