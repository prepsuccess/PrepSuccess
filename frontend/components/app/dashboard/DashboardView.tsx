"use client";

import { useEffect, useRef } from "react";
import { Skeleton } from "@/components/shadcn/skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { useDelayedFlag } from "@/lib/hooks/useDelayedFlag";
import { useGetDashboardQuery } from "@/lib/api/endpoints/dashboard";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils/cn";
import { AiUsageNotice } from "./AiUsageNotice";
import { CategoryBars, CoverageBar } from "./Bars";
import { RetakeBars, SkillScores, TrendChart } from "./Charts";
import { CoachInsight, CoachInsightPlaceholder, CoachInsightSkeleton } from "./CoachInsight";
import { CARD_SURFACE, DashCard } from "./DashCard";
import { InterviewPractice } from "./InterviewPractice";
import { NextSteps } from "./NextSteps";
import { PracticeCalendar } from "./PracticeCalendar";
import { StatTiles } from "./StatTiles";
import { type Unlock, Unlocks } from "./Unlocks";

/*
 * Top to bottom, the way a student reads it: the key numbers, what to do next,
 * how they're trending, then the detail. Each row is its own grid, so a tall
 * card only stretches the cards beside it, never the rows below.
 */
const ROW = {
  actions: "grid gap-4 xl:grid-cols-3",
  trends: "grid gap-4 xl:grid-cols-3",
};
// The detail row holds one to three cards, depending on what's unlocked.
const DETAIL_GRID: Record<number, string> = {
  1: "grid gap-4",
  2: "grid gap-4 md:grid-cols-2",
  3: "grid gap-4 md:grid-cols-2 xl:grid-cols-3",
};
const WIDE = "xl:col-span-2";
const LAST_OF_THREE = "md:col-span-2 xl:col-span-1";
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
      <div className={DETAIL_GRID[3]}>
        <Block body="h-[220px]" />
        <Block body="h-[254px]" />
        <Block className={LAST_OF_THREE} body="h-[254px]" />
      </div>
    </Rows>
  );
}

/** The student's home: where they stand, why, and what to do next (GET /dashboard). */
export function DashboardView() {
  const query = useGetDashboardQuery();
  const showSkeleton = useDelayedFlag(query.isLoading);
  const hasData = Boolean(query.data);
  const hasResults = (query.data?.counts.checked ?? 0) > 0;
  const viewed = useRef(false);
  useEffect(() => {
    if (!hasData || viewed.current) return;
    viewed.current = true;
    track("dashboard_viewed", { has_results: hasResults });
  }, [hasData, hasResults]);

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
  const history = data.readiness.history;
  // Every check of the last year; the history is capped at 20. Falls back to
  // it for an API that doesn't send check_dates yet.
  const checkDates = (data as { check_dates?: string[] }).check_dates ?? history.map((p) => p.date);

  // A chart only shows once it has something to say; the rest are listed in
  // one Unlocks card instead of a page of empty boxes.
  const ready = {
    trend: history.length >= 2,
    skills: data.skills.length > 0,
    retake: data.skills.some((s) => s.change !== null),
    calendar: history.length > 0,
  };
  const locked: Unlock[] = [
    !ready.trend && {
      title: "Progress over time",
      need: history.length === 1 ? "Take 1 more check" : "Take 2 checks",
    },
    !ready.skills && { title: "Skill scores", need: "Finish your first check" },
    !ready.retake && { title: "Before and after", need: "Retake a skill after revising it" },
    !ready.calendar && { title: "Practice calendar", need: "Finish your first check" },
  ].filter((item): item is Unlock => Boolean(item));

  // Unlocks takes the trend chart's place while that's locked, otherwise it
  // joins the detail row.
  const detail = [
    ready.skills &&
      ((cls: string) => <SkillScores key="skills" skills={data.skills} className={cls} />),
    ready.retake &&
      ((cls: string) => <RetakeBars key="retake" skills={data.skills} className={cls} />),
    ready.calendar &&
      ((cls: string) => (
        <PracticeCalendar key="calendar" checkDates={checkDates} className={cls} />
      )),
    ready.trend &&
      locked.length > 0 &&
      ((cls: string) => <Unlocks key="unlocks" items={locked} className={cls} />),
  ].filter((card): card is (cls: string) => React.JSX.Element => Boolean(card));

  return (
    <Rows>
      <AiUsageNotice />
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
        {ready.trend ? (
          <TrendChart history={history} className={WIDE} />
        ) : (
          <Unlocks items={locked} className={WIDE} />
        )}
        <div className={CATEGORY_STACK}>
          <CategoryBars readiness={data.readiness} />
          <CoverageBar counts={data.counts} />
        </div>
      </div>

      {/* Phase 2: interview questions solved over time, and where to practise next. */}
      <InterviewPractice gaps={data.gaps} />

      {detail.length ? (
        <div className={DETAIL_GRID[detail.length]}>
          {/* With three cards on a two-column tablet, the last one spans the row. */}
          {detail.map((card, i) => card(detail.length === 3 && i === 2 ? LAST_OF_THREE : ""))}
        </div>
      ) : null}
    </Rows>
  );
}
