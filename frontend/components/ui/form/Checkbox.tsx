"use client";

import { useId, type InputHTMLAttributes, type ReactNode, type Ref } from "react";
import { cn } from "@/lib/utils/cn";

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "children"> & {
  label: ReactNode;
  error?: string;
  ref?: Ref<HTMLInputElement>;
};

export function Checkbox({ label, error, className, id: idProp, ...props }: CheckboxProps) {
  const generated = useId();
  const id = idProp ?? generated;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-text flex cursor-pointer items-start gap-3 text-[14px]">
        <input
          id={id}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="border-border-strong mt-0.5 h-[18px] w-[18px] flex-none cursor-pointer rounded-[5px] accent-[var(--color-heading)]"
          {...props}
        />
        <span>{label}</span>
      </label>
      {error ? (
        <p id={`${id}-error`} className="text-danger pl-[30px] text-[13px]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
