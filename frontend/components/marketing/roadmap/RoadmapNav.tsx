"use client";

import { useEffect, useState } from "react";
import type { RoadmapPhase } from "@/lib/content";
import { cn } from "@/lib/utils/cn";

/** A phase becomes current once its top passes this fraction of the viewport. */
const READING_LINE = 0.4;

/**
 * Sticky list of phases beside the reading column (desktop). The phase being
 * read is marked, so readers always know where they are in the roadmap.
 */
export function RoadmapNav({ phases }: { phases: RoadmapPhase[] }) {
  const [active, setActive] = useState(phases[0]?.id);

  useEffect(() => {
    const sections = phases
      .map((phase) => document.getElementById(phase.id))
      .filter((el): el is HTMLElement => el !== null);
    let frame = 0;

    const update = () => {
      frame = 0;
      const line = window.innerHeight * READING_LINE;
      const current = sections.filter((el) => el.getBoundingClientRect().top <= line).pop();
      setActive(current?.id ?? sections[0]?.id);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [phases]);

  return (
    <nav aria-label="Roadmap phases" className="sticky top-28">
      <p className="text-text text-[13px] font-medium">On this page</p>
      <ol className="border-border mt-3 border-l">
        {phases.map((phase) => {
          const current = phase.id === active;
          return (
            <li key={phase.id}>
              <a
                href={`#${phase.id}`}
                aria-current={current ? "location" : undefined}
                className={cn(
                  "-ml-px flex min-h-11 items-center gap-3 border-l-2 py-2 pl-4 text-[15px] transition-colors",
                  current
                    ? "border-heading text-heading font-medium"
                    : "text-text hover:text-heading border-transparent",
                )}
              >
                <span className="w-4 tabular-nums">{phase.phase}</span>
                {phase.title}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
