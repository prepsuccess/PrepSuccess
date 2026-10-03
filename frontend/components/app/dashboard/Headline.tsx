import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import type { Dashboard } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";
import { DashCard, Pill } from "./DashCard";
import { PASS_MARK } from "./shared";

function Figure({
  direction,
  value,
  label,
  caption,
}: {
  direction: "up" | "down" | "flat";
  value: string;
  label: string;
  caption: string;
}) {
  const Icon = direction === "up" ? ArrowUp : direction === "down" ? ArrowDown : Minus;
  return (
    <div className="space-y-1.5">
      <p className="flex items-center gap-2">
        <Icon
          aria-hidden
          strokeWidth={2.5}
          className={cn(
            "size-7",
            direction === "up" && "text-dash-indigo",
            direction === "down" && "text-dash-coral-ink",
            direction === "flat" && "text-muted-foreground",
          )}
        />
        <span className="text-foreground text-4xl font-light tracking-tight tabular-nums">
          {value}
        </span>
        <span className="sr-only">{label}</span>
      </p>
      <p className="text-muted-foreground text-sm leading-snug">{caption}</p>
    </div>
  );
}

/** The two numbers that matter most, with the direction they're moving. */
export function Headline({ data, className }: { data: Dashboard; className?: string }) {
  const { readiness, counts } = data;
  const change = readiness.change;
  return (
    <DashCard
      title="Your standing"
      action={<Pill>Latest</Pill>}
      className={cn("[&>*:last-child]:mb-auto [&>header+*]:mt-auto", className)}
    >
      <Figure
        direction={change === null || change === 0 ? "flat" : change > 0 ? "up" : "down"}
        value={readiness.score === null ? "—" : String(readiness.score)}
        label="Readiness score out of 100"
        caption={
          readiness.score === null
            ? "Readiness out of 100 — appears after your first check"
            : change
              ? `Readiness out of 100, ${change > 0 ? "up" : "down"} ${Math.abs(change)} since your last check`
              : "Readiness out of 100"
        }
      />
      <hr className="border-dash-indigo-soft/60 my-5" />
      <Figure
        direction={counts.needs_revision > 0 ? "down" : "flat"}
        value={counts.checked ? String(counts.needs_revision) : "—"}
        label="Skills that need revision"
        caption={
          counts.checked
            ? `Skill${counts.needs_revision === 1 ? "" : "s"} below the ${PASS_MARK}% pass mark, of ${counts.checked} checked`
            : "Skills below the pass mark show here"
        }
      />
    </DashCard>
  );
}
