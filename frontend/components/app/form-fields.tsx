"use client";

import { useId, type ComponentProps } from "react";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/shadcn/field";
import { Input } from "@/components/shadcn/input";
import { NativeSelect, NativeSelectOption } from "@/components/shadcn/native-select";

/**
 * shadcn Field wiring for the app's forms: a visible label tied to the control,
 * help or error text linked through aria-describedby, and aria-invalid on
 * error — so every field is announced correctly without repeating the plumbing.
 */
function useFieldIds(
  id: string | undefined,
  error: string | undefined,
  description: string | undefined,
) {
  const generated = useId();
  const inputId = id ?? generated;
  const errorId = `${inputId}-error`;
  const descriptionId = `${inputId}-description`;
  return {
    inputId,
    errorId,
    descriptionId,
    describedBy: error ? errorId : description ? descriptionId : undefined,
  };
}

type TextFieldProps = Omit<ComponentProps<typeof Input>, "id"> & {
  id?: string;
  label: string;
  description?: string;
  error?: string;
};

export function TextField({ id, label, description, error, required, ...props }: TextFieldProps) {
  const ids = useFieldIds(id, error, description);
  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={ids.inputId}>
        {label}
        {required ? (
          <span className="text-destructive" aria-hidden>
            *
          </span>
        ) : null}
      </FieldLabel>
      <Input
        id={ids.inputId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={ids.describedBy}
        {...props}
      />
      {error ? (
        <FieldError id={ids.errorId}>{error}</FieldError>
      ) : description ? (
        <FieldDescription id={ids.descriptionId}>{description}</FieldDescription>
      ) : null}
    </Field>
  );
}

type SelectFieldProps = Omit<ComponentProps<typeof NativeSelect>, "id"> & {
  id?: string;
  label: string;
  options: { value: string; label: string }[];
  /** Shown as a disabled first option while nothing is chosen. */
  placeholder?: string;
  description?: string;
  error?: string;
};

/** A native <select> in shadcn styling: the platform picker on phones, and keyboard-friendly. */
export function SelectField({
  id,
  label,
  options,
  placeholder,
  description,
  error,
  ...props
}: SelectFieldProps) {
  const ids = useFieldIds(id, error, description);
  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={ids.inputId}>{label}</FieldLabel>
      <NativeSelect
        id={ids.inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={ids.describedBy}
        {...props}
      >
        {placeholder ? (
          <NativeSelectOption value="" disabled>
            {placeholder}
          </NativeSelectOption>
        ) : null}
        {options.map((option) => (
          <NativeSelectOption key={option.value} value={option.value}>
            {option.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      {error ? (
        <FieldError id={ids.errorId}>{error}</FieldError>
      ) : description ? (
        <FieldDescription id={ids.descriptionId}>{description}</FieldDescription>
      ) : null}
    </Field>
  );
}
