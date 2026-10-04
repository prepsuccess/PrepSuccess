"use client";

import Link from "next/link";
import { ArrowRight, MessageSquareReply } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Skeleton } from "@/components/shadcn/skeleton";
import { SendFeedbackButton } from "@/components/app/feedback/FeedbackDialog";
import { CategoryLabel, formatDate, StatusBadge } from "@/components/app/feedback/meta";
import { useGetMyFeedbackQuery } from "@/lib/api/endpoints/feedback";
import { DashCard } from "./DashCard";

/** "Help us improve": send feedback, and see where the last two stand. */
export function FeedbackCard({ className }: { className?: string }) {
  const { data, isLoading } = useGetMyFeedbackQuery({ page: 1, limit: 2 });
  const latest = data?.feedback ?? [];

  return (
    <DashCard
      title="Help us improve PrepSuccess"
      description="Found a bug or have an idea? Tell us. We reply to every message."
      className={className}
      action={
        latest.length ? (
          <Button asChild variant="ghost" size="sm" className="pointer-coarse:h-11">
            <Link href="/feedback">
              See all
              <ArrowRight />
            </Link>
          </Button>
        ) : null
      }
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="shrink-0">
          <SendFeedbackButton variant="outline" />
        </div>
        {isLoading ? (
          <Skeleton className="h-[68px] flex-1 rounded-xl" aria-hidden />
        ) : latest.length ? (
          <ul className="grid flex-1 gap-2 sm:grid-cols-2" aria-label="Your latest feedback">
            {latest.map((item) => (
              <li key={item.id} className="min-w-0">
                <Link
                  href="/feedback"
                  className="hover:border-foreground/20 focus-visible:ring-ring/50 flex h-full flex-col gap-1.5 rounded-xl border p-3 transition-colors outline-none focus-visible:ring-3"
                >
                  <span className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-muted-foreground flex min-w-0 items-center gap-1.5">
                      <CategoryLabel category={item.category} className="text-foreground" />
                      <span aria-hidden>·</span>
                      <time dateTime={item.created_at}>{formatDate(item.created_at)}</time>
                    </span>
                    <StatusBadge status={item.status} />
                  </span>
                  <span className="text-foreground line-clamp-1 text-sm">{item.message}</span>
                  {item.admin_remark ? (
                    <span className="text-brand-ink flex items-center gap-1 text-xs font-medium">
                      <MessageSquareReply className="size-3.5" aria-hidden />
                      The team replied
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">
            What you send and our replies show up on your feedback page.
          </p>
        )}
      </div>
    </DashCard>
  );
}
