"use client";

import { Skeleton } from "@/components/shadcn/skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { useDelayedFlag } from "@/lib/hooks/useDelayedFlag";
import { useGetDashboardQuery } from "@/lib/api/endpoints/dashboard";
import { cn } from "@/lib/utils/cn";
import { CategoryBars, CoverageBar } from "./Bars";
import { RetakeBars, SkillScores, TrendChart } from "./Charts";
import { CoachInsight, CoachInsightPlaceholder, CoachInsightSkeleton } from "./CoachInsight";
import { CARD_SURFACE, DashCard } from "./DashCard";
import { NextSteps } from "./NextSteps";
import { PracticeCalendar } from "./PracticeCalendar";
import { StatTiles } from "./StatTiles";

/*
 * Top to bottom, the way a student reads it: the key numbers, what to do next,
 * how they're trending, then the detail. Each row is its own grid, so a tall
 * card only stretches the cards beside it, never the rows below.
 */
const ROW = {
  actions: "grid gap-4 xl:grid-cols-3",
  trends: "grid gap-4 xl:grid-cols-3",
  detail: "grid gap-4 md:grid-cols-2 xl:grid-cols-3",
};
const WIDE = "xl:col-span-2";
const CALENDAR = "md:col-span-2 xl:col-span-1";
const CATEGORY_STACK = "flex flex-col gap-4 [&>*:first-child]:flex-1";

/** The rows, stacked straight on the page — no wrapper box, same as other app pages. */
function Rows({ children, ...props }: React.ComponentProps<"div">) {
  return (
    <div className="space-y-4" {...props}>
      {children}
    </div>
  );
}

/** A grey stand-in for one card, roughly the real card's height. */
function Block({ className, body }: { className?: string; body: string }) {
  return (
    <DashCard className={className}>
      <div className="mb-4 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48 max-w-full" />
      </div>
      <Skeleton className={cn("w-full rounded-2xl", body)} />
    </DashCard>
  );
}

/** The real layout in grey, row for row, so nothing moves when data lands. */
function DashboardSkeleton() {
  return (
    <Rows aria-hidden>
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={cn(CARD_SURFACE, "gap-2")}>
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-full max-w-40" />
          </div>
        ))}
      </div>
      <div className={ROW.actions}>
        <Block body="h-[220px]" />
        <CoachInsightSkeleton className={WIDE} />
      </div>
      <div className={ROW.trends}>
        <Block className={WIDE} body="h-[284px]" />
        <div className={CATEGORY_STACK}>
          <Block body="h-[120px]" />
          <Block body="h-[40px]" />
        </div>
      </div>
      <div className={ROW.detail}>
        <Block body="h-[220px]" />
        <Block body="h-[254px]" />
        <Block className={CALENDAR} body="h-[254px]" />
      </div>
    </Rows>
  );
}

/** The student's home: where they stand, why, and what to do next (GET /dashboard). */
export function DashboardView() {
  const query = useGetDashboardQuery();
  const showSkeleton = useDelayedFlag(query.isLoading);

  if (query.isLoading) return showSkeleton ? <DashboardSkeleton /> : null;
  if (query.isError || !query.data) {
    return (
      <ErrorState
        error={query.error}
        title="Couldn't load your dashboard"
        onRetry={() => void query.refetch()}
      />
    );
  }

  const data = query.data;
  const hasResults = data.counts.checked > 0;

  return (
    <Rows>
      <StatTiles data={data} />

      <div className={ROW.actions}>
        <NextSteps steps={data.next_steps} />
        {/* Before the first check there's nothing to read, so don't call the AI. */}
        {hasResults ? (
          <CoachInsight className={WIDE} />
        ) : (
          <CoachInsightPlaceholder className={WIDE} />
        )}
      </div>

      <div className={ROW.trends}>
        <TrendChart history={data.readiness.history} className={WIDE} />
        <div className={CATEGORY_STACK}>
          <CategoryBars readiness={data.readiness} />
          <CoverageBar counts={data.counts} />
        </div>
      </div>

      <div className={ROW.detail}>
        <SkillScores skills={data.skills} />
        <RetakeBars skills={data.skills} />
        <PracticeCalendar
          checkDates={data.readiness.history.map((p) => p.date)}
          className={CALENDAR}
        />
      </div>
    </Rows>
  );
}
