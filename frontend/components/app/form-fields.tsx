"use client";

import { useId, type ComponentProps } from "react";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/shadcn/field";
import { Input } from "@/components/shadcn/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import { Textarea } from "@/components/shadcn/textarea";

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

type TextareaFieldProps = Omit<ComponentProps<typeof Textarea>, "id"> & {
  id?: string;
  label: string;
  description?: string;
  error?: string;
};

/** Multiline version of TextField: same label, help and error wiring. */
export function TextareaField({
  id,
  label,
  description,
  error,
  required,
  ...props
}: TextareaFieldProps) {
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
      <Textarea
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

type SelectFieldProps = {
  id?: string;
  name?: string;
  label: string;
  options: { value: string; label: string }[];
  /** Shown in the box while nothing is chosen. */
  placeholder?: string;
  description?: string;
  error?: string;
  value: string;
  /** Same shape as an input's change event, so forms can share one handler. */
  onChange: (event: { target: { value: string } }) => void;
  disabled?: boolean;
  required?: boolean;
};

/** A styled dropdown (shadcn/Radix Select): the open list matches the app instead of the browser's. */
export function SelectField({
  id,
  name,
  label,
  options,
  placeholder,
  description,
  error,
  value,
  onChange,
  disabled,
  required,
}: SelectFieldProps) {
  const ids = useFieldIds(id, error, description);
  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={ids.inputId}>{label}</FieldLabel>
      <Select
        name={name}
        // An empty value shows the placeholder (kept a string, so the Select stays controlled).
        value={value}
        onValueChange={(next) => onChange({ target: { value: next } })}
        disabled={disabled}
        required={required}
      >
        <SelectTrigger
          id={ids.inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={ids.describedBy}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error ? (
        <FieldError id={ids.errorId}>{error}</FieldError>
      ) : description ? (
        <FieldDescription id={ids.descriptionId}>{description}</FieldDescription>
      ) : null}
    </Field>
  );
}
