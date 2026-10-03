"use client";

import { useId, useState } from "react";
import { Check, ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import type { SkillOptions } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";

/**
 * Pick-your-skills chips for the onboarding chat. Stacks first (one tap adds
 * "MERN stack"), then every catalogue skill by topic. What's picked is saved
 * exactly as picked — the student is in control, not the AI. Typing in the
 * chat still works for anything not listed.
 */
export function SkillPicker({
  options,
  disabled,
  onSubmit,
}: {
  options: SkillOptions;
  disabled: boolean;
  onSubmit: (skills: string[]) => void;
}) {
  const [picked, setPicked] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);
  const listId = useId();

  const toggle = (name: string) =>
    setPicked((current) =>
      current.includes(name) ? current.filter((n) => n !== name) : [...current, name],
    );

  const chip = (name: string, hint?: string) => {
    const on = picked.includes(name);
    return (
      <button
        key={name}
        type="button"
        aria-pressed={on}
        title={hint}
        disabled={disabled}
        onClick={() => toggle(name)}
        className={cn(
          "focus-visible:ring-ring/50 inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-sm transition-colors outline-none focus-visible:ring-3 disabled:opacity-60 motion-reduce:transition-none pointer-coarse:min-h-11",
          on
            ? "border-primary bg-primary text-primary-foreground"
            : "bg-card text-foreground hover:bg-muted border-border",
        )}
      >
        {on ? (
          <Check aria-hidden className="size-3.5" />
        ) : (
          <Plus aria-hidden className="size-3.5" />
        )}
        {name}
      </button>
    );
  };

  return (
    <section
      aria-labelledby={`${listId}-title`}
      className="bg-muted/40 space-y-3 rounded-xl border p-3 sm:p-4"
    >
      <div>
        <h3 id={`${listId}-title`} className="text-foreground text-sm font-semibold">
          Pick what you know
        </h3>
        <p className="text-muted-foreground text-xs">
          Tap a stack or any skills. You can also type your answer below.
        </p>
      </div>

      <div className="space-y-1.5">
        <p className="text-muted-foreground text-xs font-medium">Stacks</p>
        <div className="flex flex-wrap gap-2">
          {(options.stacks ?? []).map((stack) =>
            chip(stack.name, `Includes ${stack.skills.join(", ")}`),
          )}
        </div>
      </div>

      <button
        type="button"
        aria-expanded={showAll}
        aria-controls={listId}
        onClick={() => setShowAll((v) => !v)}
        className="text-foreground focus-visible:ring-ring/50 inline-flex min-h-9 items-center gap-1 rounded text-sm font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-3"
      >
        {showAll ? "Hide single skills" : "Choose single skills"}
        <ChevronDown
          aria-hidden
          className={cn(
            "size-4 transition-transform motion-reduce:transition-none",
            showAll && "rotate-180",
          )}
        />
      </button>
      {showAll ? (
        <div id={listId} className="max-h-64 space-y-3 overflow-y-auto pr-1">
          {(options.topics ?? []).map(({ topic, skills }) => (
            <div key={topic} className="space-y-1.5">
              <p className="text-muted-foreground text-xs font-medium">{topic}</p>
              <div className="flex flex-wrap gap-2">{skills.map((name) => chip(name))}</div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
        <p className="text-muted-foreground text-xs" aria-live="polite">
          {picked.length ? `${picked.length} selected` : "Nothing selected yet"}
        </p>
        <Button
          type="button"
          size="sm"
          disabled={!picked.length || disabled}
          onClick={() => {
            onSubmit(picked);
            setPicked([]);
          }}
        >
          Add {picked.length || ""} {picked.length === 1 ? "skill" : "skills"}
        </Button>
      </div>
    </section>
  );
}
