import type { ReactNode } from "react";

/** Title block at the top of every app and admin page (shadcn typography). */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  /** Optional small label above the title; the breadcrumb usually covers this. */
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl space-y-1.5">
        {eyebrow ? <p className="text-muted-foreground text-sm">{eyebrow}</p> : null}
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? <p className="text-muted-foreground text-sm">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
