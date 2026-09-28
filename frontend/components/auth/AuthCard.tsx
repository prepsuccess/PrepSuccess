import type { CSSProperties, ReactNode } from "react";

/** The paper card every auth screen sits on: marker eyebrow, headline, then the form. */
export function AuthCard({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative w-full max-w-[460px]">
      <span
        aria-hidden
        className="bg-accent/20 absolute -top-3 left-1/2 z-10 h-7 w-28 -translate-x-1/2 -rotate-2"
      />
      <div className="card px-6 py-9 sm:px-10 sm:py-11">
        <p
          className="ink now font-marker text-accent -rotate-2 text-[16px] tracking-wide uppercase"
          style={{ "--d": "0.1s" } as CSSProperties}
        >
          {eyebrow}
        </p>
        <h1 className="text-h4 mt-3">{title}</h1>
        {description ? <p className="mt-3 text-[15px]">{description}</p> : null}
        <div className="mt-8">{children}</div>
      </div>
      {footer ? <div className="mt-6 text-center text-[14px]">{footer}</div> : null}
    </div>
  );
}
