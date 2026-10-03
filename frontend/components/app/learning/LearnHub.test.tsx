import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type { MySkill } from "@/lib/api/types";
import { renderWithStore, testUser } from "@/test/render";
import { API, http, ok, server } from "@/test/server";
import { LearnHub } from "./LearnHub";

let n = 0;
const skill = (overrides: Partial<MySkill>): MySkill => ({
  id: `00000000-0000-4000-8000-${String(++n).padStart(12, "0")}`,
  slug: `skill-${n}`,
  name: `Skill ${n}`,
  category: "technical",
  topic: "Databases",
  description: "What it covers.",
  mastery_threshold: 40,
  claimed: false,
  in_progress_id: null,
  last_result: null,
  attempts: 0,
  ...overrides,
});
const result = (percent: number) => ({
  assessment_id: "11111111-1111-4111-8111-111111111111",
  percent,
  mastery: percent >= 40 ? ("mastered" as const) : ("needs_revision" as const),
  completed_at: "2026-10-03T00:00:00.000Z",
});

const sql = skill({ name: "SQL", slug: "sql", last_result: result(21) });
const dbms = skill({ name: "DBMS", slug: "dbms", last_result: result(35) });
const mongo = skill({ name: "MongoDB", slug: "mongodb" });
const quant = skill({ name: "Quantitative aptitude", topic: "Aptitude", last_result: result(80) });
const skills = [dbms, sql, mongo, quant];

describe("LearnHub", () => {
  it("puts skills to revise first, weakest first, with one main action", async () => {
    server.use(http.get(`${API}/api/v1/skills/mine`, () => ok({ skills, unmatched_claims: [] })));
    renderWithStore(<LearnHub />, { signedInAs: testUser });

    const next = await screen.findByRole("region", { name: "Continue learning" });
    const links = within(next).getAllByRole("link");
    expect(links.map((l) => l.textContent)).toEqual(["Study SQL", "Study DBMS"]);
    expect(links[0]).toHaveAttribute("href", "/learn/sql");
  });

  it("lists every skill by topic with progress, and searches", async () => {
    server.use(http.get(`${API}/api/v1/skills/mine`, () => ok({ skills, unmatched_claims: [] })));
    renderWithStore(<LearnHub />, { signedInAs: testUser });

    const databases = await screen.findByRole("region", { name: "Databases" });
    expect(databases).toHaveTextContent("2 of 3 checked");
    expect(within(databases).getByRole("link", { name: /MongoDB/ })).toHaveAttribute(
      "href",
      "/learn/mongodb",
    );

    await userEvent.type(screen.getByLabelText("Find a skill"), "quant");
    expect(screen.queryByRole("region", { name: "Databases" })).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Aptitude" })).toHaveTextContent("1 of 1 checked");

    await userEvent.clear(screen.getByLabelText("Find a skill"));
    await userEvent.type(screen.getByLabelText("Find a skill"), "cobol");
    expect(screen.getByText("No skills match")).toBeInTheDocument();
  });
});
