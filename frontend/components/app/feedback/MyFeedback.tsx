"use client";

import { useId, useState } from "react";
import { ArrowLeft, ArrowRight, MessageSquareReply, MessagesSquare } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Skeleton } from "@/components/shadcn/skeleton";
import { EmptyPanel } from "@/components/app/EmptyPanel";
import { QueryState } from "@/components/ui/QueryState";
import { useGetMyFeedbackQuery, type Feedback } from "@/lib/api/endpoints/feedback";
import { cn } from "@/lib/utils/cn";
import { SendFeedbackButton } from "./FeedbackDialog";
import { FeedbackImages } from "./FeedbackImages";
import { CategoryLabel, formatDate, StatusBadge } from "./meta";

const PAGE_SIZE = 10;
/** Longer messages start clamped to a few lines. */
const isLong = (message: string) => message.length > 280 || message.split("\n").length > 4;

/** The team's reply, set apart from the student's own words. */
export function TeamReply({ remark, footer }: { remark: string; footer?: React.ReactNode }) {
  return (
    <div className="border-brand bg-brand/5 rounded-r-lg border-l-4 px-4 py-3">
      <p className="text-foreground flex items-center gap-1.5 text-sm font-semibold">
        <MessageSquareReply className="text-brand-ink size-4" aria-hidden />
        Reply from the PrepSuccess team
      </p>
      <p className="text-foreground mt-1 text-sm whitespace-pre-wrap">{remark}</p>
      {footer}
    </div>
  );
}

function FeedbackItem({ item }: { item: Feedback }) {
  const [expanded, setExpanded] = useState(false);
  const messageId = useId();
  const long = isLong(item.message);

  return (
    <li className="space-y-3 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <CategoryLabel category={item.category} className="text-foreground font-medium" />
          <span className="text-muted-foreground" aria-hidden>
            ·
          </span>
          <span className="text-muted-foreground">
            Sent <time dateTime={item.created_at}>{formatDate(item.created_at)}</time>
          </span>
        </p>
        <StatusBadge status={item.status} />
      </div>
      <div>
        <p
          id={messageId}
          className={cn(
            "text-foreground text-sm whitespace-pre-wrap",
            long && !expanded && "line-clamp-4",
          )}
        >
          {item.message}
        </p>
        {long ? (
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto px-0 py-1 pointer-coarse:h-11"
            aria-expanded={expanded}
            aria-controls={messageId}
            onClick={() => setExpanded((open) => !open)}
          >
            {expanded ? "Show less" : "Show more"}
          </Button>
        ) : null}
      </div>
      <FeedbackImages images={item.images} />
      {item.admin_remark ? (
        <TeamReply
          remark={item.admin_remark}
          footer={
            item.status === "solved" && item.resolved_at ? (
              <p className="text-muted-foreground mt-2 text-xs">
                Solved on <time dateTime={item.resolved_at}>{formatDate(item.resolved_at)}</time>
              </p>
            ) : null
          }
        />
      ) : null}
    </li>
  );
}

/** /feedback — what the student sent us, its status and our replies. */
export function MyFeedback() {
  const [page, setPage] = useState(1);
  const query = useGetMyFeedbackQuery({ page, limit: PAGE_SIZE });

  return (
    <QueryState
      query={query}
      skeleton={<Skeleton className="h-64 rounded-2xl" aria-hidden />}
      errorTitle="Couldn't load your feedback"
      isEmpty={(data) => data.meta.total === 0}
      empty={
        <EmptyPanel
          icon={MessagesSquare}
          title="No feedback yet"
          description="Spotted a bug or have an idea? Send it here and you'll see our reply on this page."
          action={<SendFeedbackButton />}
        />
      }
    >
      {({ feedback, meta }) => {
        const pages = Math.max(1, Math.ceil(meta.total / meta.limit));
        return (
          <div className="space-y-4">
            <ul className="bg-card divide-y rounded-2xl border shadow-xs">
              {feedback.map((item) => (
                <FeedbackItem key={item.id} item={item} />
              ))}
            </ul>
            {pages > 1 ? (
              <nav aria-label="Pages" className="flex items-center justify-between gap-3">
                <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  <ArrowLeft />
                  Previous
                </Button>
                <span className="text-muted-foreground text-sm tabular-nums">
                  Page {page} of {pages}
                </span>
                <Button
                  variant="outline"
                  disabled={page >= pages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                  <ArrowRight />
                </Button>
              </nav>
            ) : null}
          </div>
        );
      }}
    </QueryState>
  );
}
