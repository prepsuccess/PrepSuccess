import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Calculator,
  ListChecks,
  MessageCircle,
  NotebookPen,
  PlayCircle,
} from "lucide-react";
import type { NextStep } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";
import { DashCard } from "./DashCard";

const KIND: Record<NextStep["kind"], { icon: LucideIcon; chip: string }> = {
  onboarding: { icon: MessageCircle, chip: "bg-dash-indigo/12 text-dash-indigo" },
  resume: { icon: PlayCircle, chip: "bg-dash-indigo/12 text-dash-indigo" },
  revise: { icon: NotebookPen, chip: "bg-dash-coral/15 text-dash-coral-ink" },
  check: { icon: ListChecks, chip: "bg-dash-indigo/12 text-dash-indigo" },
  aptitude: { icon: Calculator, chip: "bg-dash-coral/15 text-dash-coral-ink" },
};

/** Rule-based actions, most important first; each opens the page that does it. */
export function NextSteps({ steps, className }: { steps: NextStep[]; className?: string }) {
  return (
    <DashCard title="Next steps" description="Most important first" className={className}>
      {steps.length ? (
        <ol className="space-y-2.5">
          {steps.map((step) => {
            const { icon: Icon, chip } = KIND[step.kind];
            return (
              <li key={step.id}>
                <Link
                  href={step.href}
                  className="group bg-dash-canvas/60 hover:bg-dash-canvas flex min-h-14 items-center gap-3 rounded-2xl p-3 transition-colors"
                >
                  <span
                    aria-hidden
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-xl",
                      chip,
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="text-foreground block text-sm font-medium">{step.title}</span>
                    <span className="text-muted-foreground line-clamp-2 block text-xs leading-snug">
                      {step.detail}
                    </span>
                  </span>
                  <ArrowRight
                    aria-hidden
                    className="text-muted-foreground group-hover:text-foreground size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="text-muted-foreground text-sm">
          You&apos;re all caught up. Retake a check any time to track your progress.
        </p>
      )}
    </DashCard>
  );
}
