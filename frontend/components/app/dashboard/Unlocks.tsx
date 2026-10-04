import { Lock } from "lucide-react";
import { DashCard } from "./DashCard";

export type Unlock = { title: string; need: string };

/**
 * Stands in for the charts that have nothing to show yet, so a new student
 * sees one card saying what's coming instead of a page of empty boxes.
 */
export function Unlocks({ items, className }: { items: Unlock[]; className?: string }) {
  return (
    <DashCard
      title="More insights on the way"
      description="These unlock as you take skill checks"
      className={className}
    >
      {/* Two columns only when the card itself is wide enough, not the screen. */}
      <div className="@container">
        <ul className="grid gap-2.5 @md:grid-cols-2">
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
      </div>
    </DashCard>
  );
}
