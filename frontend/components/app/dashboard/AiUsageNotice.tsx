"use client";

import { Sparkles } from "lucide-react";
import { useGetAiStatusQuery } from "@/lib/api/endpoints/ai";
import type { AiStatus } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";

/** Share of the daily limit after which we start mentioning it. */
const WARN_AT = 0.8;

/** What to tell the student, or null when AI usage isn't worth their attention. */
function notice(status: AiStatus): { text: string; blocked: boolean } | null {
  const { requests, limit } = status.today;
  if (!status.available) {
    return {
      text: "The AI coach is unavailable right now. Your results still update.",
      blocked: true,
    };
  }
  if (status.reason === "AI_DAILY_LIMIT") {
    return {
      text: `You've used all ${limit} AI chats for today. They reset at midnight.`,
      blocked: true,
    };
  }
  if (!status.trial.active) {
    return { text: "Your AI free trial has ended.", blocked: true };
  }
  if (requests >= limit * WARN_AT) {
    return {
      text: `${requests} of ${limit} AI chats used today. They reset at midnight.`,
      blocked: false,
    };
  }
  return null;
}

/**
 * AI usage (GET /ai/status), shown only when it affects the student: near or
 * at the daily limit, trial over, or AI down. Silent while loading or on error,
 * since the dashboard works without it.
 */
export function AiUsageNotice() {
  const { data } = useGetAiStatusQuery();
  const message = data ? notice(data) : null;
  if (!message) return null;

  return (
    <p
      role="status"
      className={cn(
        "flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-sm",
        message.blocked
          ? "border-dash-coral/40 bg-dash-coral/10 text-dash-coral-ink"
          : "border-dash-indigo/30 bg-dash-indigo/8 text-dash-indigo",
      )}
    >
      <Sparkles className="size-4 shrink-0" aria-hidden />
      {message.text}
    </p>
  );
}
