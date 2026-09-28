"use client";

import { useId, type InputHTMLAttributes, type ReactNode, type Ref } from "react";
import { cn } from "@/lib/utils/cn";
import { Field, controlClasses, controlStateClasses, describedBy } from "./Field";

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "children"> & {
  label: string;
  hint?: string;
  error?: string;
  action?: ReactNode;
  /** Content inside the right edge of the box, e.g. a show-password toggle. */
  trailing?: ReactNode;
  fieldClassName?: string;
  ref?: Ref<HTMLInputElement>;
};

export function Input({
  label,
  hint,
  error,
  action,
  trailing,
  fieldClassName,
  className,
  id: idProp,
  required,
  ...props
}: InputProps) {
  const generated = useId();
  const id = idProp ?? generated;

  return (
    <Field
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      action={action}
      className={fieldClassName}
    >
      <div className="relative">
        <input
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
          className={cn(
            controlClasses,
            controlStateClasses(Boolean(error)),
            "h-11",
            trailing ? "pr-12" : undefined,
            className,
          )}
          {...props}
        />
        {trailing ? (
          <div className="absolute inset-y-0 right-1.5 flex items-center">{trailing}</div>
        ) : null}
      </div>
    </Field>
  );
}
