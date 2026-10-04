"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, MessageSquareReply, X } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Skeleton } from "@/components/shadcn/skeleton";
import { SendFeedbackButton } from "@/components/app/feedback/FeedbackDialog";
import { CategoryLabel, formatDate, StatusBadge } from "@/components/app/feedback/meta";
import { useGetMyFeedbackQuery } from "@/lib/api/endpoints/feedback";
import { DashCard } from "./DashCard";

const DISMISSED_KEY = "ps-feedback-card-dismissed";
/** How many recent items the card lists; the rest are on /feedback. */
const RECENT = 4;

/**
 * Whether the student closed the feedback card at the top of the dashboard.
 * Kept in this browser only; if storage is unavailable the card simply shows.
 */
export function useFeedbackCardDismissed() {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISSED_KEY) === "1";
    } catch {
      return false;
    }
  });
  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // Private mode or blocked storage: it stays closed until the page reloads.
    }
  };
  return [dismissed, dismiss] as const;
}

/**
 * "Help us improve": send feedback, and see where the last two stand. With
 * `onDismiss` it shows a close button (the copy at the top of the dashboard).
 */
export function FeedbackCard({
  className,
  onDismiss,
}: {
  className?: string;
  onDismiss?: () => void;
}) {
  const { data, isLoading } = useGetMyFeedbackQuery({ page: 1, limit: RECENT });
  const latest = data?.feedback ?? [];

  return (
    <DashCard
      title="Help us improve PrepSuccess"
      description="Found a bug or have an idea? Tell us. We reply to every message."
      className={className}
      action={
        // Actions live in the header; the body is just the recent list.
        <div className="flex flex-wrap items-center justify-end gap-1">
          <SendFeedbackButton variant="outline" size="sm" className="pointer-coarse:h-11" />
          {latest.length ? (
            <Button asChild variant="ghost" size="sm" className="pointer-coarse:h-11">
              <Link href="/feedback">
                See all
                <ArrowRight />
              </Link>
            </Button>
          ) : null}
          {onDismiss ? (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onDismiss}
              aria-label="Close. It moves to the bottom of the dashboard."
              title="Close (it moves to the bottom)"
              className="pointer-coarse:size-11"
            >
              <X />
            </Button>
          ) : null}
        </div>
      }
    >
      {isLoading ? (
        <Skeleton className="h-11 w-full rounded-xl" aria-hidden />
      ) : latest.length ? (
        // Full-width rows, like a small inbox: the latest few, "See all" for the rest.
        <ul
          className="divide-y overflow-hidden rounded-xl border"
          aria-label="Your latest feedback"
        >
          {latest.map((item) => (
            <li key={item.id}>
              <Link
                href="/feedback"
                className="hover:bg-muted/50 focus-visible:bg-muted/50 flex min-h-11 items-center gap-3 px-3 py-2.5 text-sm transition-colors outline-none"
              >
                <CategoryLabel
                  category={item.category}
                  className="text-foreground shrink-0 text-xs font-medium"
                />
                <span className="text-foreground min-w-0 flex-1 truncate">{item.message}</span>
                {item.admin_remark ? (
                  <span className="text-brand-ink hidden shrink-0 items-center gap-1 text-xs font-medium sm:flex">
                    <MessageSquareReply className="size-3.5" aria-hidden />
                    Replied
                  </span>
                ) : null}
                <time
                  dateTime={item.created_at}
                  className="text-muted-foreground hidden shrink-0 text-xs md:inline"
                >
                  {formatDate(item.created_at)}
                </time>
                <StatusBadge status={item.status} />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground text-sm">
          Nothing sent yet. Your feedback and our replies will show here.
        </p>
      )}
    </DashCard>
  );
}
