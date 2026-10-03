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

/** normalised stack name or alias (with and without "stack") → the stack. */
const STACK_INDEX = new Map<string, Stack>();
/** Single-word stack names ("mern") that also count inside a longer claim ("MERN developer"). */
const STACK_WORDS = new Map<string, Stack>();
for (const stack of STACKS) {
  for (const name of [stack.name, ...stack.aliases]) {
    const key = normalizeSkillName(name);
    STACK_INDEX.set(key, stack);
    STACK_INDEX.set(key.replace(/ stack$/, ""), stack);
    STACK_INDEX.set(`${key.replace(/ stack$/, "")} stack`, stack);
  }
  for (const alias of stack.aliases) if (!alias.includes(" ")) STACK_WORDS.set(alias, stack);
}

/** The stack a claim names ("MERN stack", "full stack developer"), if any. */
export function stackForClaim(claim: string): Stack | null {
  const key = normalizeSkillName(claim);
  const exact = STACK_INDEX.get(key);
  if (exact) return exact;
  for (const word of key.split(" ")) {
    const stack = STACK_WORDS.get(word);
    if (stack) return stack;
  }
  return null;
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
    const exactStack = STACK_INDEX.get(normalizeSkillName(claim));
    const slug = exactStack ? null : slugForClaim(claim);
    const stack = exactStack ?? (slug ? null : stackForClaim(claim));
    if (stack) stack.skills.forEach(add);
    else if (slug) add(slug);
    else unmatched.push(claim);
  }
  return { slugs, unmatched };
}
