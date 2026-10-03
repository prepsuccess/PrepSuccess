"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, Check, CircleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/shadcn/alert";
import { Badge } from "@/components/shadcn/badge";
import { Button } from "@/components/shadcn/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/shadcn/card";
import { Progress } from "@/components/shadcn/progress";
import { Skeleton } from "@/components/shadcn/skeleton";
import { Textarea } from "@/components/shadcn/textarea";
import { QueryState } from "@/components/ui/QueryState";
import { Spinner } from "@/components/ui/Spinner";
import { errorMessage, fieldErrors } from "@/lib/api/errors";
import { useGetTaskQuery, useSubmitTaskMutation } from "@/lib/api/endpoints/learning";
import type { TaskDetail, TaskSubmission } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";
import { track } from "@/lib/analytics";
import { Prose } from "./Prose";

const MIN_CHARS = 20;
const MAX_CHARS = 10_000;

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

function SubmitForm({ task, latest }: { task: TaskDetail; latest?: TaskSubmission }) {
  const [submit, { isLoading, error, reset }] = useSubmitTaskMutation();
  const [content, setContent] = useState(latest?.content ?? "");
  const fieldId = useId();
  const hintId = useId();
  const length = content.trim().length;
  const invalid = fieldErrors(error).content;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (length < MIN_CHARS || isLoading) return;
    try {
      const result = await submit({ id: task.id, content }).unwrap();
      track("task_submitted", { passed: result.passed });
    } catch {
      // Shown below.
    }
  }

  return (
    <Card>
      <form onSubmit={onSubmit}>
        <CardHeader>
          <CardTitle>
            <label htmlFor={fieldId}>{latest ? "Try again" : "Your answer"}</label>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            id={fieldId}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (error) reset();
            }}
            rows={12}
            maxLength={MAX_CHARS}
            spellCheck={false}
            disabled={isLoading}
            aria-describedby={hintId}
            aria-invalid={Boolean(invalid)}
            placeholder="Write your code or answer here."
            className="min-h-48 font-mono text-[13px]"
          />
          <p id={hintId} className="text-muted-foreground flex justify-between gap-3 text-xs">
            <span>
              {invalid ??
                (length < MIN_CHARS
                  ? `At least ${MIN_CHARS} characters.`
                  : "The AI marks only what's written here.")}
            </span>
            <span className="tabular-nums">
              {content.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
            </span>
          </p>
          {error && !invalid ? (
            <Alert variant="destructive">
              <CircleAlert />
              <AlertTitle>Your answer wasn&apos;t reviewed</AlertTitle>
              <AlertDescription>
                {errorMessage(error)} Your answer is still here — try again.
              </AlertDescription>
            </Alert>
          ) : null}
          {isLoading ? (
            <p role="status" className="text-muted-foreground text-sm">
              The AI is marking your answer. This can take up to a minute.
            </p>
          ) : null}
        </CardContent>
        <CardFooter className="mt-4 justify-end border-t">
          <Button type="submit" disabled={length < MIN_CHARS || isLoading}>
            {isLoading ? <Spinner className="size-4" /> : null}
            {isLoading ? "Reviewing…" : "Submit for review"}
          </Button>
        </CardFooter>
      </form>
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

      <SubmitForm key={latest?.id ?? "new"} task={task} latest={latest} />

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
  );
}

/** /tasks/[id] — the task, how it's marked, the answer box and the AI's feedback. */
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
