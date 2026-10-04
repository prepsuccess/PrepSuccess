"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { Badge } from "@/components/shadcn/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/card";
import { Progress } from "@/components/shadcn/progress";
import { Skeleton } from "@/components/shadcn/skeleton";
import { QueryState } from "@/components/ui/QueryState";
import { useGetTaskQuery } from "@/lib/api/endpoints/learning";
import type { TaskDetail, TaskSubmission } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";
import { TaskWorkspace } from "./editor/TaskWorkspace";
import { Prose } from "./Prose";

const points = (n: number) => `${n} point${n === 1 ? "" : "s"}`;

/** One reviewed attempt: score, verdict, per-criterion marks and what to fix. */
export function SubmissionFeedback({
  submission,
  heading = "Feedback",
}: {
  submission: TaskSubmission;
  heading?: string;
}) {
  const { feedback } = submission;
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <CardTitle>{heading}</CardTitle>
            <p className="text-foreground mt-2 text-4xl font-semibold tabular-nums">
              {submission.percent}%
            </p>
          </div>
          {submission.passed ? (
            <Badge className="bg-success/10 text-success h-7 px-3 text-sm">Passed</Badge>
          ) : (
            <Badge variant="destructive" className="h-7 px-3 text-sm">
              Not yet
            </Badge>
          )}
        </div>
        <Progress
          value={submission.percent}
          aria-label="Your score"
          getValueLabel={() => `${submission.percent}%, pass mark ${submission.pass_mark}%`}
          className="mt-3 h-2"
        />
      </CardHeader>
      <CardContent className="space-y-5 text-sm">
        {feedback.summary ? <p className="text-foreground">{feedback.summary}</p> : null}

        <ul className="space-y-2">
          {feedback.criteria.map((c) => (
            <li key={c.id} className="rounded-lg border p-3">
              <div className="flex items-start justify-between gap-3">
                <p className="text-foreground font-medium">{c.description}</p>
                <span
                  className={cn(
                    "shrink-0 text-xs font-medium tabular-nums",
                    c.score >= c.points ? "text-success" : "text-muted-foreground",
                  )}
                >
                  {c.score} / {c.points}
                </span>
              </div>
              <p className="text-muted-foreground mt-1">{c.comment}</p>
            </li>
          ))}
        </ul>

        <div className="grid gap-4 sm:grid-cols-2">
          {feedback.strengths.length ? (
            <div>
              <h3 className="text-foreground mb-2 font-semibold">What went well</h3>
              <ul className="space-y-1.5">
                {feedback.strengths.map((s) => (
                  <li key={s} className="flex gap-2">
                    <Check className="text-success mt-0.5 size-4 shrink-0" aria-hidden />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {feedback.improvements.length ? (
            <div>
              <h3 className="text-foreground mb-2 font-semibold">What to fix</h3>
              <ol className="list-decimal space-y-1.5 pl-5">
                {feedback.improvements.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function TaskBody({ task }: { task: TaskDetail }) {
  const [latest, ...earlier] = task.submissions;
  const feedbackRef = useRef<HTMLDivElement>(null);
  const latestId = latest?.id;
  const seen = useRef(latestId);

  // Bring new feedback into view (and to screen readers) when a review lands.
  useEffect(() => {
    if (latestId && latestId !== seen.current) {
      feedbackRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      feedbackRef.current?.focus();
    }
    seen.current = latestId;
  }, [latestId]);

  return (
    // Phones: title, task, feedback, then the editor. Laptops and up: the task
    // scrolls on the left while the editor fills the window on the right,
    // like a coding platform (the app sidebar starts collapsed here).
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <div className="space-y-6">
        <div className="space-y-2">
          <Link
            href={`/learn/${task.skill.slug}`}
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="size-4" aria-hidden /> {task.skill.name}
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-foreground text-2xl font-semibold tracking-tight">{task.title}</h1>
            <Badge variant="outline" className="capitalize">
              {task.difficulty}
            </Badge>
          </div>
        </div>

        <Card>
          <CardContent className="space-y-5">
            <Prose text={task.description} className="text-foreground" />
            <div className="bg-muted rounded-lg p-4 text-sm">
              <h2 className="text-foreground mb-2 font-semibold">
                How it&apos;s marked · pass mark {task.pass_mark}%
              </h2>
              <ul className="space-y-1">
                {task.rubric.map((c) => (
                  <li key={c.id} className="flex justify-between gap-3">
                    <span>{c.description}</span>
                    <span className="text-muted-foreground shrink-0 tabular-nums">
                      {points(c.points)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {latest ? (
          <div ref={feedbackRef} tabIndex={-1} className="outline-none">
            <SubmissionFeedback submission={latest} heading="Latest feedback" />
          </div>
        ) : null}

        {earlier.length ? (
          <details className="group">
            <summary className="text-muted-foreground hover:text-foreground cursor-pointer text-sm">
              Earlier attempts ({earlier.length})
            </summary>
            <ol className="mt-3 space-y-3">
              {earlier.map((s) => (
                <li key={s.id}>
                  <SubmissionFeedback
                    submission={s}
                    heading={new Date(s.created_at).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  />
                </li>
              ))}
            </ol>
          </details>
        ) : null}
      </div>

      <div className="lg:sticky lg:top-20">
        {/* Keyed by task and attempt: a new task or a new review starts a fresh editor. */}
        <TaskWorkspace key={`${task.id}:${latest?.id ?? "new"}`} task={task} latest={latest} />
      </div>
    </div>
  );
}

/** /tasks/[id] — the task, how it's marked, the editor and the AI's feedback. */
export function TaskView({ id }: { id: string }) {
  const query = useGetTaskQuery(id);
  return (
    <QueryState
      query={query}
      skeleton={<Skeleton className="h-96 w-full rounded-xl" aria-hidden />}
      errorTitle="Couldn't load this task"
    >
      {(task) => <TaskBody task={task} />}
    </QueryState>
  );
}
