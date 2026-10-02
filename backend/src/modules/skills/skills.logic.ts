import { SKILL_CATALOGUE } from "./catalogue.js";

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

/** Splits claims into catalogue slugs (deduplicated, in claim order) and the rest. */
export function matchClaims(claims: string[]) {
  const slugs: string[] = [];
  const unmatched: string[] = [];
  for (const claim of claims) {
    const slug = slugForClaim(claim);
    if (!slug) unmatched.push(claim);
    else if (!slugs.includes(slug)) slugs.push(slug);
  }
  return { slugs, unmatched };
}
