import { type ReactNode } from "react";
import { FocusReveal } from "@/components/motion/FocusReveal";

/**
 * Paper frame that holds a product preview. The window sits slightly low and
 * lifts when the surrounding `.group` card is hovered.
 */
export function PreviewFrame({
  children,
  tag,
  aspect = "aspect-[524/317]",
  className = "",
}: {
  children: ReactNode;
  tag?: string;
  aspect?: string;
  className?: string;
}) {
  return (
    <div
      className={`bg-surface-3 relative overflow-clip rounded-[10px] px-5 pt-10 sm:px-8 ${aspect} ${className}`}
    >
      {tag ? (
        <span className="text-text-dim absolute top-3.5 left-5 font-mono text-[10px] tracking-[0.12em] uppercase sm:left-8">
          {tag}
        </span>
      ) : null}
      <div className="h-[calc(100%+12px)] transition-transform duration-700 ease-[var(--ease-out-cubic)] group-hover:-translate-y-2">
        {children}
      </div>
      <FocusReveal />
    </div>
  );
}
