import { SKILL_CATALOGUE } from "./catalogue.js";
import { STACKS, type Stack } from "./stacks.js";

/**
 * Matches what students typed in the onboarding chat ("DSA basics", "React.js",
 * "a little SQL") to catalogue skills. Pure and deterministic: no AI guessing,
 * so a student is never shown a skill they didn't claim.
 */

// Words that qualify a skill rather than name it.
const FILLER = new Set([
  "basic",
  "basics",
  "beginner",
  "intermediate",
  "advanced",
  "fundamentals",
  "fundamental",
  "concepts",
  "some",
  "little",
  "a",
  "bit",
  "of",
  "knowledge",
  "programming",
  "language",
  "skills",
]);

/** Lowercase, keep + and # (C++, C#), drop punctuation and filler words. */
export function normalizeSkillName(value: string) {
  const words = value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\.js\b/g, " js")
    .replace(/[^a-z0-9+#\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const kept = words.filter((word) => !FILLER.has(word));
  // "Programming" alone (or "C programming") must still mean something.
  return (kept.length ? kept : words).join(" ");
}

/** normalised alias → catalogue slug. */
const ALIAS_INDEX = new Map<string, string>();
for (const skill of SKILL_CATALOGUE) {
  for (const name of [skill.name, skill.slug, ...skill.aliases]) {
    const key = normalizeSkillName(name);
    if (key && !ALIAS_INDEX.has(key)) ALIAS_INDEX.set(key, skill.slug);
  }
}

export function slugForClaim(claim: string): string | null {
  return ALIAS_INDEX.get(normalizeSkillName(claim)) ?? null;
}

/**
 * A normalised claim without a trailing "stack" / "developer" /
 * "development" ("mern stack developer" → "mern"), so the ways students
 * dress up a stack name all land on the same key.
 */
function stackCore(key: string) {
  return key.replace(/(?: stack)?(?: (?:developer|development))?$/, "") || key;
}

/** normalised stack name or alias, and its core → the stack. */
const STACK_INDEX = new Map<string, Stack>();
for (const stack of STACKS) {
  for (const name of [stack.name, ...stack.aliases]) {
    const key = normalizeSkillName(name);
    STACK_INDEX.set(key, stack);
    if (!STACK_INDEX.has(stackCore(key))) STACK_INDEX.set(stackCore(key), stack);
  }
}

/**
 * Stack names distinctive enough to count inside a longer claim ("Built a
 * MERN app"). Plain words like "mean", "backend" or "full stack" are not:
 * "Statistics (mean, median)" must not claim the MEAN stack.
 */
const DISTINCTIVE = ["mern", "mevn", "pern", "mean stack"];

/** The stack a whole claim names ("MERN stack", "Frontend developer"), if any. */
function exactStack(claim: string): Stack | null {
  const key = normalizeSkillName(claim);
  return STACK_INDEX.get(key) ?? STACK_INDEX.get(stackCore(key)) ?? null;
}

/** The stack a claim names ("MERN stack", "full stack developer", "MERN projects"), if any. */
export function stackForClaim(claim: string): Stack | null {
  const exact = exactStack(claim);
  if (exact) return exact;
  const padded = ` ${normalizeSkillName(claim)} `;
  const phrase = DISTINCTIVE.find((p) => padded.includes(` ${p} `));
  return phrase ? (STACK_INDEX.get(phrase) ?? null) : null;
}

/**
 * Splits claims into catalogue slugs (deduplicated, in claim order) and the
 * rest. A stack expands to all its skills; an exact stack name wins over a
 * single-skill alias, so picking "Data analytics" brings the whole set.
 */
export function matchClaims(claims: string[]) {
  const slugs: string[] = [];
  const unmatched: string[] = [];
  const add = (slug: string) => {
    if (!slugs.includes(slug)) slugs.push(slug);
  };
  for (const claim of claims) {
    const whole = exactStack(claim);
    const slug = whole ? null : slugForClaim(claim);
    const stack = whole ?? (slug ? null : stackForClaim(claim));
    if (stack) stack.skills.forEach(add);
    else if (slug) add(slug);
    else unmatched.push(claim);
  }
  return { slugs, unmatched };
}
