"use client";

import type { ReactNode } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { Dashboard } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";
import { CARD_SURFACE } from "./DashCard";
import { PASS_MARK, READY_MARK, readinessBand, shortDate } from "./shared";

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
      {/* Extras (the goal bar) sit above the caption, so captions line up across tiles. */}
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

/** How far the student is from placement ready, so the readiness number has a target. */
function GoalTile({ score }: { score: number | null }) {
  const toGo = score === null ? null : Math.max(READY_MARK - score, 0);
  const reached = toGo === 0;
  const percent = score === null ? 0 : Math.min(100, Math.round((score / READY_MARK) * 100));

  return (
    <Tile
      id="stat-goal"
      label="Placement-ready goal"
      value={toGo === null ? "—" : reached ? "Reached" : toGo}
      suffix={toGo && !reached ? "points to go" : undefined}
      valueClassName={reached ? "text-dash-indigo" : undefined}
      caption={
        score === null
          ? `Placement ready is ${READY_MARK}. Take a check to see how far you are`
          : reached
            ? `You're above ${READY_MARK} — keep checking new skills`
            : `Placement ready is ${READY_MARK} readiness`
      }
    >
      <div
        role="progressbar"
        aria-label="Progress to placement ready"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={
          score === null ? "No readiness score yet" : `${score} of ${READY_MARK} readiness`
        }
        className="bg-dash-indigo-soft/35 mt-1 h-1.5 overflow-hidden rounded-full"
      >
        <div className="bg-dash-indigo h-full rounded-full" style={{ width: `${percent}%` }} />
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
      <GoalTile score={readiness.score} />
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
    </div>
  );
}
