"use client";

import { QueryState } from "@/components/ui/QueryState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useGetAiStatusQuery } from "@/lib/api/endpoints/ai";
import type { AiStatus } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";

function AiTrialSkeleton() {
  return (
    <div
      aria-hidden
      className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
    >
      {/* Each bar sits in a box the height of the real line of text, so nothing shifts on load. */}
      <div>
        <div className="flex h-[22.5px] items-center">
          <Skeleton className="h-4 w-44" />
        </div>
        <div className="mt-1 flex h-[19.5px] items-center">
          <Skeleton className="h-3.5 w-72 max-w-full" />
        </div>
      </div>
      <Skeleton className="h-2 w-full rounded-full sm:w-48" />
    </div>
  );
}

function headline(status: AiStatus) {
  if (!status.available) return "AI is unavailable right now";
  if (!status.trial.active) return "Your AI free trial has ended";
  return `AI free trial · ${status.trial.days_left} day${status.trial.days_left === 1 ? "" : "s"} left`;
}

/** The student's AI free trial and today's usage (GET /api/v1/ai/status). */
export function AiTrialCard({ className }: { className?: string }) {
  const query = useGetAiStatusQuery();

  return (
    <div className={className}>
      <QueryState
        query={query}
        skeleton={<AiTrialSkeleton />}
        errorTitle="Couldn't load your AI trial"
      >
        {(status) => {
          const used = Math.min(1, status.today.requests / status.today.limit);
          return (
            <section className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-heading text-[15px] font-medium">{headline(status)}</h2>
                <p className="text-text-dim mt-1 text-[13px]">
                  {status.reason === "AI_DAILY_LIMIT"
                    ? "You've used today's AI chats. They reset at midnight."
                    : `${status.today.requests} of ${status.today.limit} AI chats used today · resets at midnight`}
                </p>
              </div>
              <div
                className="bg-surface-3 h-2 w-full overflow-hidden rounded-full sm:w-48"
                role="progressbar"
                aria-label="AI chats used today"
                aria-valuemin={0}
                aria-valuemax={status.today.limit}
                aria-valuenow={status.today.requests}
              >
                <div
                  className={cn("h-full rounded-full", used >= 1 ? "bg-danger" : "bg-accent")}
                  style={{ width: `${used * 100}%` }}
                />
              </div>
            </section>
          );
        }}
      </QueryState>
    </div>
  );
}
