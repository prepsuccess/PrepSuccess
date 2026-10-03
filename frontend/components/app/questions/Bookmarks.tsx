"use client";

import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { ArrowLeft, ArrowRight, Bookmark, BookmarkX, CircleCheck } from "lucide-react";
import { Badge } from "@/components/shadcn/badge";
import { Button } from "@/components/shadcn/button";
import { Skeleton } from "@/components/shadcn/skeleton";
import { DifficultyBars } from "@/components/app/DifficultyBars";
import { EmptyPanel } from "@/components/app/EmptyPanel";
import { QueryState } from "@/components/ui/QueryState";
import { useGetBookmarksQuery, useSetBookmarkMutation } from "@/lib/api/endpoints/questions";
import { errorMessage } from "@/lib/api/errors";

const PAGE_SIZE = 20;

/** /questions/bookmarks — questions the student saved to come back to. */
export function Bookmarks() {
  const [page, setPage] = useState(1);
  const query = useGetBookmarksQuery({ page, limit: PAGE_SIZE });
  const [setBookmark, { isLoading: removing }] = useSetBookmarkMutation();

  async function remove(id: string) {
    try {
      await setBookmark({ id, on: false }).unwrap();
      toast.success("Removed from bookmarks");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  return (
    <div className="space-y-4">
      <Link
        href="/questions"
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 inline-flex items-center gap-1 rounded text-sm outline-none focus-visible:ring-3"
      >
        <ArrowLeft className="size-4" aria-hidden /> All questions
      </Link>
      <QueryState
        query={query}
        skeleton={<Skeleton className="h-64 rounded-2xl" aria-hidden />}
        errorTitle="Couldn't load your bookmarks"
        isEmpty={(data) => data.questions.length === 0}
        empty={
          <EmptyPanel
            icon={Bookmark}
            title="No bookmarks yet"
            description="Bookmark a question to come back to it here."
            action={
              <Button asChild variant="outline">
                <Link href="/questions">Browse questions</Link>
              </Button>
            }
          />
        }
      >
        {({ questions, meta }) => {
          const pages = Math.max(1, Math.ceil(meta.total / meta.limit));
          return (
            <>
              <ul className="bg-card divide-y rounded-2xl border shadow-xs">
                {questions.map((q) => (
                  <li key={q.id} className="flex items-center gap-3 p-4">
                    <Link
                      href={`/questions/${q.id}`}
                      className="group focus-visible:ring-ring/50 min-w-0 flex-1 rounded outline-none focus-visible:ring-3"
                    >
                      <span className="text-foreground block font-medium group-hover:underline">
                        {q.title}
                      </span>
                      <span className="text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-xs">
                        <DifficultyBars level={q.difficulty} />
                        <span>
                          {q.skill.name} · {q.topic}
                        </span>
                        {q.solved ? (
                          <Badge className="bg-success/10 text-success">
                            <CircleCheck aria-hidden />
                            Solved
                          </Badge>
                        ) : null}
                      </span>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={removing}
                      onClick={() => void remove(q.id)}
                      aria-label={`Remove bookmark: ${q.title}`}
                      className="pointer-coarse:h-11"
                    >
                      <BookmarkX />
                      <span className="max-sm:sr-only">Remove</span>
                    </Button>
                  </li>
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
            </>
          );
        }}
      </QueryState>
    </div>
  );
}
