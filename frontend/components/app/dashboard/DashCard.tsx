import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * The dashboard's card: white on the lavender canvas, large radius, a soft
 * shadow instead of a border. Title row on top, optional control on the right.
 */
export function DashCard({
  title,
  description,
  action,
  className,
  children,
  ...props
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
} & Omit<React.ComponentProps<"section">, "title">) {
  const headingId = title ? `dash-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` : undefined;
  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "bg-card text-card-foreground flex min-w-0 flex-col rounded-3xl p-5 shadow-[0_1px_2px_rgb(30_32_80/0.04),0_8px_24px_-12px_rgb(30_32_80/0.12)] dark:shadow-none dark:ring-1 dark:ring-white/5",
        className,
      )}
      {...props}
    >
      {title ? (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id={headingId} className="text-foreground text-[15px] font-semibold">
              {title}
            </h2>
            {description ? (
              <p className="text-muted-foreground mt-0.5 text-xs">{description}</p>
            ) : null}
          </div>
          {action}
        </header>
      ) : null}
      {children}
    </section>
  );
}

/** The rounded "Week ▾"-style pill from the reference, used for small read-only labels. */
export function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="text-muted-foreground shrink-0 rounded-full border px-3 py-1 text-xs">
      {children}
    </span>
  );
}
