"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Bot,
  Check,
  CircleAlert,
  Eye,
  EyeOff,
  Plus,
  RotateCcw,
} from "lucide-react";
import { Badge } from "@/components/shadcn/badge";
import { Button } from "@/components/shadcn/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/card";
import { Skeleton } from "@/components/shadcn/skeleton";
import { DifficultyBars } from "@/components/app/DifficultyBars";
import { TextareaField } from "@/components/app/form-fields";
import { useCoach } from "@/components/app/coach/CoachProvider";
import { Prose } from "@/components/app/learning/Prose";
import { QueryState } from "@/components/ui/QueryState";
import { Spinner } from "@/components/ui/Spinner";
import {
  useAttemptQuestionMutation,
  useGetQuestionQuery,
  useSetBookmarkMutation,
  useSetSolvedMutation,
  type QuestionAttempt,
  type QuestionFeedback,
  type QuestionWithAttempt,
} from "@/lib/api/endpoints/questions";
import { errorMessage, fieldErrors } from "@/lib/api/errors";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils/cn";

const ANSWER_MAX_CHARS = 4000;

const VERDICT: Record<QuestionFeedback["verdict"], { label: string; className: string }> = {
  strong: { label: "Strong", className: "bg-success/10 text-success" },
  partial: { label: "Partly there", className: "bg-secondary text-secondary-foreground" },
  weak: { label: "Needs work", className: "bg-destructive/10 text-destructive" },
};

/** Score, verdict, what they covered, what to add and one tip. */
function FeedbackCard({
  attempt,
  onTryAgain,
}: {
  attempt: QuestionAttempt;
  /** Given while the answer box is locked. */
  onTryAgain?: () => void;
}) {
  const { feedback } = attempt;
  const verdict = VERDICT[feedback.verdict];
  return (
    <Card aria-labelledby="feedback-title">
      <CardHeader>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <CardTitle id="feedback-title">Feedback</CardTitle>
            <p className="text-foreground mt-2 text-4xl font-semibold tabular-nums">
              {feedback.score}/10
            </p>
          </div>
          <Badge className={cn("h-7 px-3 text-sm", verdict.className)}>{verdict.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 text-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="text-foreground mb-2 font-semibold">What you covered</h3>
            {feedback.strengths.length ? (
              <ul className="space-y-1.5">
                {feedback.strengths.map((s) => (
                  <li key={s} className="flex gap-2">
                    <Check className="text-success mt-0.5 size-4 shrink-0" aria-hidden />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">
                Not much yet. Have a look at the model answer.
              </p>
            )}
          </div>
          <div>
            <h3 className="text-foreground mb-2 font-semibold">What to add</h3>
            {feedback.missing.length ? (
              <ul className="space-y-1.5">
                {feedback.missing.map((s) => (
                  <li key={s} className="flex gap-2">
                    <Plus className="text-muted-foreground mt-0.5 size-4 shrink-0" aria-hidden />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Nothing important. Nice work.</p>
            )}
          </div>
        </div>
        {feedback.tip ? (
          <p className="bg-muted/50 text-foreground rounded-lg border p-3">
            <span className="font-semibold">Tip: </span>
            {feedback.tip}
          </p>
        ) : null}
        {onTryAgain ? (
          <Button variant="outline" onClick={onTryAgain} className="pointer-coarse:h-11">
            <RotateCcw />
            Try again
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

/** "Your answer": write it the way you'd say it, then get AI feedback against the model answer. */
function AnswerPractice({ question }: { question: QuestionWithAttempt }) {
  const latest = question.my_attempt ?? null;
  const [attempt, { isLoading: checking, error, reset }] = useAttemptQuestionMutation();
  const [draft, setDraft] = useState(latest?.answer ?? "");
  // Locked once there's feedback; "Try again" opens it up.
  const [editing, setEditing] = useState(!latest);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const answer = draft.trim();
    if (!answer || checking) return;
    try {
      await attempt({ id: question.id, answer }).unwrap();
      setEditing(false);
    } catch {
      // Shown under the box; the answer stays so it can be sent again.
    }
  }

  const problem = error ? (fieldErrors(error).answer ?? errorMessage(error)) : null;

  return (
    <section aria-labelledby="your-answer" className="space-y-3">
      <h2 id="your-answer" className="text-foreground text-base font-semibold">
        Practise your answer
      </h2>
      <form onSubmit={(event) => void onSubmit(event)} className="space-y-3">
        <TextareaField
          label="Your answer"
          description="Answer the way you would out loud in the interview, then get feedback."
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            if (error) reset();
          }}
          readOnly={!editing || checking}
          maxLength={ANSWER_MAX_CHARS}
          rows={6}
        />
        {problem ? (
          <p role="alert" className="text-destructive flex items-start gap-2 text-sm">
            <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            {problem}
          </p>
        ) : null}
        {editing ? (
          <Button
            type="submit"
            disabled={!draft.trim() || checking}
            className="pointer-coarse:h-11"
          >
            {checking ? <Spinner className="size-4" /> : null}
            {checking ? "Checking…" : "Get feedback"}
          </Button>
        ) : null}
      </form>
      {latest ? (
        <FeedbackCard attempt={latest} onTryAgain={editing ? undefined : () => setEditing(true)} />
      ) : null}
    </section>
  );
}

function Body({ question }: { question: QuestionWithAttempt }) {
  const [setBookmark, { isLoading: saving }] = useSetBookmarkMutation();
  const [setSolved, { isLoading: solving }] = useSetSolvedMutation();
  const [showAnswer, setShowAnswer] = useState(false);
  const coach = useCoach();
  const setCoachContext = coach?.setContext;

  // While this page is open, the coach knows which question "this question" is.
  useEffect(() => {
    if (!setCoachContext) return;
    setCoachContext({ questionId: question.id, label: question.title });
    return () => setCoachContext(null);
  }, [setCoachContext, question.id, question.title]);

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
        {coach && !coach.hidden ? (
          <Button
            variant="ghost"
            onClick={() => {
              // Brings the question back if it was dropped from the chat.
              coach.setContext({ questionId: question.id, label: question.title });
              coach.openCoach();
            }}
            className="pointer-coarse:h-11"
          >
            <Bot />
            Ask coach about this question
          </Button>
        ) : null}
        {solvedOn ? (
          <span className="text-muted-foreground text-sm">Solved on {solvedOn}</span>
        ) : null}
      </div>

      <section aria-label="Question" className="bg-card rounded-2xl border p-5 shadow-xs">
        <Prose text={question.body} className="text-foreground" />
      </section>

      <AnswerPractice key={question.id} question={question} />

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
