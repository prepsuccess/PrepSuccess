import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/** Shared look for every text-like control, so inputs, selects and textareas line up. */
export const controlClasses =
  "w-full rounded-[10px] border bg-surface px-3.5 text-[15px] text-heading transition-colors duration-300 placeholder:text-text-dim focus:border-heading focus:outline-none disabled:cursor-not-allowed disabled:bg-surface-3 disabled:text-text-dim";

export function controlStateClasses(invalid: boolean) {
  return invalid ? "border-danger" : "border-border-strong hover:border-text-dim";
}

/** Ids for the hint and error text, for `aria-describedby`. */
export function describedBy(id: string, hint?: string, error?: string) {
  return cn(hint && `${id}-hint`, error && `${id}-error`) || undefined;
}

export type FieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  /** Something to sit at the right of the label, e.g. a "Forgot password?" link. */
  action?: ReactNode;
  className?: string;
  children: ReactNode;
};

/** Label, control, then either the error or the hint underneath. */
export function Field({
  id,
  label,
  hint,
  error,
  required,
  action,
  className,
  children,
}: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-heading text-[14px] font-medium">
          {label}
          {required ? (
            <span aria-hidden className="text-text-dim ml-0.5">
              *
            </span>
          ) : null}
        </label>
        {action}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-danger text-[13px]">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-text-dim text-[13px]">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
