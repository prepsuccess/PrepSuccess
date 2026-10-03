/* eslint-disable no-console -- CLI output */
import { prisma } from "../src/db/prisma.js";
import { LEVEL_TARGET, LEVELS } from "../src/modules/assessment/assessment.logic.js";
import { topUpBank } from "../src/modules/assessment/bank.service.js";

/**
 * Fills each skill's question bank up to 100 questions ahead of time, so
 * students' checks never wait on the AI:
 *
 *   npm run questions:generate -- --as admin@college.edu            # every skill
 *   npm run questions:generate -- --as admin@college.edu --skill sql
 *
 * Without it the bank still fills itself as students take checks. `--as` is
 * an admin account the AI usage is recorded against; this job skips the
 * per-student daily limit. About 5 AI calls per skill; safe to stop and re-run.
 */
const args = process.argv.slice(2);
const flag = (name: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};

const email = flag("as")?.trim().toLowerCase();
const only = flag("skill");
if (!email) {
  console.error("Usage: npm run questions:generate -- --as <admin email> [--skill <slug>]");
  process.exit(1);
}

const admin = await prisma.user.findUnique({ where: { email } });
if (!admin || admin.role !== "ADMIN") {
  console.error(`${email} isn't an admin. Promote it first: npm run admin:promote -- ${email}`);
  await prisma.$disconnect();
  process.exit(1);
}

const skills = await prisma.skill.findMany({
  where: { isActive: true, isDeleted: false, ...(only ? { slug: only } : {}) },
  orderBy: { name: "asc" },
});
if (!skills.length) console.error(only ? `No active skill "${only}".` : "No active skills.");

const MAX_CALLS_PER_SKILL = 8;
let failures = 0;

for (const skill of skills) {
  for (let call = 0; call < MAX_CALLS_PER_SKILL; call++) {
    const counts = await prisma.checkQuestion.groupBy({
      by: ["difficulty"],
      where: { skillId: skill.id, isDeleted: false },
      _count: { _all: true },
    });
    const have = (level: (typeof LEVELS)[number]) =>
      counts.find((c) => c.difficulty === level)?._count._all ?? 0;
    const levels = LEVELS.filter((level) => have(level) < LEVEL_TARGET[level]);
    const total = LEVELS.reduce((sum, level) => sum + have(level), 0);
    if (!levels.length) {
      console.log(`✓ ${skill.name}: ${total} questions`);
      break;
    }
    try {
      const added = await topUpBank(skill, levels, admin.id, { system: true });
      console.log(`  ${skill.name}: +${added} (now ${total + added})`);
      if (!added) break;
    } catch (error) {
      failures++;
      console.error(`✗ ${skill.name}: ${error instanceof Error ? error.message : error}`);
      break;
    }
  }
}

await prisma.$disconnect();
if (failures) {
  console.error(`${failures} skill(s) failed — re-run to continue where it stopped.`);
  process.exit(1);
}
