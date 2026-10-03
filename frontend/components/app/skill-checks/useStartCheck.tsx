"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { CircleAlert } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/dialog";
import { Spinner } from "@/components/ui/Spinner";
import { errorMessage } from "@/lib/api/errors";
import { useStartAssessmentMutation } from "@/lib/api/endpoints/skills";
import { cn } from "@/lib/utils/cn";

type Target = { id: string; name: string; inProgressId?: string | null };

/** Check lengths a student can pick; 10 is the minimum (the API enforces 10-30). */
export const QUESTION_COUNTS = [10, 15, 20, 25, 30] as const;
const DEFAULT_COUNT = 10;
/** About a minute per question, rounded — shown so the choice is informed. */
const minutesFor = (count: number) => `~${count} min`;

/**
 * Starts (or resumes) a skill check. A new check first asks how many
 * questions (10-30), then shows a short wait while the questions are
 * gathered — usually instant from the question bank, up to a minute if the
 * AI has to write new ones — and offers a retry if it fails. Returns the
 * trigger and the dialog to render.
 */
export function useStartCheck() {
  const router = useRouter();
  const [start, { isLoading }] = useStartAssessmentMutation();
  const [target, setTarget] = useState<Target | null>(null);
  const [count, setCount] = useState<number>(DEFAULT_COUNT);
  const [phase, setPhase] = useState<"choose" | "starting" | "error">("choose");
  const [error, setError] = useState<unknown>(null);
  const groupId = useId();

  async function run(skill: Target, questionCount: number) {
    setPhase("starting");
    setError(null);
    try {
      const state = await start({ skillId: skill.id, questionCount }).unwrap();
      setTarget(null);
      router.push(`/assessment/${state.id}`);
    } catch (failure) {
      setError(failure);
      setPhase("error");
    }
  }

  function startCheck(skill: Target) {
    // An unfinished check opens straight away; its length was chosen already.
    if (skill.inProgressId) return router.push(`/assessment/${skill.inProgressId}`);
    setTarget(skill);
    setCount(DEFAULT_COUNT);
    setPhase("choose");
    setError(null);
  }

  const busy = isLoading || phase === "starting";

  const dialog = (
    <Dialog
      open={target !== null}
      onOpenChange={(open) => {
        if (!open && !busy) setTarget(null);
      }}
    >
      <DialogContent
        showCloseButton={!busy}
        onEscapeKeyDown={(event) => busy && event.preventDefault()}
        onPointerDownOutside={(event) => busy && event.preventDefault()}
      >
        {phase === "choose" ? (
          <>
            <DialogHeader>
              <DialogTitle>How many questions?</DialogTitle>
              <DialogDescription>
                {target?.name}: more questions give a more accurate score. They get harder when
                you&apos;re right and easier when you&apos;re not.
              </DialogDescription>
            </DialogHeader>
            <div
              role="radiogroup"
              aria-labelledby={`${groupId}-label`}
              className="grid grid-cols-3 gap-2 sm:grid-cols-5"
            >
              <span id={`${groupId}-label`} className="sr-only">
                Number of questions
              </span>
              {QUESTION_COUNTS.map((n) => {
                const on = count === n;
                return (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setCount(n)}
                    className={cn(
                      "focus-visible:ring-ring/50 flex min-h-16 flex-col items-center justify-center rounded-xl border px-2 py-2 transition-colors outline-none focus-visible:ring-3 motion-reduce:transition-none",
                      on
                        ? "border-primary bg-primary text-primary-foreground"
                        : "bg-card text-foreground hover:bg-muted",
                    )}
                  >
                    <span className="text-lg font-semibold tabular-nums">{n}</span>
                    <span
                      className={cn(
                        "text-xs",
                        on ? "text-primary-foreground/80" : "text-muted-foreground",
                      )}
                    >
                      {minutesFor(n)}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-muted-foreground text-xs">
              10 is the minimum. You can&apos;t change the length once you start.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTarget(null)}>
                Cancel
              </Button>
              <Button onClick={() => target && void run(target, count)}>
                Start {count} questions
              </Button>
            </DialogFooter>
          </>
        ) : phase === "error" ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CircleAlert className="text-destructive size-4" aria-hidden />
                Couldn&apos;t start the check
              </DialogTitle>
              <DialogDescription>{errorMessage(error)}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPhase("choose")}>
                Change length
              </Button>
              <Button onClick={() => target && void run(target, count)}>Try again</Button>
            </DialogFooter>
          </>
        ) : (
          <DialogHeader aria-live="polite">
            <DialogTitle className="flex items-center gap-2">
              <Spinner className="text-brand size-4" />
              Preparing your {target?.name} check
            </DialogTitle>
            <DialogDescription>
              Picking {count} questions for you. If the AI needs to write new ones, this can take up
              to a minute.
            </DialogDescription>
          </DialogHeader>
        )}
      </DialogContent>
    </Dialog>
  );

  return { startCheck, starting: busy, dialog };
}
