import { prisma } from "../src/db/prisma.js";
import { SKILL_CATALOGUE } from "../src/modules/skills/catalogue.js";

/**
 * Seeds the skill catalogue: `npm run db:seed`. Upserts by slug, so it's safe
 * to re-run after editing catalogue.ts; skills removed from the catalogue are
 * left alone (assessments may point at them) — deactivate them instead.
 */
for (const { slug, name, category, topic, description } of SKILL_CATALOGUE) {
  await prisma.skill.upsert({
    where: { slug },
    create: { slug, name, category, topic, description },
    update: { name, category, topic, description },
  });
}
// eslint-disable-next-line no-console -- CLI output
console.log(`Seeded ${SKILL_CATALOGUE.length} skills.`);
await prisma.$disconnect();
