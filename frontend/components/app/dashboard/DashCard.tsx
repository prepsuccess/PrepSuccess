import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/** The card surface on its own, for tiles that don't use DashCard's header. */
export const CARD_SURFACE =
  "bg-card text-card-foreground flex min-w-0 flex-col rounded-2xl border p-5 shadow-xs";

/**
 * The dashboard's card: sits straight on the page with a thin border, like the
 * rest of the app. Title row on top, optional control on the right.
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
    <section aria-labelledby={headingId} className={cn(CARD_SURFACE, className)} {...props}>
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

/** A small read-only label, like "Updated 5 min ago". Never a fake control. */
export function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="text-muted-foreground shrink-0 rounded-full border px-3 py-1 text-xs">
      {children}
    </span>
  );
}
