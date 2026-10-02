import type { RoadmapPhase } from "@/lib/content";
import { cn } from "@/lib/utils/cn";
import { StageBadge } from "./StatusLabel";

/** All five phases in one row: the whole roadmap readable in a few seconds. */
export function RoadmapGlance({ phases }: { phases: RoadmapPhase[] }) {
  return (
    <nav aria-label="Roadmap at a glance" className="mt-12 lg:mt-16">
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {phases.map((phase) => (
          <li key={phase.id}>
            <a
              href={`#${phase.id}`}
              className={cn(
                "card card-hover focus-visible:outline-heading flex h-full min-h-11 flex-col gap-3 p-4 outline-offset-4 focus-visible:outline-2",
                phase.stage === "now" && "outline-heading outline-[1.5px] -outline-offset-[1.5px]",
              )}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-text text-[13px] tabular-nums">Phase {phase.phase}</span>
                <StageBadge stage={phase.stage} />
              </span>
              <span className="text-heading text-[16px] leading-snug font-semibold">
                {phase.title}
              </span>
              <span className="text-text mt-auto text-[13px]">{phase.timing}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
