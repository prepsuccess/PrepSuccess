"use client";

import { useState } from "react";
import { Input, type InputProps } from "./Input";

function EyeIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className="h-4 w-4">
      <path
        d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4" />
      {open ? null : (
        <path
          d="M2.5 13.5 13.5 2.5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

export function PasswordInput(props: Omit<InputProps, "type" | "trailing">) {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      {...props}
      type={visible ? "text" : "password"}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="text-text-dim hover:bg-surface-3 hover:text-heading grid h-8 w-8 place-items-center rounded-[8px] transition-colors"
        >
          <EyeIcon open={visible} />
        </button>
      }
    />
  );
}
