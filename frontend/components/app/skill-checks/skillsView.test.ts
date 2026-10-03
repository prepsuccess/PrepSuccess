import { describe, expect, it } from "vitest";
import type { MySkill } from "@/lib/api/types";
import { groupByTopic, matches, statusOf, summarise, upNext } from "./skillsView";

let n = 0;
const skill = (overrides: Partial<MySkill> = {}): MySkill => ({
  id: `id-${++n}`,
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
const result = (percent: number) => ({
  assessment_id: "a",
  percent,
  mastery: percent >= 40 ? ("mastered" as const) : ("needs_revision" as const),
  completed_at: "2026-10-03T00:00:00.000Z",
});

describe("skills view rules", () => {
  it("summarises statuses; a retake in progress counts as in progress", () => {
    const skills = [
      skill({ last_result: result(80) }),
      skill({ last_result: result(20) }),
      skill({ last_result: result(20), in_progress_id: "x" }),
      skill(),
    ];
    expect(statusOf(skills[2]!)).toBe("in_progress");
    expect(summarise(skills)).toEqual({
      total: 4,
      checked: 2,
      todo: 1,
      in_progress: 1,
      needs_revision: 1,
      mastered: 1,
    });
  });

  it("recommends: resume, then claimed, then weakest, then aptitude, then explore", () => {
    const aptitude = skill({ category: "aptitude", name: "Quant" });
    const weak = skill({ last_result: result(10), name: "Weak" });
    const weaker = skill({ last_result: result(30), name: "Less weak" });
    const claimed = skill({ claimed: true, name: "Claimed" });
    const started = skill({ in_progress_id: "x", name: "Started" });

    expect(upNext([aptitude, weak, claimed, started])).toMatchObject({
      kind: "resume",
      skill: { name: "Started" },
    });
    expect(upNext([aptitude, weak, claimed])).toMatchObject({ kind: "start_claimed" });
    expect(upNext([aptitude, weaker, weak])).toMatchObject({
      kind: "revise",
      skill: { name: "Weak" },
    });
    expect(upNext([aptitude, skill({ last_result: result(90) })])).toMatchObject({
      kind: "start_aptitude",
    });
    expect(upNext([{ ...aptitude, last_result: result(90) }])).toEqual({ kind: "explore" });
  });

  it("searches name, topic and description, ignoring case and punctuation", () => {
    const node = skill({ name: "Node.js", topic: "Backend development" });
    expect(matches(node, "node js", "all")).toBe(true);
    expect(matches(node, "BACKEND", "all")).toBe(true);
    expect(matches(node, "c++", "all")).toBe(false);
    expect(matches(node, "", "mastered")).toBe(false);
  });

  it("groups by topic in catalogue order with checked counts", () => {
    const groups = groupByTopic([
      skill({ topic: "Web development", last_result: result(50) }),
      skill({ topic: "Aptitude" }),
      skill({ topic: "Web development" }),
    ]);
    expect(groups.map((g) => [g.topic, g.skills.length, g.checked])).toEqual([
      ["Web development", 2, 1],
      ["Aptitude", 1, 0],
    ]);
  });
});
