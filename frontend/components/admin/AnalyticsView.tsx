"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Bot,
  ClipboardCheck,
  Gauge,
  ListChecks,
  MessageCircle,
  UserPlus,
  Users,
} from "lucide-react";
import { StatCards } from "@/components/app/StatCards";
import { DashCard } from "@/components/app/dashboard/DashCard";
import { CATEGORY_META, PALETTE, shortDate } from "@/components/app/dashboard/shared";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/shadcn/chart";
import { ErrorState } from "@/components/ui/ErrorState";
import { useGetAdminAnalyticsQuery } from "@/lib/api/endpoints/admin";
import type { AdminAnalytics } from "@/lib/api/types";

const pct = (value: number | null) => (value === null ? null : `${value}%`);
const num = (value: number) => value.toLocaleString("en-IN");

/** The headline numbers, shared by the admin overview and the analytics page. */
export function AnalyticsTiles({ data, loading }: { data?: AdminAnalytics; loading: boolean }) {
  return (
    <StatCards
      loading={loading}
      stats={[
        {
          label: "Students",
          icon: Users,
          value: data ? num(data.users.students) : null,
          note: data ? `${num(data.users.onboarded)} finished onboarding` : undefined,
        },
        {
          label: "Signups, last 7 days",
          icon: UserPlus,
          value: data ? num(data.users.signups_7d) : null,
          note: data ? `${num(data.users.signups_30d)} in 30 days` : undefined,
        },
        {
          label: "Skill checks finished",
          icon: ListChecks,
          value: data ? num(data.checks.completed) : null,
          note: data ? `${num(data.checks.students_checked)} students checked` : undefined,
        },
        {
          label: "Average check score",
          icon: Gauge,
          value: data ? pct(data.checks.average_percent) : null,
          note:
            data?.checks.mastered_rate != null
              ? `${data.checks.mastered_rate}% reach the pass mark`
              : undefined,
        },
      ]}
    />
  );
}

const signupsConfig = { count: { label: "Signups", color: PALETTE.indigo } } satisfies ChartConfig;

function SignupsChart({ days }: { days: AdminAnalytics["signups_by_day"] }) {
  const total = days.reduce((sum, d) => sum + d.count, 0);
  return (
    <DashCard
      title="Signups"
      description={`Last 30 days, India time · ${num(total)} total`}
      className="lg:col-span-2"
    >
      <ChartContainer config={signupsConfig} className="aspect-auto h-[240px] w-full">
        <BarChart data={days} margin={{ left: -18, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={24}
            tickFormatter={(d: string) => shortDate(d)}
          />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={40} />
          <ChartTooltip
            cursor={{ fill: "var(--muted)" }}
            content={<ChartTooltipContent labelFormatter={(d) => shortDate(String(d))} />}
          />
          <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} maxBarSize={18} />
        </BarChart>
      </ChartContainer>
      {/* The same numbers as a table, for screen readers. */}
      <table className="sr-only">
        <caption>Signups per day, last 30 days</caption>
        <tbody>
          {days.map((d) => (
            <tr key={d.date}>
              <th scope="row">{d.date}</th>
              <td>{d.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </DashCard>
  );
}

function CategoryAverages({ categories }: { categories: AdminAnalytics["categories"] }) {
  return (
    <DashCard title="By category" description="Average score of finished checks">
      <ul className="space-y-4">
        {categories.map((c) => {
          const { label } = CATEGORY_META[c.category];
          return (
            <li key={c.category} className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-foreground font-medium">
                  {label}{" "}
                  <span className="text-muted-foreground font-normal">
                    · {num(c.checks)} checks
                  </span>
                </span>
                <span className="text-foreground font-semibold tabular-nums">
                  {c.average_percent === null ? "No checks" : `${c.average_percent}%`}
                </span>
              </div>
              <div
                role="meter"
                aria-label={`${label} average`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={c.average_percent ?? undefined}
                aria-valuetext={
                  c.average_percent === null ? "No checks yet" : `${c.average_percent}%`
                }
                className="bg-dash-indigo-soft/35 h-2.5 overflow-hidden rounded-full"
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: `${c.average_percent ?? 0}%`, background: PALETTE.indigo }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </DashCard>
  );
}

function TopSkills({ skills }: { skills: AdminAnalytics["top_skills"] }) {
  const max = Math.max(1, ...skills.map((s) => s.checks));
  return (
    <DashCard title="Most-checked skills" description="Finished checks, all students">
      {skills.length ? (
        <ol className="space-y-3">
          {skills.map((s) => (
            <li key={s.name} className="space-y-1">
              <div className="flex justify-between gap-3 text-xs">
                <span className="text-foreground truncate font-medium">{s.name}</span>
                <span className="text-foreground font-semibold tabular-nums">{num(s.checks)}</span>
              </div>
              <div aria-hidden className="bg-dash-indigo-soft/35 h-1.5 rounded-full">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(s.checks / max) * 100}%`, background: PALETTE.indigo }}
                />
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-muted-foreground text-sm">No finished checks yet.</p>
      )}
    </DashCard>
  );
}

function Usage({ data }: { data: AdminAnalytics }) {
  const rows = [
    {
      icon: ClipboardCheck,
      label: "Practical task submissions",
      value: num(data.tasks.submissions),
    },
    { icon: ClipboardCheck, label: "Task pass rate", value: pct(data.tasks.pass_rate) ?? "—" },
    { icon: Bot, label: "AI requests today", value: num(data.ai.requests_today) },
    { icon: Bot, label: "AI requests, 30 days", value: num(data.ai.requests_30d) },
    { icon: Bot, label: "AI failure rate, 30 days", value: pct(data.ai.failure_rate_30d) ?? "—" },
    { icon: MessageCircle, label: "AI tokens, 30 days", value: num(data.ai.tokens_30d) },
  ];
  return (
    <DashCard
      title="Tasks and AI usage"
      description="AI is free during the trial; this is the meter"
    >
      <dl className="divide-y text-sm">
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center justify-between gap-3 py-2">
            <dt className="text-muted-foreground flex items-center gap-2">
              <Icon className="size-4" aria-hidden />
              {label}
            </dt>
            <dd className="text-foreground font-semibold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </DashCard>
  );
}

/** /admin/analytics — platform totals and rates. Nothing here identifies a student. */
export function AnalyticsView() {
  const query = useGetAdminAnalyticsQuery();
  if (query.isError) {
    return (
      <ErrorState
        error={query.error}
        title="Couldn't load analytics"
        onRetry={() => void query.refetch()}
      />
    );
  }
  const data = query.data;
  return (
    <div className="space-y-4">
      <AnalyticsTiles data={data} loading={query.isLoading} />
      {data ? (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <SignupsChart days={data.signups_by_day} />
            <CategoryAverages categories={data.categories} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <TopSkills skills={data.top_skills} />
            <Usage data={data} />
          </div>
        </>
      ) : null}
    </div>
  );
}
