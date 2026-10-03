import { describe, expect, it } from "vitest";

import { QUESTION_CATALOGUE } from "../src/modules/questions/catalogue.js";
import { COMPANIES, ROLES } from "../src/modules/questions/taxonomy.js";
import { SKILL_CATALOGUE } from "../src/modules/skills/catalogue.js";

describe("starter interview question bank", () => {
  const slugs = new Set(SKILL_CATALOGUE.map((s) => s.slug));

  it("has about 20 questions for every skill, all levels, unique titles", () => {
    for (const slug of slugs) {
      const questions = QUESTION_CATALOGUE.filter((q) => q.skill === slug);
      expect(questions.length, slug).toBeGreaterThanOrEqual(18);
      expect(questions.length, slug).toBeLessThanOrEqual(22);
      for (const level of ["EASY", "MEDIUM", "HARD"] as const) {
        expect(
          questions.some((q) => q.difficulty === level),
          `${slug} ${level}`,
        ).toBe(true);
      }
      expect(new Set(questions.map((q) => q.title)).size, slug).toBe(questions.length);
    }
  });

  it("only uses real skills, the fixed company/role lists, and fits the database", () => {
    const companies = new Set<string>(COMPANIES);
    const roles = new Set<string>(ROLES);
    for (const q of QUESTION_CATALOGUE) {
      expect(slugs.has(q.skill), q.title).toBe(true);
      if (q.company) expect(companies.has(q.company), q.title).toBe(true);
      if (q.role) expect(roles.has(q.role), q.title).toBe(true);
      expect(q.title.length, q.title).toBeLessThanOrEqual(200);
      expect(q.topic.length, q.title).toBeLessThanOrEqual(100);
      expect(q.body.length, q.title).toBeGreaterThan(10);
      expect(q.answer.length, q.title).toBeGreaterThan(20);
    }
  });
});

describe("prep guides shipped with the app", () => {
  it("each has its built PDF in frontend/public/guides and valid tags", async () => {
    const { existsSync } = await import("node:fs");
    const { GUIDE_CATALOGUE } = await import("../src/modules/questions/guides.js");
    const slugs = new Set(SKILL_CATALOGUE.map((s) => s.slug));
    const roles = new Set<string>(ROLES);
    expect(GUIDE_CATALOGUE.length).toBeGreaterThan(0);
    for (const guide of GUIDE_CATALOGUE) {
      const pdf = new URL(`../../frontend/public/guides/${guide.file}`, import.meta.url);
      expect(existsSync(pdf), guide.file).toBe(true);
      if (guide.skill) expect(slugs.has(guide.skill), guide.title).toBe(true);
      if (guide.role) expect(roles.has(guide.role), guide.title).toBe(true);
    }
  });
});
