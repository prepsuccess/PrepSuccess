"use client";

import type { ReactNode } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Skeleton } from "@/components/shadcn/skeleton";
import { useGetAiStatusQuery } from "@/lib/api/endpoints/ai";
import type { AiStatus, Dashboard } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";
import { CARD_SURFACE } from "./DashCard";
import { PASS_MARK, readinessBand, shortDate } from "./shared";

/** One number with its label and a line of context. */
function Tile({
  id,
  label,
  value,
  suffix,
  badge,
  caption,
  valueClassName,
  children,
}: {
  id: string;
  label: string;
  value: ReactNode;
  suffix?: string;
  badge?: ReactNode;
  caption: ReactNode;
  valueClassName?: string;
  children?: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className={cn(CARD_SURFACE, "gap-1.5")}>
      <h2 id={id} className="text-muted-foreground text-xs font-medium">
        {label}
      </h2>
      <p className="flex flex-wrap items-baseline gap-x-1.5">
        <span
          className={cn(
            "text-foreground text-3xl font-light tracking-tight tabular-nums",
            valueClassName,
          )}
        >
          {value}
        </span>
        {suffix ? <span className="text-muted-foreground text-sm">{suffix}</span> : null}
        {badge}
      </p>
      {/* Extras (the AI usage bar) sit above the caption, so captions line up across tiles. */}
      {children}
      <p className="text-muted-foreground mt-auto pt-1 text-xs leading-snug">{caption}</p>
    </section>
  );
}

function Change({ value }: { value: number | null }) {
  if (!value) return null;
  const up = value > 0;
  const Icon = up ? ArrowUp : ArrowDown;
  return (
    <span
      aria-hidden
      className={cn(
        "flex items-center gap-0.5 self-center rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
        up ? "bg-dash-indigo/12 text-dash-indigo" : "bg-dash-coral/15 text-dash-coral-ink",
      )}
    >
      <Icon className="size-3" strokeWidth={3} />
      {Math.abs(value)}
    </span>
  );
}

function aiCaption(status: AiStatus) {
  if (!status.available) return "AI is unavailable right now";
  if (status.reason === "AI_DAILY_LIMIT") return "Daily limit reached · resets at midnight";
  if (!status.trial.active) return "Your AI free trial has ended";
  const days = status.trial.days_left;
  return `Free trial · ${days} day${days === 1 ? "" : "s"} left · resets at midnight`;
}

/** Today's AI usage and the trial (GET /ai/status), loaded apart from the dashboard. */
function AiUsageTile() {
  const query = useGetAiStatusQuery();
  const id = "stat-ai";
  const label = "AI chats today";

  if (query.isLoading) {
    return (
      <Tile
        id={id}
        label={label}
        value={<Skeleton className="my-1 h-7 w-16" />}
        caption={<Skeleton className="h-3 w-32" />}
      />
    );
  }

  if (query.isError || !query.data) {
    return (
      <Tile
        id={id}
        label={label}
        value="—"
        caption={
          <span role="alert">
            Couldn&apos;t load your AI usage.{" "}
            <button
              type="button"
              className="text-dash-indigo font-medium underline-offset-2 hover:underline"
              onClick={() => void query.refetch()}
            >
              Try again
            </button>
          </span>
        }
      />
    );
  }

  const status = query.data;
  const { requests, limit } = status.today;
  const percent = Math.min(100, Math.round((requests / limit) * 100));
  const atLimit = status.reason === "AI_DAILY_LIMIT";
  return (
    <Tile
      id={id}
      label={label}
      value={requests}
      suffix={`/ ${limit}`}
      valueClassName={atLimit ? "text-dash-coral-ink" : undefined}
      caption={aiCaption(status)}
    >
      <div
        role="progressbar"
        aria-label="AI chats used today"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={`${requests} of ${limit} chats`}
        className="bg-dash-indigo-soft/35 mt-1 h-1.5 overflow-hidden rounded-full"
      >
        <div
          className={cn("h-full rounded-full", atLimit ? "bg-dash-coral" : "bg-dash-indigo")}
          style={{ width: `${percent}%` }}
        />
      </div>
    </Tile>
  );
}

const sameMonth = (a: Date, b: Date) =>
  a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();

/** The four numbers a student checks first: one row on wide screens, 2×2 below. */
export function StatTiles({ data }: { data: Dashboard }) {
  const { readiness, counts } = data;
  const now = new Date();
  const thisMonth = readiness.history.filter((p) => sameMonth(new Date(p.date), now)).length;
  const change = readiness.change;
  // History is oldest first and capped at the latest 20 checks.
  const lastCheck = readiness.history.at(-1);

  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      <Tile
        id="stat-readiness"
        label="Readiness"
        value={readiness.score ?? "—"}
        suffix={readiness.score === null ? undefined : "/ 100"}
        badge={<Change value={change} />}
        caption={
          readiness.score === null
            ? "Appears after your first check"
            : `${readinessBand(readiness.score)}${
                change
                  ? ` · ${change > 0 ? "up" : "down"} ${Math.abs(change)} since last check`
                  : ""
              }`
        }
      />
      <Tile
        id="stat-revision"
        label="Needs revision"
        value={counts.checked ? counts.needs_revision : "—"}
        valueClassName={counts.needs_revision > 0 ? "text-dash-coral-ink" : undefined}
        caption={
          counts.checked
            ? `Below the ${PASS_MARK}% pass mark, of ${counts.checked} checked`
            : "Skills below the pass mark show here"
        }
      />
      <Tile
        id="stat-month"
        label="Checks this month"
        value={thisMonth}
        caption={
          lastCheck
            ? `Last check ${shortDate(lastCheck.date)}`
            : "Take your first skill check to start"
        }
      />
      <AiUsageTile />
    </div>
  );
}
