import type { Dashboard } from "@/lib/api/types";

export type CategoryKey = Dashboard["readiness"]["categories"][number]["category"];

export const PASS_MARK = 40;

/** Indigo and coral, each with a soft tint — the dashboard's whole palette. */
export const PALETTE = {
  indigo: "var(--dash-indigo)",
  indigoSoft: "var(--dash-indigo-soft)",
  coral: "var(--dash-coral)",
  coralSoft: "var(--dash-coral-soft)",
} as const;

export const CATEGORY_META: Record<CategoryKey, { label: string; color: string }> = {
  technical: { label: "Technical", color: PALETTE.indigo },
  aptitude: { label: "Aptitude", color: PALETTE.coral },
  soft: { label: "Soft skills", color: PALETTE.indigoSoft },
};

/** Words for a readiness score, so the number never stands alone. */
export function readinessBand(score: number) {
  if (score >= 70) return "Placement ready";
  if (score >= PASS_MARK) return "Getting there";
  return "Just getting started";
}

export function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
