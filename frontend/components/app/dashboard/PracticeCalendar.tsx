"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { cn } from "@/lib/utils/cn";
import { DashCard } from "./DashCard";

const WEEKDAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

/**
 * A month view with the days the student finished a check circled in indigo
 * and today in coral — practice streaks at a glance.
 */
export function PracticeCalendar({
  checkDates,
  className,
}: {
  checkDates: string[];
  className?: string;
}) {
  const today = new Date();
  const [offset, setOffset] = useState(0);
  const month = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const practised = new Set(checkDates.map((iso) => dayKey(new Date(iso))));
  const monthName = month.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const inMonth = checkDates.filter((iso) => {
    const d = new Date(iso);
    return d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear();
  }).length;

  const cells: (number | null)[] = [
    ...Array.from({ length: month.getDay() }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <DashCard className={className}>
      <div className="mb-3 flex items-center justify-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="text-dash-coral-ink size-8"
          aria-label="Previous month"
          onClick={() => setOffset((o) => o - 1)}
        >
          <ChevronLeft />
        </Button>
        <h2
          className="text-foreground min-w-36 text-center text-[15px] font-semibold"
          aria-live="polite"
        >
          {monthName}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          className="text-dash-coral-ink size-8"
          aria-label="Next month"
          disabled={offset >= 0}
          onClick={() => setOffset((o) => o + 1)}
        >
          <ChevronRight />
        </Button>
      </div>
      <div
        role="grid"
        aria-label={`Practice days in ${monthName}`}
        className="grid grid-cols-7 gap-y-1 text-center text-sm"
      >
        {WEEKDAYS.map((d) => (
          <span key={d} role="columnheader" className="text-muted-foreground pb-1 text-xs">
            {d}
          </span>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <span key={`blank-${i}`} aria-hidden />;
          const date = new Date(month.getFullYear(), month.getMonth(), day);
          const isToday = dayKey(date) === dayKey(today);
          const didPractise = practised.has(dayKey(date));
          return (
            <span
              key={day}
              role="gridcell"
              className="flex justify-center"
              aria-label={`${day}${didPractise ? ", checks taken" : ""}${isToday ? ", today" : ""}`}
            >
              <span
                aria-hidden
                className={cn(
                  "text-foreground/80 flex size-8 items-center justify-center rounded-full text-[13px] tabular-nums",
                  didPractise && "border-dash-indigo text-dash-indigo border-2 font-semibold",
                  isToday && !didPractise && "border-dash-coral text-dash-coral-ink border-2",
                  isToday && didPractise && "bg-dash-indigo text-white",
                )}
              >
                {day}
              </span>
            </span>
          );
        })}
      </div>
      <p className="text-muted-foreground mt-3 flex items-center justify-center gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="border-dash-indigo size-2.5 rounded-full border-2" aria-hidden />
          {inMonth} check{inMonth === 1 ? "" : "s"} this month
        </span>
        <span className="flex items-center gap-1.5">
          <span className="border-dash-coral size-2.5 rounded-full border-2" aria-hidden />
          Today
        </span>
      </p>
    </DashCard>
  );
}
