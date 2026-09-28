import type { ReactNode } from "react";

/** Title block at the top of every app and admin page. */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="border-border mb-8 flex flex-wrap items-end justify-between gap-6 border-b pb-6">
      <div className="max-w-[640px]">
        {eyebrow ? <p className="text-text-dim text-[12px] tabular-nums">{eyebrow}</p> : null}
        <h1 className="text-h4 mt-2">{title}</h1>
        {description ? <p className="mt-2 text-[15px]">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  );
}
