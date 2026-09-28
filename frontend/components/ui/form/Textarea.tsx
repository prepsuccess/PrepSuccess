"use client";

import { useId, type Ref, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
import { Field, controlClasses, controlStateClasses, describedBy } from "./Field";

export type TextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "children"> & {
  label: string;
  hint?: string;
  error?: string;
  fieldClassName?: string;
  ref?: Ref<HTMLTextAreaElement>;
};

export function Textarea({
  label,
  hint,
  error,
  fieldClassName,
  className,
  id: idProp,
  required,
  rows = 4,
  ...props
}: TextareaProps) {
  const generated = useId();
  const id = idProp ?? generated;

  return (
    <Field
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={fieldClassName}
    >
      <textarea
        id={id}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(controlClasses, controlStateClasses(Boolean(error)), "py-3", className)}
        {...props}
      />
    </Field>
  );
}
