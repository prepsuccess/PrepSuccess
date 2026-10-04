"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  Check,
  CircleAlert,
  GraduationCap,
  MessagesSquare,
  RotateCw,
  X,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/shadcn/alert";
import { Badge } from "@/components/shadcn/badge";
import { Button } from "@/components/shadcn/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/shadcn/card";
import { Progress } from "@/components/shadcn/progress";
import { Skeleton } from "@/components/shadcn/skeleton";
import { QueryState } from "@/components/ui/QueryState";
import { Spinner } from "@/components/ui/Spinner";
import { errorMessage, isApiError } from "@/lib/api/errors";
import { useGetQuestionFiltersQuery } from "@/lib/api/endpoints/questions";
import { useAnswerQuestionMutation, useGetAssessmentQuery } from "@/lib/api/endpoints/skills";
import type { AnsweredQuestion, AssessmentQuestion, AssessmentState } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";
import { track } from "@/lib/analytics";
import { ResourceList } from "@/components/app/learning/ResourceList";
import { InlineText, RichText } from "./RichText";
import { useStartCheck } from "./useStartCheck";

const LETTERS = ["A", "B", "C", "D"];

function CheckSkeleton() {
  return (
    <Card aria-hidden>
      <CardHeader className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-2 w-full rounded-full" />
        <Skeleton className="h-5 w-3/4" />
      </CardHeader>
      <CardContent className="space-y-2">
        {LETTERS.map((letter) => (
          <Skeleton key={letter} className="h-12 w-full rounded-lg" />
        ))}
      </CardContent>
    </Card>
  );
}

/** "Question 2 of 5", the difficulty, and a progress bar. */
function CheckHeader({
  number,
  total,
  answered,
  difficulty,
}: {
  number: number;
  total: number;
  answered: number;
  difficulty: AssessmentQuestion["difficulty"];
}) {
  return (
    <CardHeader className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-muted-foreground text-sm">
          Question {number} of {total}
        </p>
        <Badge variant="outline" className="capitalize">
          {difficulty}
        </Badge>
      </div>
      <Progress
        value={Math.round((answered / total) * 100)}
        aria-label="Questions answered"
        getValueLabel={() => `${answered} of ${total} answered`}
        className="h-1.5"
      />
    </CardHeader>
  );
}

function QuestionStep({
  state,
  question,
}: {
  state: AssessmentState;
  question: AssessmentQuestion;
}) {
  const [answer, { isLoading, error, reset }] = useAnswerQuestionMutation();
  const query = useGetAssessmentQuery(state.id);
  const [choice, setChoice] = useState<number | null>(null);
  // The check moved on elsewhere (a double click, another tab): reload to catch up.
  const finished = isApiError(error) && error.code === "ASSESSMENT_COMPLETE";
  const stale = finished || (isApiError(error) && error.code === "QUESTION_ALREADY_ANSWERED");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (choice === null || isLoading) return;
    try {
      const next = await answer({
        id: state.id,
        question_id: question.id,
        choice_index: choice,
      }).unwrap();
      if (next.status === "completed" && next.result) {
        track("skill_check_completed", {
          category: next.skill.category,
          mastered: next.result.mastery === "mastered",
        });
      }
    } catch {
      // Shown below.
    }
  }

  return (
    <Card>
      <CheckHeader
        number={question.number}
        total={state.total_questions}
        answered={state.answered}
        difficulty={question.difficulty}
      />
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-5">
          <fieldset
            className="space-y-4"
            disabled={isLoading}
            aria-labelledby={`question-${question.id}`}
          >
            {/* Not a <legend>: questions can hold code blocks, which a legend can't contain. */}
            <div
              id={`question-${question.id}`}
              className="text-foreground mb-4 text-base leading-relaxed font-medium"
            >
              <RichText text={question.question} />
            </div>
            <div className="space-y-2">
              {question.options.map((option, index) => (
                <label
                  key={index}
                  className={cn(
                    "border-border hover:bg-muted/50 flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition-colors",
                    "has-checked:border-primary has-checked:bg-primary/5 has-focus-visible:ring-ring/50 has-focus-visible:ring-3",
                    "has-disabled:cursor-not-allowed has-disabled:opacity-70",
                  )}
                >
                  <input
                    type="radio"
                    name="choice"
                    value={index}
                    checked={choice === index}
                    onChange={() => setChoice(index)}
                    className="sr-only"
                  />
                  <span
                    aria-hidden
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                      choice === index
                        ? "border-primary bg-primary text-primary-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {LETTERS[index]}
                  </span>
                  <span className="text-foreground pt-0.5">
                    <InlineText text={option} />
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          {error ? (
            <Alert variant="destructive">
              <CircleAlert />
              <AlertTitle>Your answer wasn&apos;t saved</AlertTitle>
              <AlertDescription>
                {errorMessage(error)}
                {stale ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={() => {
                      reset();
                      void query.refetch();
                    }}
                  >
                    <RotateCw />
                    {finished ? "See results" : "Reload"}
                  </Button>
                ) : null}
              </AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
        <CardFooter className="mt-5 justify-end border-t">
          <Button type="submit" disabled={choice === null || isLoading}>
            {isLoading ? <Spinner className="size-4" /> : null}
            {isLoading ? "Checking…" : "Submit answer"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

/** One option as it looks after answering: the right one ticked, a wrong pick crossed. */
function MarkedOption({
  option,
  index,
  answer,
}: {
  option: string;
  index: number;
  answer: AnsweredQuestion;
}) {
  const right = index === answer.correct_index;
  const picked = index === answer.chosen_index;
  return (
    <li
      className={cn(
        "flex items-start gap-3 rounded-lg border p-3 text-sm",
        right && "border-success bg-success/5",
        picked && !right && "border-destructive bg-destructive/5",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
          right && "border-success bg-success text-white",
          picked && !right && "border-destructive bg-destructive text-white",
        )}
      >
        {right ? (
          <Check className="size-3.5" />
        ) : picked ? (
          <X className="size-3.5" />
        ) : (
          LETTERS[index]
        )}
      </span>
      <span className="text-foreground min-w-0 flex-1 pt-0.5">
        <InlineText text={option} />
      </span>
      {right || picked ? (
        <span
          className={cn(
            "shrink-0 pt-0.5 text-xs font-medium",
            right ? "text-success" : "text-destructive",
          )}
        >
          {right ? (picked ? "Your answer · right" : "Right answer") : "Your answer"}
        </span>
      ) : null}
    </li>
  );
}

function FeedbackStep({
  state,
  answer,
  onNext,
}: {
  state: AssessmentState;
  answer: AnsweredQuestion;
  onNext: () => void;
}) {
  const next = useRef<HTMLButtonElement>(null);
  useEffect(() => next.current?.focus(), []);
  return (
    <Card>
      <CheckHeader
        number={answer.number}
        total={state.total_questions}
        answered={state.answered}
        difficulty={answer.difficulty}
      />
      <CardContent className="space-y-5">
        <div role="status" className="flex items-center gap-2">
          {answer.correct ? (
            <p className="text-success flex items-center gap-2 font-semibold">
              <Check className="size-4" aria-hidden /> Correct
            </p>
          ) : (
            <p className="text-destructive flex items-center gap-2 font-semibold">
              <X className="size-4" aria-hidden /> Not quite
            </p>
          )}
        </div>
        <div className="text-foreground text-base leading-relaxed font-medium">
          <RichText text={answer.question} />
        </div>
        <ol className="space-y-2">
          {answer.options.map((option, index) => (
            <MarkedOption key={index} option={option} index={index} answer={answer} />
          ))}
        </ol>
        <div className="bg-muted rounded-lg p-3 text-sm">
          <p className="text-foreground mb-1 font-medium">Why</p>
          <p className="text-muted-foreground">
            <InlineText text={answer.explanation} />
          </p>
        </div>
      </CardContent>
      <CardFooter className="justify-end border-t">
        <Button ref={next} onClick={onNext}>
          {state.status === "completed" ? "See your result" : "Next question"}
        </Button>
      </CardFooter>
    </Card>
  );
}

function ResultStep({ state }: { state: AssessmentState }) {
  const { startCheck, starting, dialog } = useStartCheck();
  const result = state.result!;
  const mastered = result.mastery === "mastered";
  const right = state.answers.filter((a) => a.correct).length;
  // Link to interview questions only when this skill has some (or the counts didn't load).
  const questionFilters = useGetQuestionFiltersQuery(undefined);
  const hasQuestions = questionFilters.isError
    ? true
    : !!questionFilters.data?.skills.some((s) => s.slug === state.skill.slug && s.count > 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-muted-foreground text-sm">{state.skill.name}</p>
              <p className="text-foreground text-5xl font-semibold tracking-tight tabular-nums">
                {result.percent}%
              </p>
            </div>
            {mastered ? (
              <Badge className="bg-success/10 text-success h-7 px-3 text-sm">Mastered</Badge>
            ) : (
              <Badge variant="destructive" className="h-7 px-3 text-sm">
                Needs revision
              </Badge>
            )}
          </div>
          <div className="relative">
            <Progress
              value={result.percent}
              aria-label="Your score"
              getValueLabel={() => `${result.percent}%, pass mark ${result.threshold}%`}
              className="h-2.5"
            />
            {/* Pass-mark tick. */}
            <span
              aria-hidden
              className="bg-foreground absolute -top-1 h-4.5 w-0.5 rounded"
              style={{ left: `${result.threshold}%` }}
            />
          </div>
          <p className="text-muted-foreground text-sm">
            {mastered
              ? `You're at or above the ${result.threshold}% pass mark.`
              : `${result.percent}% is below the ${result.threshold}% pass mark. Go through the answers below, then retake when you're ready.`}{" "}
            {right} of {state.total_questions} right · {result.score} of {result.max_score} points
            (harder questions are worth more).
          </p>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2 border-t">
          <Button asChild>
            <Link href="/assessment">
              <ArrowLeft />
              Back to skill checks
            </Link>
          </Button>
          <Button
            variant="outline"
            disabled={starting}
            onClick={() => startCheck({ id: state.skill.id, name: state.skill.name })}
          >
            <RotateCw />
            Retake
          </Button>
          <Button asChild variant="ghost">
            <Link href={`/learn/${state.skill.slug}`}>
              <GraduationCap />
              Study {state.skill.name}
            </Link>
          </Button>
          {hasQuestions ? (
            <Button asChild variant="ghost">
              <Link href={`/questions?skill=${encodeURIComponent(state.skill.slug)}`}>
                <MessagesSquare />
                Practise {state.skill.name} interview questions
              </Link>
            </Button>
          ) : null}
        </CardFooter>
      </Card>

      {mastered ? null : (
        <section aria-labelledby="study-first" className="space-y-3">
          <div>
            <h2 id="study-first" className="text-foreground text-base font-semibold">
              Study before you retake
            </h2>
            <p className="text-muted-foreground text-sm">
              Hand-picked material for {state.skill.name}.{" "}
              <Link
                href={`/learn/${state.skill.slug}`}
                className="text-foreground underline underline-offset-4"
              >
                See everything, plus practical tasks
              </Link>
              .
            </p>
          </div>
          <ResourceList slug={state.skill.slug} limit={3} />
        </section>
      )}

      <section aria-labelledby="your-answers" className="space-y-3">
        <h2 id="your-answers" className="text-foreground text-base font-semibold">
          Your answers
        </h2>
        <ol className="space-y-3">
          {state.answers.map((answer) => (
            <li key={answer.id}>
              <Card size="sm">
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span
                      className={cn(
                        "flex items-center gap-1.5 font-medium",
                        answer.correct ? "text-success" : "text-destructive",
                      )}
                    >
                      {answer.correct ? (
                        <Check className="size-3.5" aria-hidden />
                      ) : (
                        <X className="size-3.5" aria-hidden />
                      )}
                      Question {answer.number} · {answer.correct ? "Right" : "Wrong"}
                    </span>
                    <Badge variant="outline" className="capitalize">
                      {answer.difficulty}
                    </Badge>
                  </div>
                  <div className="text-foreground text-sm font-medium">
                    <RichText text={answer.question} />
                  </div>
                  <ol className="space-y-1.5">
                    {answer.options.map((option, index) => (
                      <MarkedOption key={index} option={option} index={index} answer={answer} />
                    ))}
                  </ol>
                  <p className="text-muted-foreground text-sm">
                    <InlineText text={answer.explanation} />
                  </p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      </section>
      {dialog}
    </div>
  );
}

function CheckFlow({ state }: { state: AssessmentState }) {
  // Answers the student has moved past. A newer answer in the cache is shown
  // as feedback first, so the next question never replaces it unseen.
  const [acknowledged, setAcknowledged] = useState(state.answered);
  const reviewing = state.answered > acknowledged ? state.answers.at(-1) : undefined;

  if (reviewing) {
    return (
      <FeedbackStep
        state={state}
        answer={reviewing}
        onNext={() => setAcknowledged(state.answered)}
      />
    );
  }
  if (state.status === "completed" && state.result) return <ResultStep state={state} />;
  if (state.current_question) {
    return (
      <QuestionStep
        key={state.current_question.id}
        state={state}
        question={state.current_question}
      />
    );
  }
  return null;
}

/** One skill check: question → feedback → … → result. */
export function SkillCheck({ id }: { id: string }) {
  const query = useGetAssessmentQuery(id);
  return (
    <QueryState query={query} skeleton={<CheckSkeleton />} errorTitle="Couldn't load this check">
      {(state) => <CheckFlow state={state} />}
    </QueryState>
  );
}
