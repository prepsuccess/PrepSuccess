/* eslint-disable no-console -- CLI output */
import { isDeepStrictEqual } from "node:util";

import { prisma } from "../src/db/prisma.js";
import { QUESTION_CATALOGUE } from "../src/modules/questions/catalogue.js";
import { GUIDE_CATALOGUE } from "../src/modules/questions/guides.js";
import { RESOURCE_CATALOGUE } from "../src/modules/resources/catalogue.js";
import { SKILL_CATALOGUE } from "../src/modules/skills/catalogue.js";
import { TASK_CATALOGUE } from "../src/modules/tasks/catalogue.js";

/**
 * Seeds the skill catalogue, learning resources, practical tasks, the
 * interview question bank and the prep guides: `npm run db:seed`.
 *
 * By default it only INSERTS catalogue rows that don't exist yet — skills by
 * slug; resources, tasks and questions by skill + title; guides by title — and
 * leaves existing rows alone, so edits made in the admin panel survive a
 * re-run. `npm run db:seed -- --update` also overwrites existing rows' content
 * with the catalogue (use it after editing a catalogue file on purpose).
 *
 * Nothing is ever deleted, and an admin's deactivate / soft delete is kept in
 * both modes: rows removed from a catalogue are left alone (students may have
 * used them). Safe to run repeatedly.
 */

const update = process.argv.includes("--update");

// Guide links are built from FRONTEND_URL. Seeding a remote database with
// localhost links would send every student to a page that doesn't exist.
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]", "::1", "host.docker.internal"]);
const hostOf = (url: string | undefined) => {
  try {
    return url ? new URL(url).hostname : "";
  } catch {
    return "";
  }
};
const frontendUrl = process.env.FRONTEND_URL?.trim();
if (
  !LOCAL_HOSTS.has(hostOf(process.env.DATABASE_URL)) &&
  (!frontendUrl || LOCAL_HOSTS.has(hostOf(frontendUrl)))
) {
  console.error(
    "Refusing to seed: DATABASE_URL points at a remote database but FRONTEND_URL is " +
      (frontendUrl ? `local (${frontendUrl})` : "not set") +
      ", so the prep guide links would point at localhost.\n" +
      "Set FRONTEND_URL to that environment's site, e.g. FRONTEND_URL=https://prepsuccess.vercel.app",
  );
  await prisma.$disconnect();
  process.exit(1);
}

interface Tally {
  created: number;
  updated: number;
  unchanged: number;
}
const tallies: Record<string, Tally> = {};
const tally = (name: string) => (tallies[name] = { created: 0, updated: 0, unchanged: 0 });

/** True when any field in `data` differs from the stored row (JSON compared by value). */
const differs = (row: Record<string, unknown>, data: Record<string, unknown>) =>
  Object.entries(data).some(([key, value]) => !isDeepStrictEqual(row[key], value));

/**
 * Creates the row when it's missing; with --update, refreshes it when its
 * content differs from the catalogue. Returns nothing — it only counts.
 */
async function sync<Row extends { id: string }>(
  count: Tally,
  existing: Row | null,
  create: () => Promise<unknown>,
  refresh: (id: string) => Promise<unknown>,
  data: Record<string, unknown>,
) {
  if (!existing) {
    await create();
    count.created++;
  } else if (update && differs(existing, data)) {
    await refresh(existing.id);
    count.updated++;
  } else {
    count.unchanged++;
  }
}

// ---- Skills ----------------------------------------------------------------

const skills = tally("skills");
for (const { slug, name, category, topic, description } of SKILL_CATALOGUE) {
  const data = { name, category, topic: topic ?? null, description: description ?? null };
  await sync(
    skills,
    await prisma.skill.findUnique({ where: { slug } }),
    () => prisma.skill.create({ data: { slug, ...data } }),
    (id) => prisma.skill.update({ where: { id }, data }),
    data,
  );
}

const skillIds = new Map(
  (await prisma.skill.findMany({ select: { id: true, slug: true } })).map((s) => [s.slug, s.id]),
);
const skillId = (slug: string) => {
  const id = skillIds.get(slug);
  if (!id) throw new Error(`Catalogue entry points at unknown skill "${slug}"`);
  return id;
};

// ---- Learning resources ----------------------------------------------------

const resources = tally("learning resources");
for (const resource of RESOURCE_CATALOGUE) {
  const key = { skillId: skillId(resource.skill), title: resource.title };
  const data = {
    type: resource.type,
    url: resource.url ?? null,
    content: resource.content ?? null,
    source: resource.source ?? null,
  };
  await sync(
    resources,
    await prisma.learningResource.findFirst({ where: key, orderBy: { createdAt: "asc" } }),
    () => prisma.learningResource.create({ data: { ...key, ...data } }),
    (id) => prisma.learningResource.update({ where: { id }, data }),
    data,
  );
}

// ---- Practical tasks -------------------------------------------------------

const tasks = tally("practical tasks");
for (const task of TASK_CATALOGUE) {
  const key = { skillId: skillId(task.skill), title: task.title };
  const data = {
    description: task.description,
    difficulty: task.difficulty,
    // Criteria are stored as-is (including an optional `expected`); the JSON
    // round trip drops undefined keys so the comparison matches what's stored.
    evaluationCriteria: JSON.parse(JSON.stringify({ criteria: task.rubric })) as {
      criteria: object[];
    },
    starterCode: task.starter ?? null,
  };
  await sync(
    tasks,
    await prisma.practicalTask.findFirst({ where: key, orderBy: { createdAt: "asc" } }),
    () => prisma.practicalTask.create({ data: { ...key, ...data } }),
    (id) => prisma.practicalTask.update({ where: { id }, data }),
    data,
  );
}

// ---- Interview questions ---------------------------------------------------

const questions = tally("interview questions");
for (const question of QUESTION_CATALOGUE) {
  const key = { skillId: skillId(question.skill), title: question.title };
  const data = {
    body: question.body,
    answer: question.answer,
    topic: question.topic,
    difficulty: question.difficulty,
    company: question.company ?? null,
    role: question.role ?? null,
  };
  await sync(
    questions,
    await prisma.questionBank.findUnique({ where: { skillId_title: key } }),
    () => prisma.questionBank.create({ data: { ...key, ...data } }),
    (id) => prisma.questionBank.update({ where: { id }, data }),
    data,
  );
}

// ---- Prep guides -----------------------------------------------------------

// PDFs served by the frontend; links follow FRONTEND_URL. Matched by title
// (the oldest row with it). A row with that title that doesn't point at the
// bundled file was added by an admin — it's left alone in both modes.
const frontend = (frontendUrl || "http://localhost:3000").replace(/\/$/, "");
const guides = tally("prep guides");
for (const guide of GUIDE_CATALOGUE) {
  const data = {
    description: guide.description,
    fileUrl: `${frontend}/guides/${guide.file}`,
    skillId: guide.skill ? skillId(guide.skill) : null,
    role: guide.role ?? null,
    sizeLabel: guide.sizeLabel,
  };
  const existing = await prisma.prepPdf.findFirst({
    where: { title: guide.title },
    orderBy: { createdAt: "asc" },
  });
  if (existing && !existing.fileUrl.endsWith(`/guides/${guide.file}`)) {
    guides.unchanged++;
    continue;
  }
  await sync(
    guides,
    existing,
    () => prisma.prepPdf.create({ data: { title: guide.title, ...data } }),
    (id) => prisma.prepPdf.update({ where: { id }, data }),
    data,
  );
}

console.log(`Seed finished (${update ? "--update: refreshed changed rows" : "insert only"}):`);
for (const [name, { created, updated, unchanged }] of Object.entries(tallies)) {
  console.log(
    `  ${name.padEnd(20)} ${created} created, ${updated} updated, ${unchanged} unchanged`,
  );
}
if (!update) {
  console.log("Existing rows were left as they are; run with --update to refresh them.");
}
await prisma.$disconnect();
