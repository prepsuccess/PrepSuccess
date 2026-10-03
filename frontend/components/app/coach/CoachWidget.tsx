"use client";

import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { CircleAlert, RotateCcw, SendHorizontal, Sparkles, X } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Prose } from "@/components/app/learning/Prose";
import { Spinner } from "@/components/ui/Spinner";
import {
  useClearCoachMutation,
  useGetCoachQuery,
  useSendCoachMessageMutation,
} from "@/lib/api/endpoints/coach";
import { errorMessage } from "@/lib/api/errors";
import type { CoachMessage } from "@/lib/api/types";
import { useSession } from "@/lib/auth/useSession";
import { cn } from "@/lib/utils/cn";
import { useCoach } from "./CoachProvider";

const MAX_CHARS = 1000;

/** Pages where the coach stays out of the way: the onboarding chat and a skill check in progress. */
export function coachHiddenOn(pathname: string) {
  return pathname.startsWith("/onboarding") || /^\/assessment\/[^/]+/.test(pathname);
}

function Bubble({ message }: { message: CoachMessage }) {
  const mine = message.role === "user";
  return (
    <li className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2.5",
          mine ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted rounded-bl-md",
        )}
      >
        {message.nudge ? (
          <p className="text-muted-foreground mb-1 flex items-center gap-1 text-[11px] font-medium">
            <Sparkles className="size-3" aria-hidden />
            Check-in
          </p>
        ) : null}
        {mine ? (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        ) : (
          <Prose text={message.content} className="[&_pre]:bg-background space-y-2" />
        )}
      </div>
    </li>
  );
}

/** The chat panel: conversation, starter questions, and the message box. */
function CoachPanel({ onClose }: { onClose: () => void }) {
  const session = useSession();
  const firstName = session.status === "authenticated" ? session.user.first_name : "";
  const { data, isLoading, isError, refetch } = useGetCoachQuery();
  const [send, { isLoading: sending, error, reset }] = useSendCoachMessageMutation();
  const [clear, { isLoading: clearing }] = useClearCoachMutation();
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const end = useRef<HTMLDivElement>(null);
  const titleId = useId();

  const messages = data?.messages ?? [];
  const remaining = data?.usage.remaining ?? 0;
  const outOfMessages = Boolean(data) && remaining <= 0;

  useEffect(() => input.current?.focus(), []);
  // Keep the newest message in view.
  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [messages.length, pending]);

  async function ask(question: string) {
    const content = question.trim();
    if (!content || sending || outOfMessages) return;
    reset();
    setPending(content);
    setDraft("");
    try {
      await send(content).unwrap();
    } catch {
      setDraft(content); // keep the question so it can be sent again
    } finally {
      setPending(null);
    }
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void ask(draft);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void ask(draft);
    }
  };

  return (
    <div
      role="dialog"
      aria-labelledby={titleId}
      onKeyDown={(event) => event.key === "Escape" && onClose()}
      className="bg-card fixed inset-0 z-50 flex flex-col border shadow-2xl sm:inset-auto sm:right-5 sm:bottom-24 sm:h-[min(36rem,calc(100dvh-8rem))] sm:w-[23rem] sm:rounded-2xl"
    >
      <header className="flex items-center gap-3 border-b px-4 py-3">
        <span
          aria-hidden
          className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-sky-500 to-violet-600 text-white"
        >
          <Sparkles className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id={titleId} className="text-foreground text-sm font-semibold">
            Your AI coach
          </h2>
          <p className="text-muted-foreground text-xs">
            {data
              ? `${remaining} of ${data.usage.limit} messages left today`
              : "Knows your progress"}
          </p>
        </div>
        {messages.length ? (
          <Button
            variant="ghost"
            size="icon"
            aria-label="New chat"
            title="New chat"
            disabled={clearing || sending}
            onClick={() => void clear()}
          >
            <RotateCcw />
          </Button>
        ) : null}
        <Button variant="ghost" size="icon" aria-label="Close coach" onClick={onClose}>
          <X />
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4" aria-live="polite">
        {isLoading ? (
          <p className="text-muted-foreground flex items-center gap-2 text-sm">
            <Spinner className="size-4" /> Loading your chat…
          </p>
        ) : isError ? (
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">Couldn&apos;t load your chat.</p>
            <Button variant="outline" size="sm" onClick={() => void refetch()}>
              Try again
            </Button>
          </div>
        ) : (
          <>
            {messages.length === 0 && !pending ? (
              <div className="space-y-4">
                <p className="text-foreground text-sm">
                  Hi {firstName}! I can see your skills, check results and tasks. Ask me what to
                  study next, for a hint, or how anything on PrepSuccess works.
                </p>
                <div className="flex flex-col items-start gap-2">
                  {data?.suggestions.map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => void ask(question)}
                      disabled={outOfMessages}
                      className="hover:bg-muted focus-visible:ring-ring/50 rounded-full border px-3 py-1.5 text-left text-sm outline-none focus-visible:ring-3 disabled:opacity-50"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            <ul className="space-y-3">
              {messages.map((message, i) => (
                <Bubble key={`${message.created_at}-${i}`} message={message} />
              ))}
              {pending ? (
                <>
                  <Bubble
                    message={{
                      role: "user",
                      content: pending,
                      created_at: new Date().toISOString(),
                    }}
                  />
                  <li className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Spinner className="size-4" /> Coach is thinking…
                  </li>
                </>
              ) : null}
            </ul>
            {error ? (
              <p role="alert" className="text-destructive mt-3 flex items-start gap-2 text-sm">
                <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                {errorMessage(error)}
              </p>
            ) : null}
            <div ref={end} />
          </>
        )}
      </div>

      <form onSubmit={onSubmit} className="border-t p-3">
        {outOfMessages ? (
          <p className="text-muted-foreground px-1 pb-2 text-xs">
            You&apos;ve used today&apos;s {data?.usage.limit} messages. More at midnight.
          </p>
        ) : null}
        <div className="flex items-end gap-2">
          <label htmlFor={`${titleId}-input`} className="sr-only">
            Ask your coach
          </label>
          <textarea
            id={`${titleId}-input`}
            ref={input}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            maxLength={MAX_CHARS}
            disabled={outOfMessages}
            placeholder="Ask anything about your prep…"
            className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 field-sizing-content max-h-32 min-h-10 flex-1 resize-none rounded-xl border px-3 py-2 text-sm outline-none focus-visible:ring-3 disabled:opacity-50"
          />
          <Button
            type="submit"
            size="icon"
            aria-label="Send"
            disabled={!draft.trim() || sending || outOfMessages}
            className="size-10 rounded-xl"
          >
            {sending ? <Spinner className="size-4" /> : <SendHorizontal />}
          </Button>
        </div>
        <p className="text-muted-foreground mt-1.5 px-1 text-[11px]">
          The coach can make mistakes. It never sees your skill-check answers.
        </p>
      </form>
    </div>
  );
}

/** The round button in the bottom-right corner, and the chat it opens. */
export function CoachWidget() {
  const coach = useCoach();
  const pathname = usePathname() ?? "/";
  if (!coach || coachHiddenOn(pathname)) return null;
  const { open, setOpen } = coach;
  // The task editor's Submit button sits in that corner; the chat still opens from a notification.
  const launcher = !pathname.startsWith("/tasks/");

  return (
    <>
      {open ? <CoachPanel onClose={() => setOpen(false)} /> : null}
      {launcher ? (
        <Button
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close coach" : "Ask your AI coach"}
          aria-expanded={open}
          className={cn(
            "fixed right-5 bottom-5 z-40 size-14 rounded-full bg-linear-to-br from-sky-500 to-violet-600 text-white shadow-lg hover:opacity-95",
            // On phones the open chat is full screen and has its own close button.
            open && "max-sm:hidden",
          )}
        >
          {open ? <X className="size-6" /> : <Sparkles className="size-6" />}
        </Button>
      ) : null}
    </>
  );
}
