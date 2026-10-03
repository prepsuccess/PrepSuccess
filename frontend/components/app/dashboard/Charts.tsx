"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Area, Bar, BarChart, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/shadcn/chart";
import type { Dashboard, DashboardSkillResult } from "@/lib/api/types";
import { DashCard } from "./DashCard";
import { PALETTE, PASS_MARK, shortDate } from "./shared";

/** Skill scores lists this many, weakest first, so the row it sits in stays short. */
const SKILL_LIMIT = 6;

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
  const shown = skills.slice(0, SKILL_LIMIT);
  return (
    <DashCard
      title="Skill scores"
      description="Latest check, weakest first"
      action={
        skills.length > SKILL_LIMIT ? (
          <Link
            href="/assessment"
            className="text-dash-indigo flex shrink-0 items-center gap-1 text-xs font-medium hover:underline"
          >
            See all {skills.length}
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        ) : null
      }
      className={className}
    >
      {skills.length ? (
        <>
          <ul className="space-y-3.5">
            {shown.map((s) => {
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
