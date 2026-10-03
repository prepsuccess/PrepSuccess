"use client";

import { CircleAlert, RotateCw, Sparkles } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Skeleton } from "@/components/shadcn/skeleton";
import { errorMessage } from "@/lib/api/errors";
import { useGetInsightQuery } from "@/lib/api/endpoints/dashboard";
import { cn } from "@/lib/utils/cn";
import { DashCard, Pill } from "./DashCard";

function updatedLabel(iso: string) {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

const TITLE = "Your coach's take";
const DESCRIPTION = "Written by AI from your results and target role";
const COLUMNS = "grid gap-4 lg:grid-cols-3";
const PANEL = "bg-dash-canvas/60 space-y-2 rounded-2xl p-4";

function TitleIcon() {
  return (
    <span className="bg-dash-indigo/12 text-dash-indigo flex size-9 shrink-0 items-center justify-center rounded-xl">
      <Sparkles className="size-4" aria-hidden />
    </span>
  );
}

/** Same three panels as the real card, so nothing jumps when it loads. */
export function CoachInsightSkeleton({
  message,
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <DashCard title={TITLE} description={DESCRIPTION} className={className} aria-busy>
      {message ? <p className="text-muted-foreground mb-3 text-sm">{message}</p> : null}
      <div className={COLUMNS}>
        {[0, 1, 2].map((col) => (
          <div key={col} className={PANEL}>
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-11/12" />
            <Skeleton className="h-3.5 w-4/5" />
          </div>
        ))}
      </div>
    </DashCard>
  );
}

/**
 * The AI read of the student's results (GET /ai/insight). Loads separately
 * from the dashboard numbers, so a slow or failed AI call never blocks them.
 * Hidden until the first check is finished — there's nothing to read yet.
 */
export function CoachInsight({ className }: { className?: string }) {
  const query = useGetInsightQuery();

  if (query.isLoading || (query.isFetching && !query.data)) {
    return (
      <CoachInsightSkeleton message="Your coach is reading your results…" className={className} />
    );
  }

  if (query.isError || !query.data) {
    return (
      <DashCard title={TITLE} description={DESCRIPTION} className={className}>
        <div role="alert" className="flex items-start gap-3 text-sm">
          <CircleAlert className="text-destructive mt-0.5 size-4 shrink-0" aria-hidden />
          <div className="space-y-2">
            <p className="text-foreground">Couldn&apos;t get your coach&apos;s take.</p>
            <p className="text-muted-foreground">{errorMessage(query.error)}</p>
            <Button
              size="sm"
              variant="outline"
              className="rounded-full"
              onClick={() => void query.refetch()}
            >
              <RotateCw />
              Try again
            </Button>
          </div>
        </div>
      </DashCard>
    );
  }

  const insight = query.data;
  if (insight.status === "empty") return null;

  return (
    <DashCard
      title={TITLE}
      description={DESCRIPTION}
      action={
        insight.generated_at ? (
          <Pill>Updated {updatedLabel(insight.generated_at)}</Pill>
        ) : (
          <TitleIcon />
        )
      }
      className={cn(query.isFetching && "opacity-70 transition-opacity", className)}
    >
      <div className={COLUMNS}>
        <section aria-labelledby="coach-summary" className={PANEL}>
          <h3 id="coach-summary" className="text-dash-indigo text-sm font-semibold">
            Where you stand
          </h3>
          <p className="text-foreground/85 text-sm leading-relaxed">{insight.summary}</p>
        </section>

        <section aria-labelledby="coach-gaps" className={PANEL}>
          <h3 id="coach-gaps" className="text-dash-coral-ink text-sm font-semibold">
            What to work on
          </h3>
          {insight.gaps.length ? (
            <ul className="space-y-3">
              {insight.gaps.map((gap) => (
                <li key={gap.skill_id} className="text-sm">
                  <p className="text-foreground font-medium">{gap.name}</p>
                  <p className="text-muted-foreground mt-0.5">{gap.why}</p>
                  <p className="text-muted-foreground mt-1">
                    <span className="text-foreground font-medium">Try: </span>
                    {gap.how}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">
              Nothing below the pass mark — keep checking new skills.
            </p>
          )}
        </section>

        <section aria-labelledby="coach-plan" className={PANEL}>
          <h3 id="coach-plan" className="text-dash-indigo text-sm font-semibold">
            This week
          </h3>
          <ol className="space-y-3">
            {insight.plan.map((step, index) => (
              <li key={step.title} className="flex gap-3 text-sm">
                <span
                  aria-hidden
                  className="bg-dash-indigo flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                >
                  {index + 1}
                </span>
                <div>
                  <p className="text-foreground font-medium">{step.title}</p>
                  <p className="text-muted-foreground">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </DashCard>
  );
}
