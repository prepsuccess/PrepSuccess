"use client";

import { useId, type Ref, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
import { LineIcon } from "@/components/ui/LineIcon";
import { Field, controlClasses, controlStateClasses, describedBy } from "./Field";

export type SelectOption = { value: string; label: string };

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> & {
  label: string;
  options: SelectOption[];
  /** Shown as a disabled first option when nothing is chosen yet. */
  placeholder?: string;
  hint?: string;
  error?: string;
  fieldClassName?: string;
  ref?: Ref<HTMLSelectElement>;
};

export function Select({
  label,
  options,
  placeholder,
  hint,
  error,
  fieldClassName,
  className,
  id: idProp,
  required,
  ...props
}: SelectProps) {
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
      <div className="relative">
        <select
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
          className={cn(
            controlClasses,
            controlStateClasses(Boolean(error)),
            "h-11 appearance-none pr-10",
            className,
          )}
          {...props}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <LineIcon
          name="chevron"
          className="text-text-dim pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2"
        />
      </div>
    </Field>
  );
}
