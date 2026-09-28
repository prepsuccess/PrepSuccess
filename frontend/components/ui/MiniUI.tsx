import { type ReactNode } from "react";

export function MiniWindow({
  title,
  meta,
  children,
  className = "",
}: {
  title: string;
  meta?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`border-border-strong bg-surface flex flex-col overflow-clip rounded-[10px] border ${className}`}
    >
      <div className="border-border flex items-center justify-between gap-3 border-b px-3.5 py-2.5">
        <span className="text-heading truncate text-[12px] font-medium">{title}</span>
        {meta ? (
          <span className="text-text-dim flex-none font-mono text-[10px] tracking-wide uppercase">
            {meta}
          </span>
        ) : null}
      </div>
      <div className="flex-1 p-3.5">{children}</div>
    </div>
  );
}

type Status = "mastered" | "revision" | "neutral";

/** Solid accent square = mastered, hollow square = needs revision. Replaces emoji ticks. */
export function StatusGlyph({ status }: { status: Exclude<Status, "neutral"> }) {
  return status === "mastered" ? (
    <span aria-hidden className="bg-accent inline-block h-[7px] w-[7px] flex-none" />
  ) : (
    <span aria-hidden className="border-heading/50 inline-block h-[7px] w-[7px] flex-none border" />
  );
}

const statusClasses: Record<Status, string> = {
  mastered: "border-heading/80 text-heading",
  revision: "border-dashed border-border-strong text-text",
  neutral: "border-border-strong bg-surface text-heading",
};

const statusLabel: Record<Status, string> = {
  mastered: "mastered",
  revision: "needs revision",
  neutral: "",
};

export function Chip({
  children,
  status = "neutral",
  className = "",
}: {
  children: ReactNode;
  status?: Status;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[6px] border px-2 py-1 text-[11px] font-medium whitespace-nowrap ${statusClasses[status]} ${className}`}
    >
      {status !== "neutral" ? <StatusGlyph status={status} /> : null}
      {children}
      {status !== "neutral" ? <span className="sr-only">({statusLabel[status]})</span> : null}
    </span>
  );
}

export function Bar({
  label,
  value,
  threshold = 40,
}: {
  label: string;
  value: number;
  threshold?: number;
}) {
  const below = value < threshold;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-text flex justify-between text-[11px]">
        <span>{label}</span>
        <span className="text-heading font-mono">{value}</span>
      </div>
      <div className="bg-surface-3 relative h-1.5">
        <div
          className={`h-full ${below ? "bg-heading/35" : "bg-heading"}`}
          style={{ width: `${value}%` }}
        />
        <span
          className="bg-accent absolute -top-0.5 h-2.5 w-px"
          style={{ left: `${threshold}%` }}
          aria-hidden
        />
      </div>
    </div>
  );
}

export function Line({ width = "100%", className = "" }: { width?: string; className?: string }) {
  return (
    <span className={`bg-surface-3 block h-1.5 rounded-full ${className}`} style={{ width }} />
  );
}

/** Small mono caps label used inside mock screens. */
export function MonoLabel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`text-text-dim font-mono text-[10px] tracking-[0.1em] uppercase ${className}`}>
      {children}
    </span>
  );
}
