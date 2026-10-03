"use client";

import { AiTrialCard } from "@/components/app/AiTrialCard";
import { Skeleton } from "@/components/shadcn/skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { useDelayedFlag } from "@/lib/hooks/useDelayedFlag";
import { useGetDashboardQuery } from "@/lib/api/endpoints/dashboard";
import { cn } from "@/lib/utils/cn";
import { CategoryBars, CoverageBar } from "./Bars";
import { MasteryDonut, ReadinessGauge, RetakeBars, SkillScores, TrendChart } from "./Charts";
import { CoachInsight, CoachInsightSkeleton } from "./CoachInsight";
import { DashCard } from "./DashCard";
import { Headline } from "./Headline";
import { NextSteps } from "./NextSteps";
import { PracticeCalendar } from "./PracticeCalendar";

// Each card claims a named area of .dash-grid (app/globals.css).
const area = {
  head: "[grid-area:head]",
  cal: "[grid-area:cal]",
  cat: "[grid-area:cat]",
  steps: "[grid-area:steps]",
  gauge: "[grid-area:gauge]",
  trend: "[grid-area:trend]",
  donut: "[grid-area:donut]",
  skills: "[grid-area:skills]",
  retake: "[grid-area:retake]",
  coach: "[grid-area:coach]",
} as const;

/** The lavender canvas the cards sit on, as in the reference. */
function Canvas({ children }: { children: React.ReactNode }) {
  return <div className="bg-dash-canvas -mx-2 rounded-[2rem] p-2 sm:mx-0 sm:p-4">{children}</div>;
}

/** A grey stand-in for one card: same area, same height as the real thing. */
function Block({
  className,
  lines = 2,
  body,
}: {
  className: string;
  lines?: number;
  body: string;
}) {
  return (
    <DashCard className={className}>
      <div className="mb-4 space-y-2">
        <Skeleton className="h-4 w-32" />
        {lines > 1 ? <Skeleton className="h-3 w-48 max-w-full" /> : null}
      </div>
      <Skeleton className={cn("w-full rounded-2xl", body)} />
    </DashCard>
  );
}

/** The real layout in grey, card for card, so nothing moves when data lands. */
function DashboardSkeleton() {
  return (
    <Canvas>
      <div className="dash-grid" aria-hidden>
        <Block className={area.head} body="h-[170px]" />
        <Block className={area.cal} lines={1} body="h-[250px]" />
        <div className={cn(area.cat, "flex flex-col gap-4")}>
          <Block className="flex-1" body="h-[110px]" />
          <Block className="" body="h-[40px]" />
        </div>
        <Block className={area.steps} body="h-[300px]" />
        <Block className={area.trend} body="h-[290px]" />
        <Block className={area.gauge} body="h-[340px]" />
        <Block className={area.donut} body="h-[230px]" />
        <Block className={area.skills} body="h-[200px]" />
        <Block className={area.retake} body="h-[250px]" />
        <CoachInsightSkeleton className={area.coach} />
      </div>
    </Canvas>
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
    <div className="space-y-4">
      <Canvas>
        <div className="dash-grid">
          <Headline data={data} className={area.head} />
          <PracticeCalendar
            checkDates={data.readiness.history.map((p) => p.date)}
            className={area.cal}
          />
          <div className={cn(area.cat, "flex flex-col gap-4 [&>*:first-child]:flex-1")}>
            <CategoryBars readiness={data.readiness} />
            <CoverageBar counts={data.counts} />
          </div>
          <NextSteps steps={data.next_steps} className={area.steps} />
          <TrendChart history={data.readiness.history} className={area.trend} />
          <ReadinessGauge
            readiness={data.readiness}
            topStep={data.next_steps[0]}
            className={area.gauge}
          />
          <MasteryDonut counts={data.counts} className={area.donut} />
          <SkillScores skills={data.skills} className={area.skills} />
          <RetakeBars skills={data.skills} className={area.retake} />
          {hasResults ? <CoachInsight className={area.coach} /> : null}
        </div>
      </Canvas>
      <AiTrialCard />
    </div>
  );
}
