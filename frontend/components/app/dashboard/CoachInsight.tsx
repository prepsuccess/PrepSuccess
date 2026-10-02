"use client";

import { CircleAlert, RotateCw, Sparkles } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/card";
import { Skeleton } from "@/components/shadcn/skeleton";
import { errorMessage } from "@/lib/api/errors";
import { useGetInsightQuery } from "@/lib/api/endpoints/dashboard";
import { cn } from "@/lib/utils/cn";

function updatedLabel(iso: string) {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function Header() {
  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Sparkles className="text-brand size-4" aria-hidden />
        Your coach&apos;s take
      </CardTitle>
      <CardDescription>Written by AI from your results and target role.</CardDescription>
    </CardHeader>
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
      <Card className={className} aria-busy>
        <Header />
        <CardContent className="space-y-3">
          <p className="text-muted-foreground text-sm">Your coach is reading your results…</p>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  if (query.isError || !query.data) {
    return (
      <Card className={className}>
        <Header />
        <CardContent>
          <div role="alert" className="flex items-start gap-2 text-sm">
            <CircleAlert className="text-destructive mt-0.5 size-4 shrink-0" aria-hidden />
            <div className="space-y-2">
              <p className="text-foreground">Couldn&apos;t get your coach&apos;s take.</p>
              <p className="text-muted-foreground">{errorMessage(query.error)}</p>
              <Button size="sm" variant="outline" onClick={() => void query.refetch()}>
                <RotateCw />
                Try again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const insight = query.data;
  if (insight.status === "empty") return null;

  return (
    <Card className={cn(query.isFetching && "opacity-70 transition-opacity", className)}>
      <Header />
      <CardContent className="space-y-5 text-sm">
        <p className="text-foreground leading-relaxed">{insight.summary}</p>

        {insight.gaps.length ? (
          <section aria-labelledby="coach-gaps" className="space-y-2">
            <h3 id="coach-gaps" className="text-foreground font-medium">
              What to work on
            </h3>
            <ul className="space-y-3">
              {insight.gaps.map((gap) => (
                <li key={gap.skill_id} className="border-destructive/40 border-l-2 pl-3">
                  <p className="text-foreground font-medium">{gap.name}</p>
                  <p className="text-muted-foreground">{gap.why}</p>
                  <p className="text-muted-foreground">
                    <span className="text-foreground">Try: </span>
                    {gap.how}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section aria-labelledby="coach-plan" className="space-y-2">
          <h3 id="coach-plan" className="text-foreground font-medium">
            This week
          </h3>
          <ol className="space-y-2">
            {insight.plan.map((step, index) => (
              <li key={step.title} className="flex gap-3">
                <span
                  aria-hidden
                  className="bg-muted text-foreground flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium"
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
      </CardContent>
      {insight.generated_at ? (
        <CardFooter className="text-muted-foreground border-t text-xs">
          Updated {updatedLabel(insight.generated_at)} · refreshes after each skill check
        </CardFooter>
      ) : null}
    </Card>
  );
}
