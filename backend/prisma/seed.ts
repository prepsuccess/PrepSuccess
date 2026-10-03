import { prisma } from "../src/db/prisma.js";
import { RESOURCE_CATALOGUE } from "../src/modules/resources/catalogue.js";
import { SKILL_CATALOGUE } from "../src/modules/skills/catalogue.js";
import { TASK_CATALOGUE } from "../src/modules/tasks/catalogue.js";

/**
 * Seeds the skill catalogue, learning resources and practical tasks:
 * `npm run db:seed`. Safe to re-run after editing the catalogues:
 *   - skills upsert by slug;
 *   - resources and tasks match on skill + title and are updated in place.
 * Nothing is deleted: skills, resources or tasks removed from a catalogue are
 * left alone (students may have used them) — deactivate them from the admin
 * panel instead. Rows an admin soft-deleted stay deleted.
 */

for (const { slug, name, category, topic, description } of SKILL_CATALOGUE) {
  await prisma.skill.upsert({
    where: { slug },
    create: { slug, name, category, topic, description },
    update: { name, category, topic, description },
  });
}

const skillIds = new Map(
  (await prisma.skill.findMany({ select: { id: true, slug: true } })).map((s) => [s.slug, s.id]),
);
const skillId = (slug: string) => {
  const id = skillIds.get(slug);
  if (!id) throw new Error(`Catalogue entry points at unknown skill "${slug}"`);
  return id;
};

let resources = 0;
for (const resource of RESOURCE_CATALOGUE) {
  const data = {
    skillId: skillId(resource.skill),
    title: resource.title,
    type: resource.type,
    url: resource.url ?? null,
    content: resource.content ?? null,
    source: resource.source,
  };
  const existing = await prisma.learningResource.findFirst({
    where: { skillId: data.skillId, title: data.title },
    select: { id: true },
  });
  if (existing) await prisma.learningResource.update({ where: { id: existing.id }, data });
  else await prisma.learningResource.create({ data });
  resources++;
}

let tasks = 0;
for (const task of TASK_CATALOGUE) {
  const data = {
    skillId: skillId(task.skill),
    title: task.title,
    description: task.description,
    difficulty: task.difficulty,
    evaluationCriteria: { criteria: task.rubric.map((c) => ({ ...c })) },
  };
  const existing = await prisma.practicalTask.findFirst({
    where: { skillId: data.skillId, title: data.title },
    select: { id: true },
  });
  if (existing) await prisma.practicalTask.update({ where: { id: existing.id }, data });
  else await prisma.practicalTask.create({ data });
  tasks++;
}

// eslint-disable-next-line no-console -- CLI output
console.log(
  `Seeded ${SKILL_CATALOGUE.length} skills, ${resources} learning resources and ${tasks} practical tasks.`,
);
await prisma.$disconnect();
