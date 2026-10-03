"use client";

import Link from "next/link";
import { ArrowRight, CircleCheck } from "lucide-react";
import { Skeleton } from "@/components/shadcn/skeleton";
import { DifficultyBars } from "@/components/app/DifficultyBars";
import { QueryState } from "@/components/ui/QueryState";
import { useGetQuestionsQuery } from "@/lib/api/endpoints/questions";

/** A skill's first few interview questions on its Learn page, linking to the full filtered bank. */
export function SkillQuestions({ slug, name }: { slug: string; name: string }) {
  const query = useGetQuestionsQuery({ skill: slug, page: 1, limit: 5 });
  return (
    <QueryState
      query={query}
      skeleton={<Skeleton className="h-40 rounded-xl" aria-hidden />}
      errorTitle="Couldn't load interview questions"
      isEmpty={(data) => data.questions.length === 0}
      empty={
        <p className="text-muted-foreground text-sm">No interview questions for {name} yet.</p>
      }
    >
      {({ questions, meta }) => (
        <div className="space-y-3">
          <ul className="bg-card divide-y rounded-xl border shadow-xs">
            {questions.map((q) => (
              <li key={q.id}>
                <Link
                  href={`/questions/${q.id}`}
                  className="group hover:bg-muted/50 focus-visible:ring-ring/50 flex items-center gap-3 px-4 py-3 outline-none focus-visible:ring-3"
                >
                  <span className="min-w-0 flex-1">
                    <span className="text-foreground block text-sm font-medium">{q.title}</span>
                    <span className="mt-1 flex items-center gap-2">
                      <DifficultyBars level={q.difficulty} />
                      <span className="text-muted-foreground text-xs">{q.topic}</span>
                    </span>
                  </span>
                  {q.solved ? (
                    <CircleCheck className="text-success size-4 shrink-0" aria-label="Solved" />
                  ) : null}
                  <ArrowRight
                    aria-hidden
                    className="text-muted-foreground size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href={`/questions?skill=${slug}`}
            className="text-foreground focus-visible:ring-ring/50 inline-flex items-center gap-1 rounded text-sm font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-3"
          >
            All {meta.total} {name} questions
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      )}
    </QueryState>
  );
}
