"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { ArrowUp, Check, CircleAlert, PartyPopper, RotateCw, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/shadcn/alert";
import { Badge } from "@/components/shadcn/badge";
import { Button } from "@/components/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/card";
import { Progress } from "@/components/shadcn/progress";
import { Skeleton } from "@/components/shadcn/skeleton";
import { Textarea } from "@/components/shadcn/textarea";
import { QueryState } from "@/components/ui/QueryState";
import { errorMessage } from "@/lib/api/errors";
import {
  useGetOnboardingQuery,
  useSendOnboardingMessageMutation,
} from "@/lib/api/endpoints/onboarding";
import type { OnboardingMessage, OnboardingState, StudentProfile } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";
import { track } from "@/lib/analytics";
import { SkillPicker } from "./SkillPicker";

const MAX_LENGTH = 1000;

function ChatSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]" aria-hidden>
      <Card className="min-h-[28rem]">
        <CardContent className="space-y-3">
          <Skeleton className="h-16 w-3/4 rounded-2xl" />
          <Skeleton className="ml-auto h-10 w-1/2 rounded-2xl" />
          <Skeleton className="h-12 w-2/3 rounded-2xl" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-2 w-full rounded-full" />
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-4 w-40" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Bubble({ message }: { message: OnboardingMessage }) {
  const mine = message.role === "user";
  return (
    <li className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
          mine
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-muted text-foreground rounded-bl-md",
        )}
      >
        <span className="sr-only">{mine ? "You: " : "Coach: "}</span>
        {message.content}
      </div>
    </li>
  );
}

function TypingIndicator() {
  return (
    <li className="flex justify-start" aria-label="Coach is typing">
      <div className="bg-muted flex items-center gap-1 rounded-2xl rounded-bl-md px-4 py-3.5">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="bg-muted-foreground/60 size-1.5 animate-bounce rounded-full motion-reduce:animate-none"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </li>
  );
}

/** "x of 5" with a checklist of what the coach still needs. */
function ProgressPanel({ state }: { state: OnboardingState }) {
  const { collected, total, items } = state.progress;
  return (
    <Card className="lg:sticky lg:top-20">
      <CardHeader>
        <CardTitle>
          {collected} of {total} details
        </CardTitle>
        <CardDescription>What the coach needs to pick your skill checks.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress
          value={Math.round((collected / total) * 100)}
          aria-label="Onboarding progress"
          getValueLabel={() => `${collected} of ${total} details`}
          className="h-2"
        />
        <ul className="space-y-2.5 text-sm">
          {items.map((item) => (
            <li key={item.field} className="flex items-center gap-2.5">
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full border",
                  item.done
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-transparent",
                )}
                aria-hidden
              >
                <Check className="size-3" strokeWidth={3} />
              </span>
              <span className={item.done ? "text-foreground" : "text-muted-foreground"}>
                {item.label}
                <span className="sr-only">{item.done ? " — done" : " — still needed"}</span>
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
      {state.completed ? null : (
        <CardFooter className="border-t">
          <p className="text-muted-foreground text-xs">
            Your answers save as you go.{" "}
            <Link href="/dashboard" className="text-foreground underline underline-offset-4">
              Finish later
            </Link>
          </p>
        </CardFooter>
      )}
    </Card>
  );
}

const asList = (value: unknown) => (Array.isArray(value) ? (value as string[]) : []);

/** Shown in place of the message box once every required detail is in. */
function CompletionCard({ profile }: { profile: StudentProfile }) {
  const skills = asList(profile.skills);
  const goals = asList(profile.goals);
  const rows: [string, string | undefined][] = [
    [
      "Studying",
      [profile.degree, profile.student_year ? `year ${profile.student_year}` : null]
        .filter(Boolean)
        .join(", ") || undefined,
    ],
    ["Aiming for", profile.target_role],
    ["Goals", goals.join(" · ") || undefined],
  ];
  return (
    <div className="border-t p-4 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full">
          <PartyPopper className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <h2 className="text-foreground font-medium">You&apos;re all set</h2>
            <p className="text-muted-foreground text-sm">
              Here&apos;s what the coach learned. You can change any of it on your profile.
            </p>
          </div>
          <dl className="grid gap-2 text-sm sm:grid-cols-[7rem_1fr]">
            {rows
              .filter(([, value]) => value)
              .map(([label, value]) => (
                <div key={label} className="contents">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="text-foreground">{value}</dd>
                </div>
              ))}
            {skills.length ? (
              <div className="contents">
                <dt className="text-muted-foreground">Skills</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </dd>
              </div>
            ) : null}
          </dl>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button asChild>
              <Link href="/dashboard">Go to your dashboard</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/profile">Edit details</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Chat({ state }: { state: OnboardingState }) {
  const [send, { isLoading: sending }] = useSendOnboardingMessageMutation();
  const [draft, setDraft] = useState("");
  const [failed, setFailed] = useState<{
    content: string;
    skills?: string[];
    error: unknown;
  } | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // The coach is on the skills question: offer chips so the student picks
  // exactly what's saved, instead of trusting free text to the AI. Only when
  // the server sent the options (an older API doesn't); typing always works.
  const skillOptions = state.skill_options as OnboardingState["skill_options"] | undefined;
  const askingSkills =
    Boolean(skillOptions?.stacks?.length || skillOptions?.topics?.length) &&
    state.progress.items.find((item) => !item.done)?.field === "skills";

  // Keep the newest message (or the typing dots) in view.
  useEffect(() => {
    const list = listRef.current;
    list?.scrollTo?.({ top: list.scrollHeight, behavior: "smooth" });
  }, [state.messages.length, sending, failed]);

  async function deliver(content: string, skills?: string[]) {
    setFailed(null);
    try {
      const reply = await send({ content, skills }).unwrap();
      if (reply.onboarding.completed && !state.completed) track("onboarding_completed");
      inputRef.current?.focus();
    } catch (error) {
      // Nothing was saved; give the text back so it can be resent or edited.
      setFailed({ content, skills, error });
      if (!skills) setDraft((current) => current || content);
    }
  }

  function onSubmit(event?: FormEvent) {
    event?.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;
    setDraft("");
    void deliver(content);
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      onSubmit();
    }
  }

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <Card className="gap-0 py-0">
        <div className="flex items-center gap-2.5 border-b px-4 py-3 sm:px-6">
          <span className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-full">
            <Sparkles className="size-4" aria-hidden />
          </span>
          <div className="leading-tight">
            <p className="text-foreground text-sm font-medium">PrepSuccess coach</p>
            <p className="text-muted-foreground text-xs">AI · replies in a few seconds</p>
          </div>
        </div>

        <div
          ref={listRef}
          className="h-[min(60dvh,34rem)] min-h-72 overflow-y-auto px-4 py-5 sm:px-6"
        >
          <ol className="space-y-3" role="log" aria-live="polite" aria-label="Onboarding chat">
            {state.messages.map((message, index) => (
              <Bubble key={`${index}-${message.created_at}`} message={message} />
            ))}
            {sending ? <TypingIndicator /> : null}
          </ol>
        </div>

        {state.completed ? (
          <CompletionCard profile={state.profile} />
        ) : (
          <div className="space-y-3 border-t p-4 sm:px-6">
            {failed ? (
              <Alert variant="destructive">
                <CircleAlert />
                <AlertTitle>Your message wasn&apos;t sent</AlertTitle>
                <AlertDescription>
                  <p>{errorMessage(failed.error)}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={() => {
                      setDraft("");
                      void deliver(failed.content, failed.skills);
                    }}
                    disabled={sending}
                  >
                    <RotateCw />
                    Try again
                  </Button>
                </AlertDescription>
              </Alert>
            ) : null}
            {askingSkills ? (
              <SkillPicker
                options={skillOptions!}
                disabled={sending}
                onSubmit={(skills) => void deliver(`I know: ${skills.join(", ")}`, skills)}
              />
            ) : null}
            <form onSubmit={onSubmit} className="flex items-end gap-2">
              <label htmlFor="onboarding-message" className="sr-only">
                Your message
              </label>
              <Textarea
                id="onboarding-message"
                ref={inputRef}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={onKeyDown}
                maxLength={MAX_LENGTH}
                rows={1}
                placeholder="Type your answer…"
                aria-describedby="onboarding-hint"
                className="max-h-40 min-h-11 resize-none"
                autoFocus
              />
              <Button
                type="submit"
                size="icon"
                className="size-11 shrink-0"
                aria-label="Send"
                disabled={!draft.trim() || sending}
              >
                <ArrowUp />
              </Button>
            </form>
            <p id="onboarding-hint" className="text-muted-foreground text-xs">
              Enter to send · Shift + Enter for a new line
            </p>
          </div>
        )}
      </Card>

      <ProgressPanel state={state} />
    </div>
  );
}

/** The AI onboarding chat: a short conversation that fills in the student's profile. */
export function OnboardingChat() {
  const query = useGetOnboardingQuery();
  return (
    <QueryState query={query} skeleton={<ChatSkeleton />} errorTitle="Couldn't load your chat">
      {(state) => <Chat state={state} />}
    </QueryState>
  );
}
