"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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

type Target = { id: string; name: string; inProgressId?: string | null };

/**
 * Starts (or resumes) a skill check and opens it. Writing a new check takes
 * the AI 10–30 seconds, so a dialog explains the wait and offers a retry if
 * it fails. Returns the trigger and the dialog to render.
 */
export function useStartCheck() {
  const router = useRouter();
  const [start, { isLoading }] = useStartAssessmentMutation();
  const [target, setTarget] = useState<Target | null>(null);
  const [error, setError] = useState<unknown>(null);

  async function run(skill: Target) {
    setTarget(skill);
    setError(null);
    try {
      const state = await start(skill.id).unwrap();
      setTarget(null);
      router.push(`/assessment/${state.id}`);
    } catch (failure) {
      setError(failure);
    }
  }

  function startCheck(skill: Target) {
    // An unfinished check opens straight away; no AI call needed.
    if (skill.inProgressId) return router.push(`/assessment/${skill.inProgressId}`);
    void run(skill);
  }

  const dialog = (
    <Dialog
      open={target !== null}
      onOpenChange={(open) => {
        if (!open && !isLoading) setTarget(null);
      }}
    >
      <DialogContent
        showCloseButton={!isLoading}
        onEscapeKeyDown={(event) => isLoading && event.preventDefault()}
        onPointerDownOutside={(event) => isLoading && event.preventDefault()}
      >
        {error ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CircleAlert className="text-destructive size-4" aria-hidden />
                Couldn&apos;t start the check
              </DialogTitle>
              <DialogDescription>{errorMessage(error)}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTarget(null)}>
                Close
              </Button>
              <Button onClick={() => target && void run(target)}>Try again</Button>
            </DialogFooter>
          </>
        ) : (
          <DialogHeader aria-live="polite">
            <DialogTitle className="flex items-center gap-2">
              <Spinner className="text-brand size-4" />
              Preparing your {target?.name} check
            </DialogTitle>
            <DialogDescription>
              Your AI coach is writing questions for you. This usually takes 10–30 seconds.
            </DialogDescription>
          </DialogHeader>
        )}
      </DialogContent>
    </Dialog>
  );

  return { startCheck, starting: isLoading, dialog };
}
