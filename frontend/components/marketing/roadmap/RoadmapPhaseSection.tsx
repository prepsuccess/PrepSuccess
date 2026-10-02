import type { RoadmapPhase } from "@/lib/content";
import { StageBadge, StatusLabel } from "./StatusLabel";

/** One phase, written to be read: what it is, why, what's in it, and what it builds on. */
export function RoadmapPhaseSection({ phase }: { phase: RoadmapPhase }) {
  const headingId = `${phase.id}-title`;
  return (
    <article
      id={phase.id}
      aria-labelledby={headingId}
      className="border-border max-w-[720px] scroll-mt-28 border-t py-12 first:border-t-0 first:pt-0 lg:py-14"
    >
      <div className="flex flex-wrap items-center gap-3">
        <StageBadge stage={phase.stage} />
        <span className="text-text text-[14px]">
          Phase {phase.phase} · {phase.timing}
        </span>
      </div>

      <h2
        id={headingId}
        className="text-heading mt-4 text-[clamp(1.75rem,1.45rem+1.1vw,2.25rem)] leading-[1.15] font-semibold tracking-[-0.025em]"
      >
        {phase.title}
      </h2>
      <p className="text-text mt-4 max-w-[62ch] text-[17px] leading-[1.65]">{phase.why}</p>

      <h3 className="text-heading mt-8 text-[14px] font-semibold">What&apos;s included</h3>
      <ul className="border-border divide-border mt-3 max-w-[640px] divide-y border-y">
        {phase.features.map((feature) => (
          <li key={feature.label} className="flex items-center justify-between gap-6 py-3">
            <span className="text-heading text-[16px]">{feature.label}</span>
            <StatusLabel status={feature.status} className="flex-none" />
          </li>
        ))}
      </ul>

      {phase.buildsOn ? (
        <p className="bg-surface-3 text-text mt-6 max-w-[640px] rounded-[10px] px-4 py-3.5 text-[15px] leading-[1.6]">
          <span className="text-heading font-medium">How it connects: </span>
          {phase.buildsOn}
        </p>
      ) : null}
    </article>
  );
}
