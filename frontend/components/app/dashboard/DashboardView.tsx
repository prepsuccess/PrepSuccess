"use client";

import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CircleCheck,
  Gauge,
  NotebookPen,
  Target,
} from "lucide-react";
import { AiTrialCard } from "@/components/app/AiTrialCard";
import { EmptyPanel } from "@/components/app/EmptyPanel";
import { StatCards } from "@/components/app/StatCards";
import { Badge } from "@/components/shadcn/badge";
import { Button } from "@/components/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/card";
import { Skeleton } from "@/components/shadcn/skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { useDelayedFlag } from "@/lib/hooks/useDelayedFlag";
import { useGetDashboardQuery } from "@/lib/api/endpoints/dashboard";
import type { Dashboard, DashboardSkillResult } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";
import { CoachInsight } from "./CoachInsight";

const CATEGORY_LABELS = { technical: "Technical", aptitude: "Aptitude", soft: "Soft skills" };
const PASS_MARK = 40;

/** A score bar with the pass-mark tick, shared by categories and skills. */
function ScoreBar({ percent, label }: { percent: number | null; label: string }) {
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent ?? undefined}
      aria-valuetext={percent === null ? "Not checked yet" : `${percent}%`}
      className="bg-muted relative h-2 w-full rounded-full"
    >
      {percent !== null ? (
        <span
          className={cn(
            "absolute inset-y-0 left-0 rounded-full",
            percent >= PASS_MARK ? "bg-primary" : "bg-destructive",
          )}
          style={{ width: `${Math.max(percent, 2)}%` }}
        />
      ) : null}
      <span
        aria-hidden
        className="bg-foreground/40 absolute -top-0.5 h-3 w-px"
        style={{ left: `${PASS_MARK}%` }}
      />
    </div>
  );
}

function Change({ change }: { change: number | null }) {
  if (change === null || change === 0) return null;
  const up = change > 0;
  const Icon = up ? ArrowUp : ArrowDown;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-medium tabular-nums",
        up ? "text-success" : "text-destructive",
      )}
    >
      <span aria-hidden className="inline-flex items-center gap-0.5">
        <Icon className="size-3" />
        {Math.abs(change)}
      </span>
      <span className="sr-only">
        {`${Math.abs(change)} points ${up ? "up" : "down"} since last time`}
      </span>
    </span>
  );
}

function NextSteps({ steps }: { steps: Dashboard["next_steps"] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Next steps</CardTitle>
        <CardDescription>Based on your results so far.</CardDescription>
      </CardHeader>
      <CardContent>
        {steps.length ? (
          <ol className="divide-y">
            {steps.map((step) => (
              <li key={step.id} className="py-2.5 first:pt-0 last:pb-0">
                <Link
                  href={step.href}
                  className="group hover:bg-muted/60 -mx-2 flex min-h-11 items-center gap-3 rounded-lg px-2 py-1.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground text-sm font-medium">{step.title}</p>
                    <p className="text-muted-foreground text-xs">{step.detail}</p>
                  </div>
                  <ArrowRight
                    className="text-muted-foreground group-hover:text-foreground size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-muted-foreground text-sm">
            You&apos;re all caught up. Retake a check any time to track your progress.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function Categories({ readiness }: { readiness: Dashboard["readiness"] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>By category</CardTitle>
        <CardDescription>
          Readiness weighs technical {readiness.weights.technical}%, aptitude{" "}
          {readiness.weights.aptitude}% and soft skills {readiness.weights.soft}%.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {readiness.categories.map((c) => (
            <li key={c.category} className="space-y-1.5">
              <div className="flex items-baseline justify-between gap-2 text-sm">
                <span className="text-foreground font-medium">{CATEGORY_LABELS[c.category]}</span>
                <span className="text-muted-foreground tabular-nums">
                  {c.score === null
                    ? "Not checked yet"
                    : `${c.score}% · ${c.checked} skill${c.checked === 1 ? "" : "s"}`}
                </span>
              </div>
              <ScoreBar percent={c.score} label={`${CATEGORY_LABELS[c.category]} score`} />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function Results({ skills }: { skills: DashboardSkillResult[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your results</CardTitle>
        <CardDescription>
          Latest score on each skill, weakest first. The tick is the 40% pass mark.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="divide-y">
          {skills.map((skill) => (
            <li
              key={skill.skill_id}
              className="grid gap-2 py-3 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,12rem)_1fr_auto] sm:items-center sm:gap-4"
            >
              <div className="min-w-0">
                <p className="text-foreground truncate text-sm font-medium">{skill.name}</p>
                <p className="text-muted-foreground text-xs">
                  {CATEGORY_LABELS[skill.category]}
                  {skill.attempts > 1 ? ` · ${skill.attempts} attempts` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <ScoreBar percent={skill.percent} label={`${skill.name} score`} />
                <span className="text-foreground w-10 text-right text-sm tabular-nums">
                  {skill.percent}%
                </span>
                <Change change={skill.change} />
              </div>
              <div className="flex items-center gap-3 sm:justify-end">
                {skill.mastery === "mastered" ? (
                  <Badge className="bg-success/10 text-success">Mastered</Badge>
                ) : (
                  <Badge variant="destructive">Needs revision</Badge>
                )}
                <Link
                  href={`/assessment/${skill.assessment_id}`}
                  aria-label={`Review your ${skill.name} answers`}
                  className="text-muted-foreground hover:text-foreground text-xs underline underline-offset-4"
                >
                  Review
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      <StatCards
        loading
        stats={[
          { label: "Readiness", icon: Gauge, value: null },
          { label: "Skills mastered", icon: CircleCheck, value: null },
          { label: "Need revision", icon: NotebookPen, value: null },
        ]}
      />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
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
  const { counts, readiness } = data;
  const hasResults = counts.checked > 0;

  return (
    <div className="space-y-4">
      <StatCards
        stats={[
          {
            label: "Readiness",
            icon: Gauge,
            value: readiness.score === null ? null : `${readiness.score}`,
            note: hasResults
              ? "Out of 100, across the skills you've checked"
              : "Appears after your first skill check",
          },
          {
            label: "Skills mastered",
            icon: CircleCheck,
            value: hasResults ? counts.mastered : null,
            note: hasResults
              ? `Of ${counts.checked} checked · pass mark ${PASS_MARK}%`
              : `Score ${PASS_MARK}% or more on a check`,
          },
          {
            label: "Need revision",
            icon: NotebookPen,
            value: hasResults ? counts.needs_revision : null,
            note:
              counts.claimed > 0
                ? `${counts.claimed_checked} of your ${counts.claimed} skills checked`
                : "Below the pass mark",
          },
        ]}
      />

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        {hasResults ? (
          <CoachInsight />
        ) : (
          <EmptyPanel
            icon={Target}
            title="No results yet"
            description="Take a skill check for anything you claim to know. Your coach reads your results and tells you what to work on."
            action={
              <Button asChild variant="outline">
                <Link href="/assessment">Take your first check</Link>
              </Button>
            }
          />
        )}
        <NextSteps steps={data.next_steps} />
      </div>

      {hasResults ? (
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <Categories readiness={readiness} />
          <Results skills={data.skills} />
        </div>
      ) : null}

      <AiTrialCard />
    </div>
  );
}
