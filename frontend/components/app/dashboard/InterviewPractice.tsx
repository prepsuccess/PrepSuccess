"use client";

import Link from "next/link";
import { ArrowRight, MessagesSquare } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Button } from "@/components/shadcn/button";
import { Skeleton } from "@/components/shadcn/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/shadcn/chart";
import { useGetProgressQuery } from "@/lib/api/endpoints/questions";
import type { DashboardSkillResult } from "@/lib/api/types";
import { DashCard } from "./DashCard";
import { PALETTE } from "./shared";

const config = { solved: { label: "Solved", color: PALETTE.indigo } } satisfies ChartConfig;

const weekLabel = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short" });

/**
 * Interview questions solved per week, with links to practise each weak skill.
 * Renders sensibly with no solves, one week, or many (PRD-02 acceptance criteria).
 */
export function InterviewPractice({
  gaps,
  className,
}: {
  gaps: DashboardSkillResult[];
  className?: string;
}) {
  const { data, isLoading } = useGetProgressQuery();
  const weeks = data?.solved_by_week ?? [];
  const total = data?.totals.solved ?? 0;
  const latest = weeks.at(-1);

  return (
    <DashCard
      title="Interview practice"
      description="Questions you've solved each week"
      className={className}
      action={
        <Button asChild variant="ghost" size="sm" className="pointer-coarse:h-11">
          <Link href="/questions">
            Practise
            <ArrowRight />
          </Link>
        </Button>
      }
    >
      {isLoading ? (
        <Skeleton className="h-40 rounded-xl" aria-hidden />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            <p>
              <span className="text-foreground text-2xl font-semibold tabular-nums">{total}</span>{" "}
              <span className="text-muted-foreground text-sm">solved</span>
            </p>
            <p>
              <span className="text-foreground text-2xl font-semibold tabular-nums">
                {data?.totals.bookmarked ?? 0}
              </span>{" "}
              <span className="text-muted-foreground text-sm">bookmarked</span>
            </p>
            {latest ? (
              <p>
                <span className="text-foreground text-2xl font-semibold tabular-nums">
                  {latest.solved}
                </span>{" "}
                <span className="text-muted-foreground text-sm">this week</span>
              </p>
            ) : null}
          </div>

          {weeks.length > 1 ? (
            <>
              <ChartContainer config={config} className="aspect-auto h-[180px] w-full">
                <BarChart data={weeks} margin={{ left: -24, right: 8, top: 8, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="var(--border)" />
                  <XAxis
                    dataKey="week_start"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={weekLabel}
                  />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        labelFormatter={(value) => `Week of ${weekLabel(String(value))}`}
                      />
                    }
                  />
                  <Bar dataKey="solved" fill={PALETTE.indigo} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
              <p className="sr-only">
                Solved per week:{" "}
                {weeks.map((w) => `${weekLabel(w.week_start)}: ${w.solved}`).join(", ")}.
              </p>
            </>
          ) : (
            <p className="text-muted-foreground text-sm">
              {total
                ? "Keep going: your weekly trend appears from your second week of practice."
                : "Solve your first interview question to start your trend."}
            </p>
          )}

          <div>
            <p className="text-muted-foreground mb-2 text-xs font-medium">
              {gaps.length ? "Practise your weak spots" : "Pick a topic to practise"}
            </p>
            <ul className="flex flex-wrap gap-2">
              {(gaps.length ? gaps.slice(0, 3) : []).map((gap) => (
                <li key={gap.skill_id}>
                  <Link
                    href={`/questions?skill=${gap.slug}&status=unsolved`}
                    className="hover:bg-muted focus-visible:ring-ring/50 inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-sm outline-none focus-visible:ring-3 pointer-coarse:h-11"
                  >
                    <MessagesSquare className="text-muted-foreground size-3.5" aria-hidden />
                    {gap.name}
                  </Link>
                </li>
              ))}
              {gaps.length ? null : (
                <li>
                  <Link
                    href="/questions"
                    className="hover:bg-muted focus-visible:ring-ring/50 inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-sm outline-none focus-visible:ring-3 pointer-coarse:h-11"
                  >
                    <MessagesSquare className="text-muted-foreground size-3.5" aria-hidden />
                    Browse all questions
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </DashCard>
  );
}
