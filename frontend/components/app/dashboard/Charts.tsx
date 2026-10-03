"use client";

import Link from "next/link";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/shadcn/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/shadcn/chart";
import type { Dashboard, DashboardSkillResult, NextStep } from "@/lib/api/types";
import { DashCard, Pill } from "./DashCard";
import { PALETTE, PASS_MARK, readinessBand, shortDate } from "./shared";

/** A dashed, centred note where a chart will appear once there's data. */
function ChartPlaceholder({ children, className }: { children: string; className: string }) {
  return (
    <div
      className={`text-muted-foreground border-dash-indigo-soft/70 flex items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center text-sm ${className}`}
    >
      <p className="max-w-60">{children}</p>
    </div>
  );
}

const shorten = (name: string, max = 18) =>
  name.length > max ? `${name.slice(0, max - 1)}…` : name;

// ---------------------------------------------------------------------------
// Readiness gauge (the reference's 75% ring with a button)
// ---------------------------------------------------------------------------

export function ReadinessGauge({
  readiness,
  topStep,
  className,
}: {
  readiness: Dashboard["readiness"];
  topStep?: NextStep;
  className?: string;
}) {
  const score = readiness.score;
  const config = { score: { label: "Readiness", color: PALETTE.indigo } } satisfies ChartConfig;

  return (
    <DashCard
      title="Readiness"
      description="Weighted across everything you've checked"
      className={className}
    >
      <div className="relative mx-auto w-full max-w-[240px]">
        <ChartContainer config={config} className="aspect-square w-full">
          <RadialBarChart
            data={[{ score: score ?? 0 }]}
            innerRadius="80%"
            outerRadius="100%"
            startAngle={90}
            endAngle={-270}
          >
            <defs>
              <linearGradient id="gauge-fill" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={PALETTE.indigoSoft} />
                <stop offset="100%" stopColor={PALETTE.indigo} />
              </linearGradient>
            </defs>
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
            <RadialBar
              dataKey="score"
              fill="url(#gauge-fill)"
              cornerRadius={99}
              background={{ fill: "color-mix(in oklab, var(--dash-indigo-soft) 35%, transparent)" }}
            />
          </RadialBarChart>
        </ChartContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-foreground text-5xl font-light tracking-tight tabular-nums">
            {score ?? "—"}
            {score !== null ? (
              <span className="text-muted-foreground ml-0.5 text-base">/100</span>
            ) : null}
          </span>
        </div>
      </div>
      <p className="text-muted-foreground mt-4 text-center text-sm leading-relaxed">
        {score === null ? (
          "Take your first skill check to get a readiness score."
        ) : (
          <>
            <span className="text-foreground font-medium">{readinessBand(score)}.</span> Technical
            counts most, then aptitude, then soft skills.
          </>
        )}
      </p>
      <div className="mt-auto pt-5">
        <Button
          asChild
          className="bg-dash-indigo hover:bg-dash-indigo/90 h-11 w-full min-w-0 rounded-full px-5 text-white dark:text-white"
        >
          <Link href={topStep?.href ?? "/assessment"} title={topStep?.title}>
            <span className="truncate">{topStep?.title ?? "Take a skill check"}</span>
          </Link>
        </Button>
      </div>
    </DashCard>
  );
}

// ---------------------------------------------------------------------------
// Readiness over time (the reference's two-line chart)
// ---------------------------------------------------------------------------

const trendConfig = {
  score: { label: "Readiness", color: PALETTE.indigo },
  percent: { label: "That check's score", color: PALETTE.coral },
} satisfies ChartConfig;

export function TrendChart({
  history,
  className,
}: {
  history: Dashboard["readiness"]["history"];
  className?: string;
}) {
  const points = history.map((p, i) => ({ ...p, check: i + 1 }));
  return (
    <DashCard
      title="Progress over time"
      description="Readiness after each check, and what you scored on it"
      action={<Pill>All time</Pill>}
      className={className}
    >
      {points.length > 1 ? (
        <>
          <ChartContainer config={trendConfig} className="aspect-auto h-[260px] w-full">
            <ComposedChart data={points} margin={{ left: -18, right: 12, top: 12, bottom: 0 }}>
              <defs>
                <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={PALETTE.indigo} stopOpacity={0.22} />
                  <stop offset="100%" stopColor={PALETTE.indigo} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="check"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(n: number) => `#${n}`}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, payload) => {
                      const p = payload?.[0]?.payload as (typeof points)[number] | undefined;
                      return p ? `${shortDate(p.date)} · ${p.skill}` : "";
                    }}
                  />
                }
              />
              <Area
                dataKey="score"
                type="monotone"
                stroke={PALETTE.indigo}
                strokeWidth={3}
                fill="url(#trend-fill)"
                dot={{ r: 5, fill: "var(--card)", stroke: PALETTE.indigo, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
              <Line
                dataKey="percent"
                type="monotone"
                stroke={PALETTE.coral}
                strokeWidth={3}
                dot={{ r: 5, fill: "var(--card)", stroke: PALETTE.coral, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ChartContainer>
          <p className="text-muted-foreground mt-2 flex justify-center gap-8 text-xs">
            <span className="flex items-center gap-2">
              <span className="bg-dash-indigo h-0.5 w-6 rounded" aria-hidden />
              Readiness
            </span>
            <span className="flex items-center gap-2">
              <span className="bg-dash-coral h-0.5 w-6 rounded" aria-hidden />
              Check score
            </span>
          </p>
          <p className="sr-only">
            Readiness after each check: {points.map((p) => p.score).join(", ")}.
          </p>
        </>
      ) : (
        <ChartPlaceholder className="h-[284px]">
          {points.length === 1
            ? "One check so far — take another to start your progress line."
            : "Your progress line starts after your first two checks."}
        </ChartPlaceholder>
      )}
    </DashCard>
  );
}

// ---------------------------------------------------------------------------
// Skill scores (labelled bars, like the reference's progress list)
// ---------------------------------------------------------------------------

export function SkillScores({
  skills,
  className,
}: {
  skills: DashboardSkillResult[];
  className?: string;
}) {
  return (
    <DashCard title="Skill scores" description="Latest check, weakest first" className={className}>
      {skills.length ? (
        <>
          <ul className="space-y-3.5">
            {skills.map((s) => {
              const mastered = s.mastery === "mastered";
              return (
                <li key={s.skill_id}>
                  <Link
                    href={`/assessment/${s.assessment_id}`}
                    aria-label={`${s.name}: ${s.percent}%, ${mastered ? "mastered" : "needs revision"}. Review answers`}
                    className="group block space-y-1.5 rounded-lg"
                  >
                    <span className="flex items-baseline justify-between gap-3 text-xs">
                      <span className="text-foreground group-hover:text-dash-indigo truncate font-medium">
                        {s.name}
                      </span>
                      <span
                        className={
                          mastered
                            ? "text-dash-indigo font-semibold tabular-nums"
                            : "text-dash-coral-ink font-semibold tabular-nums"
                        }
                      >
                        {s.percent}%
                      </span>
                    </span>
                    <span className="bg-dash-indigo-soft/35 relative block h-2.5 rounded-full">
                      <span
                        className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-700"
                        style={{
                          width: `${Math.max(s.percent, 3)}%`,
                          background: mastered ? PALETTE.indigo : PALETTE.coral,
                        }}
                      />
                      {/* Pass-mark tick */}
                      <span
                        aria-hidden
                        className="bg-foreground/50 absolute -top-1 -bottom-1 w-0.5 rounded"
                        style={{ left: `${PASS_MARK}%` }}
                      />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="text-muted-foreground mt-auto flex flex-wrap gap-x-5 gap-y-1 pt-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="bg-dash-indigo size-2.5 rounded-sm" aria-hidden />
              Mastered
            </span>
            <span className="flex items-center gap-1.5">
              <span className="bg-dash-coral size-2.5 rounded-sm" aria-hidden />
              Needs revision
            </span>
            <span className="flex items-center gap-1.5">
              <span className="bg-foreground/50 h-3 w-0.5 rounded" aria-hidden />
              {PASS_MARK}% pass mark
            </span>
          </p>
        </>
      ) : (
        <ChartPlaceholder className="h-[200px]">
          Your score on every skill you check appears here.
        </ChartPlaceholder>
      )}
    </DashCard>
  );
}

// ---------------------------------------------------------------------------
// Previous vs latest attempt (grouped bars)
// ---------------------------------------------------------------------------

const retakeConfig = {
  previous: { label: "Previous", color: PALETTE.coralSoft },
  latest: { label: "Latest", color: PALETTE.coral },
} satisfies ChartConfig;

export function RetakeBars({
  skills,
  className,
}: {
  skills: DashboardSkillResult[];
  className?: string;
}) {
  const data = [...skills]
    .sort((a, b) => b.attempts - a.attempts)
    .slice(0, 7)
    .map((s) => ({
      label: shorten(s.name, 12),
      name: s.name,
      latest: s.percent,
      previous: s.change === null ? null : s.percent - s.change,
    }));
  const retaken = data.filter((d) => d.previous !== null).length;

  return (
    <DashCard
      title="Before and after"
      description={
        retaken
          ? `${retaken} skill${retaken === 1 ? "" : "s"} retaken — previous attempt vs latest`
          : "Retake a check to compare attempts"
      }
      className={className}
    >
      {data.length ? (
        <>
          <ChartContainer config={retakeConfig} className="aspect-auto h-[230px] w-full">
            <BarChart
              data={data}
              margin={{ left: -18, right: 4, top: 8 }}
              barGap={3}
              barCategoryGap="28%"
            >
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval={0}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip
                cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, payload) =>
                      (payload?.[0]?.payload as { name?: string } | undefined)?.name ?? ""
                    }
                  />
                }
              />
              <Bar dataKey="previous" fill="var(--color-previous)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="latest" fill="var(--color-latest)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
          <p className="text-muted-foreground mt-2 flex justify-center gap-6 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="bg-dash-coral-soft size-2.5 rounded-sm" aria-hidden />
              Previous
            </span>
            <span className="flex items-center gap-1.5">
              <span className="bg-dash-coral size-2.5 rounded-sm" aria-hidden />
              Latest
            </span>
          </p>
        </>
      ) : (
        <ChartPlaceholder className="h-[254px]">
          Retake a skill after revising it to see how much you improved.
        </ChartPlaceholder>
      )}
    </DashCard>
  );
}

// ---------------------------------------------------------------------------
// Mastered vs needs revision (donut)
// ---------------------------------------------------------------------------

export function MasteryDonut({
  counts,
  className,
}: {
  counts: Dashboard["counts"];
  className?: string;
}) {
  const total = counts.mastered + counts.needs_revision;
  const mastered = total ? Math.round((counts.mastered / total) * 100) : 0;
  const config = {
    mastered: { label: "Mastered", color: PALETTE.indigo },
    revise: { label: "Needs revision", color: PALETTE.coral },
  } satisfies ChartConfig;

  return (
    <DashCard
      title="Mastery"
      description="Share of the skills you've checked"
      action={<Pill>All time</Pill>}
      className={className}
    >
      {total ? (
        <div className="relative mx-auto w-full max-w-[230px]">
          <ChartContainer config={config} className="aspect-square w-full">
            <PieChart>
              <Pie
                data={[
                  { key: "mastered", value: counts.mastered, fill: PALETTE.indigo },
                  { key: "revise", value: counts.needs_revision, fill: PALETTE.coral },
                ]}
                dataKey="value"
                nameKey="key"
                innerRadius="64%"
                outerRadius="100%"
                paddingAngle={total > 1 && counts.mastered && counts.needs_revision ? 3 : 0}
                cornerRadius={4}
                startAngle={90}
                endAngle={-270}
                stroke="none"
              />
            </PieChart>
          </ChartContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-dash-indigo text-2xl font-semibold tabular-nums">{mastered}%</p>
            <p className="text-muted-foreground -mt-0.5 text-xs">Mastered</p>
            <span className="bg-border my-1.5 h-px w-12" aria-hidden />
            <p className="text-dash-coral-ink text-2xl font-semibold tabular-nums">
              {100 - mastered}%
            </p>
            <p className="text-muted-foreground -mt-0.5 text-xs">Needs revision</p>
          </div>
        </div>
      ) : (
        <ChartPlaceholder className="mx-auto aspect-square w-full max-w-[230px] rounded-full">
          Your mastery split appears after your first check.
        </ChartPlaceholder>
      )}
    </DashCard>
  );
}
