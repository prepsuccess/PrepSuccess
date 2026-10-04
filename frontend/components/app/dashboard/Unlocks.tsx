import { Lock } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { DashCard } from "./DashCard";

export type Unlock = { title: string; need: string };

/**
 * Stands in for the charts that have nothing to show yet, so a new student
 * sees one card saying what's coming instead of a page of empty boxes. Sized
 * to its list, never stretched to a taller card beside it.
 */
export function Unlocks({ items, className }: { items: Unlock[]; className?: string }) {
  return (
    <DashCard
      title="More insights on the way"
      description="These unlock as you take skill checks"
      className={cn("self-start", className)}
    >
      <ul className="grid gap-2.5 sm:grid-cols-2">
        {items.map((item) => (
          <li
            key={item.title}
            className="bg-dash-canvas/60 flex items-start gap-3 rounded-2xl p-3 text-sm"
          >
            <span
              aria-hidden
              className="bg-dash-indigo/12 text-dash-indigo flex size-8 shrink-0 items-center justify-center rounded-xl"
            >
              <Lock className="size-3.5" />
            </span>
            <span className="min-w-0">
              <span className="text-foreground block font-medium">{item.title}</span>
              <span className="text-muted-foreground block text-xs">{item.need}</span>
            </span>
          </li>
        ))}
      </ul>
    </DashCard>
  );
}
