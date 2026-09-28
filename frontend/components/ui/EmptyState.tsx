import type { ReactNode } from "react";
import { DrawScope, SketchIcon, type SketchName } from "@/components/ui/Annotation";
import { cn } from "@/lib/utils/cn";

/** A pencil doodle, a line of explanation and an optional next action. */
export function EmptyState({
  title,
  description,
  sketch = "box",
  action,
  className,
}: {
  title: string;
  description?: string;
  sketch?: SketchName;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <DrawScope
      className={cn(
        "border-border-strong bg-surface flex flex-col items-center rounded-[var(--radius-card-lg)] border border-dashed px-6 py-14 text-center",
        className,
      )}
    >
      <SketchIcon name={sketch} delay={0.1} className="text-accent h-12 w-12 -rotate-3" />
      <h2 className="text-h6 mt-5">{title}</h2>
      {description ? <p className="mt-2 max-w-[46ch] text-[15px]">{description}</p> : null}
      {action ? <div className="mt-7">{action}</div> : null}
    </DrawScope>
  );
}
