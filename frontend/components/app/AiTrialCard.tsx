"use client";

import { Sparkles } from "lucide-react";
import { Badge } from "@/components/shadcn/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/card";
import { Progress } from "@/components/shadcn/progress";
import { Skeleton } from "@/components/shadcn/skeleton";
import { QueryState } from "@/components/ui/QueryState";
import { useGetAiStatusQuery } from "@/lib/api/endpoints/ai";
import type { AiStatus } from "@/lib/api/types";

function AiTrialSkeleton() {
  return (
    <Card aria-hidden>
      <CardHeader>
        {/* Boxes sized to the real title and description lines, so nothing shifts on load. */}
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-2 w-full rounded-full" />
      </CardContent>
    </Card>
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
          const percent = Math.min(
            100,
            Math.round((status.today.requests / status.today.limit) * 100),
          );
          const atLimit = status.reason === "AI_DAILY_LIMIT";
          return (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="text-brand size-4" aria-hidden />
                  {headline(status)}
                </CardTitle>
                <CardDescription>
                  {atLimit
                    ? "You've used today's AI chats. They reset at midnight."
                    : `${status.today.requests} of ${status.today.limit} AI chats used today · resets at midnight`}
                </CardDescription>
                <CardAction>
                  <Badge variant={atLimit ? "destructive" : "secondary"}>
                    {atLimit ? "Limit reached" : "Free"}
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardContent>
                <Progress
                  value={percent}
                  aria-label="AI chats used today"
                  getValueLabel={() => `${status.today.requests} of ${status.today.limit} chats`}
                  className="h-2"
                />
              </CardContent>
            </Card>
          );
        }}
      </QueryState>
    </div>
  );
}
