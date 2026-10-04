import { beforeEach, describe, expect, it, vi } from "vitest";

import { Prisma } from "../src/generated/prisma/client.js";

const db = vi.hoisted(() => {
  const now = new Date("2026-10-03T10:00:00.000Z");
  const row = (data: Record<string, unknown>) => ({
    id: "5c8b4d2f-3a1e-4b7c-8d9f-2e3a4b5c6d7e",
    slug: "sql",
    name: "SQL",
    category: "TECHNICAL",
    topic: null,
    subtopic: null,
    description: null,
    masteryThreshold: 40,
    isActive: true,
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
    ...data,
  });
  return {
    row,
    prisma: {
      skill: {
        findFirst: vi.fn(async (): Promise<unknown> => null),
        create: vi.fn(async ({ data }) => row(data)),
        update: vi.fn(async ({ data }) => row(data)),
      },
      learningResource: {
        groupBy: vi.fn(async () => [
          { skillId: "5c8b4d2f-3a1e-4b7c-8d9f-2e3a4b5c6d7e", _count: { _all: 2 } },
        ]),
      },
      practicalTask: { groupBy: vi.fn(async () => []) },
      assessment: { groupBy: vi.fn(async () => []) },
    },
  };
});

vi.mock("../src/db/prisma.js", () => ({ prisma: db.prisma }));

const { createSkill } = await import("../src/modules/admin/admin.content.service.js");

const input = {
  name: "Structured Query Language",
  slug: "sql",
  category: "technical" as const,
  topic: "Databases",
  description: null,
  mastery_threshold: 50,
};

beforeEach(() => vi.clearAllMocks());

describe("createSkill", () => {
  it("creates a new skill when the slug is free", async () => {
    const skill = await createSkill(input);
    expect(db.prisma.skill.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ slug: "sql", name: "Structured Query Language" }),
    });
    expect(db.prisma.skill.update).not.toHaveBeenCalled();
    expect(skill).toMatchObject({ slug: "sql", resources: 0, tasks: 0, checks: 0 });
  });

  it("restores a deleted skill with the same slug instead of failing", async () => {
    db.prisma.skill.findFirst.mockResolvedValueOnce({ id: db.row({}).id });
    const skill = await createSkill(input);
    expect(db.prisma.skill.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { slug: "sql", isDeleted: true } }),
    );
    expect(db.prisma.skill.create).not.toHaveBeenCalled();
    expect(db.prisma.skill.update).toHaveBeenCalledWith({
      where: { id: db.row({}).id },
      data: expect.objectContaining({
        name: "Structured Query Language",
        category: "TECHNICAL",
        masteryThreshold: 50,
        isDeleted: false,
        isActive: true,
      }),
    });
    // Its surviving content is counted again.
    expect(skill).toMatchObject({
      name: "Structured Query Language",
      is_active: true,
      resources: 2,
    });
  });

  it("still answers 409 SLUG_TAKEN when a visible skill uses the slug", async () => {
    db.prisma.skill.create.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "test",
      }),
    );
    await expect(createSkill(input)).rejects.toMatchObject({ status: 409, code: "SLUG_TAKEN" });
  });
});
