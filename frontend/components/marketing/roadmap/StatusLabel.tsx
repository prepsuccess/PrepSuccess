import { LineIcon } from "@/components/ui/LineIcon";
import type { RoadmapPhase, RoadmapStatus } from "@/lib/content";
import { cn } from "@/lib/utils/cn";

// Every status is icon + word, never colour alone.
const STATUS: Record<RoadmapStatus, { label: string; className: string }> = {
  ready: { label: "Ready", className: "text-success" },
  building: { label: "In progress", className: "text-accent-ink" },
  planned: { label: "Planned", className: "text-text" },
};

function StatusIcon({ status }: { status: RoadmapStatus }) {
  if (status === "ready") return <LineIcon name="check" className="h-4 w-4" />;
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="h-4 w-4">
      <circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {/* Half-filled for work in progress. */}
      {status === "building" ? <path d="M8 2.5a5.5 5.5 0 0 1 0 11z" fill="currentColor" /> : null}
    </svg>
  );
}

export function StatusLabel({ status, className }: { status: RoadmapStatus; className?: string }) {
  const { label, className: tone } = STATUS[status];
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 text-[14px] font-medium", tone, className)}
    >
      <StatusIcon status={status} />
      {label}
    </span>
  );
}

const STAGE: Record<RoadmapPhase["stage"], { label: string; className: string }> = {
  now: { label: "Now", className: "bg-heading text-white border-heading" },
  next: { label: "Next", className: "border-accent-ink text-accent-ink bg-surface" },
  later: { label: "Later", className: "border-border-strong text-text bg-surface" },
};

/** Now / Next / Later — the one thing a reader should get from a glance. */
export function StageBadge({ stage }: { stage: RoadmapPhase["stage"] }) {
  const { label, className } = STAGE[stage];
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-full border px-3 text-[13px] font-medium",
        className,
      )}
    >
      {label}
    </span>
  );
}
