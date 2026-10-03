import type { Dashboard } from "@/lib/api/types";
import { DashCard } from "./DashCard";
import { CATEGORY_META, PALETTE } from "./shared";

/** One labelled bar per category, like the reference's progress list. */
export function CategoryBars({ readiness }: { readiness: Dashboard["readiness"] }) {
  return (
    <DashCard title="By category" description="Average of your latest scores">
      <ul className="space-y-4">
        {readiness.categories.map((c) => {
          const { label, color } = CATEGORY_META[c.category];
          return (
            <li key={c.category} className="space-y-1.5">
              {/* Label above the bar, the same as Skill scores. */}
              <div className="flex justify-between text-xs">
                <span className="text-foreground font-medium">
                  {label}{" "}
                  <span className="text-muted-foreground font-normal">
                    · weight {readiness.weights[c.category]}%
                  </span>
                </span>
                <span className="text-foreground font-semibold tabular-nums">
                  {c.score === null ? "Not checked" : `${c.score}%`}
                </span>
              </div>
              <div
                role="meter"
                aria-label={`${label} score`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={c.score ?? undefined}
                aria-valuetext={c.score === null ? "Not checked yet" : `${c.score}%`}
                className="bg-dash-indigo-soft/35 h-2.5 overflow-hidden rounded-full"
              >
                <div
                  className="h-full rounded-full transition-[width] duration-700"
                  style={{ width: `${c.score ?? 0}%`, background: color }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </DashCard>
  );
}

/** Mastered / needs revision / not checked yet, as one segmented bar with a legend. */
export function CoverageBar({ counts }: { counts: Dashboard["counts"] }) {
  const unchecked = Math.max(counts.claimed - counts.claimed_checked, 0);
  const segments = [
    { label: "Mastered", value: counts.mastered, color: PALETTE.indigo },
    { label: "Needs revision", value: counts.needs_revision, color: PALETTE.coral },
    { label: "Not checked yet", value: unchecked, color: PALETTE.indigoSoft },
  ];
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  return (
    <DashCard title="Your skills" description={total ? `${total} in total` : "None yet"}>
      <div
        role="img"
        aria-label={segments.map((s) => `${s.label}: ${s.value}`).join(", ")}
        className="bg-muted flex h-3 gap-1 overflow-hidden rounded-full"
      >
        {total
          ? segments
              .filter((s) => s.value > 0)
              .map((s) => (
                <span
                  key={s.label}
                  className="h-full rounded-full"
                  style={{ width: `${(s.value / total) * 100}%`, background: s.color }}
                />
              ))
          : null}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {segments.map((s) => (
          <li key={s.label} className="text-muted-foreground flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm" style={{ background: s.color }} aria-hidden />
            {s.label}
            <span className="text-foreground font-medium tabular-nums">{s.value}</span>
          </li>
        ))}
      </ul>
    </DashCard>
  );
}
