"use client";

import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { ArrowLeft, ArrowRight, Bookmark, BookmarkCheck, Check, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/shadcn/badge";
import { Button } from "@/components/shadcn/button";
import { Skeleton } from "@/components/shadcn/skeleton";
import { DifficultyBars } from "@/components/app/DifficultyBars";
import { Prose } from "@/components/app/learning/Prose";
import { QueryState } from "@/components/ui/QueryState";
import {
  useGetQuestionQuery,
  useSetBookmarkMutation,
  useSetSolvedMutation,
} from "@/lib/api/endpoints/questions";
import { errorMessage } from "@/lib/api/errors";
import type { QuestionDetail } from "@/lib/api/types";
import { track } from "@/lib/analytics";

function Body({ question }: { question: QuestionDetail }) {
  const [setBookmark, { isLoading: saving }] = useSetBookmarkMutation();
  const [setSolved, { isLoading: solving }] = useSetSolvedMutation();
  const [showAnswer, setShowAnswer] = useState(false);

  async function toggle(kind: "bookmark" | "solve") {
    const on = kind === "bookmark" ? !question.bookmarked : !question.solved;
    const run = kind === "bookmark" ? setBookmark : setSolved;
    try {
      await run({ id: question.id, on }).unwrap();
      if (on) track(kind === "bookmark" ? "question_bookmarked" : "question_solved", {});
    } catch (error) {
      // The button already flipped back; say why.
      toast.error(errorMessage(error));
    }
  }

  const solvedOn = question.solved_at
    ? new Date(question.solved_at).toLocaleDateString(undefined, { dateStyle: "medium" })
    : null;

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-3">
        <Link
          href={`/questions?skill=${question.skill.slug}`}
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 inline-flex items-center gap-1 rounded text-sm outline-none focus-visible:ring-3"
        >
          <ArrowLeft className="size-4" aria-hidden /> {question.skill.name} questions
        </Link>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">{question.title}</h1>
        <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
          <DifficultyBars level={question.difficulty} />
          <span aria-hidden>·</span>
          <span>{question.topic}</span>
          {question.company ? <Badge variant="outline">{question.company}</Badge> : null}
          {question.role ? <Badge variant="outline">{question.role}</Badge> : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={question.solved ? "default" : "outline"}
          aria-pressed={question.solved}
          disabled={solving}
          onClick={() => void toggle("solve")}
          className="pointer-coarse:h-11"
        >
          <Check />
          {question.solved ? "Solved" : "Mark solved"}
        </Button>
        <Button
          variant="outline"
          aria-pressed={question.bookmarked}
          disabled={saving}
          onClick={() => void toggle("bookmark")}
          className="pointer-coarse:h-11"
        >
          {question.bookmarked ? <BookmarkCheck /> : <Bookmark />}
          {question.bookmarked ? "Bookmarked" : "Bookmark"}
        </Button>
        {solvedOn ? (
          <span className="text-muted-foreground text-sm">Solved on {solvedOn}</span>
        ) : null}
      </div>

      <section aria-label="Question" className="bg-card rounded-2xl border p-5 shadow-xs">
        <Prose text={question.body} className="text-foreground" />
      </section>

      {question.answer ? (
        <section aria-labelledby="answer" className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 id="answer" className="text-foreground text-base font-semibold">
              Model answer
            </h2>
            <Button
              variant="ghost"
              size="sm"
              aria-expanded={showAnswer}
              aria-controls="answer-body"
              onClick={() => setShowAnswer(!showAnswer)}
              className="pointer-coarse:h-11"
            >
              {showAnswer ? <EyeOff /> : <Eye />}
              {showAnswer ? "Hide answer" : "Show answer"}
            </Button>
          </div>
          {showAnswer ? (
            <div id="answer-body" className="bg-muted/50 rounded-2xl border p-5">
              <Prose text={question.answer} className="text-foreground" />
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              Try answering out loud first, the way you would in an interview. Then compare.
            </p>
          )}
        </section>
      ) : null}

      <Link
        href={`/questions?skill=${question.skill.slug}&status=unsolved`}
        className="text-foreground focus-visible:ring-ring/50 inline-flex items-center gap-1 rounded text-sm font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-3"
      >
        More {question.skill.name} questions you haven&apos;t solved
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </article>
  );
}

/** /questions/[id] — one interview question: practise, reveal the answer, track it. */
export function QuestionView({ id }: { id: string }) {
  const query = useGetQuestionQuery(id);
  return (
    <QueryState
      query={query}
      skeleton={<Skeleton className="mx-auto h-96 max-w-3xl rounded-2xl" aria-hidden />}
      errorTitle="Couldn't load this question"
    >
      {(question) => <Body question={question} />}
    </QueryState>
  );
}
