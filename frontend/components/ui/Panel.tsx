import { type ReactNode } from "react";

/** Flat paper panel inset from the viewport edges; `flushTop` squares the top for the hero. */
export function Panel({
  children,
  flushTop = false,
  className = "",
}: {
  children: ReactNode;
  flushTop?: boolean;
  className?: string;
}) {
  const radius = flushTop
    ? "rounded-b-[var(--radius-panel)] border-t-0"
    : "rounded-[var(--radius-panel)]";
  return <div className={`panel mx-2 sm:mx-4 ${radius} ${className}`}>{children}</div>;
}
