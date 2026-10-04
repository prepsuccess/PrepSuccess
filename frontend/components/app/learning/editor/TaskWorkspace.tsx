"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useId, useState, type FormEvent } from "react";
import { CircleAlert, Code2, Eye, FileCode2, Play, RotateCcw, SquareTerminal } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/shadcn/alert";
import { Button } from "@/components/shadcn/button";
import { Skeleton } from "@/components/shadcn/skeleton";
import { Textarea } from "@/components/shadcn/textarea";
import { Spinner } from "@/components/ui/Spinner";
import { errorMessage, fieldErrors } from "@/lib/api/errors";
import { useSubmitTaskMutation } from "@/lib/api/endpoints/learning";
import type { TaskDetail, TaskSubmission } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";
import { track } from "@/lib/analytics";
import { FILE_NAME, LANGUAGE_LABEL } from "./languages";
import { RUN_TIMEOUT_MS, runJavaScript, type RunResult } from "./runJs";

const MIN_CHARS = 20;
const MAX_CHARS = 10_000;

// CodeMirror is big and browser-only: load it on the task page, not with the app.
const CodeEditor = dynamic(() => import("./CodeEditor"), {
  ssr: false,
  loading: () => <Skeleton className="h-full min-h-72 rounded-none" aria-hidden />,
});

const draftKey = (id: string) => `task-draft:${id}`;

/**
 * A saved draft remembers which submission it was written on top of
 * (`basedOn`, null before the first attempt). If the student has submitted
 * since — in another tab or on another device — the draft is stale and the
 * latest submission is shown instead.
 */
interface Draft {
  v: 2;
  content: string;
  basedOn: string | null;
}

function readDraft(id: string, latestId: string | null): string | null {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(draftKey(id));
  } catch {
    return null;
  }
  if (raw === null) return null;
  try {
    const draft = JSON.parse(raw) as Partial<Draft> | null;
    if (draft && typeof draft === "object" && draft.v === 2 && typeof draft.content === "string") {
      return (draft.basedOn ?? null) === latestId ? draft.content : null;
    }
  } catch {
    // Not JSON: an older plain-text draft.
  }
  // Older drafts were plain text with no record of what they were based on:
  // trust them only before the first submission.
  return latestId === null ? raw : null;
}

function writeDraft(id: string, value: string | null, basedOn: string | null = null) {
  try {
    if (value === null) window.localStorage.removeItem(draftKey(id));
    else {
      const draft: Draft = { v: 2, content: value, basedOn };
      window.localStorage.setItem(draftKey(id), JSON.stringify(draft));
    }
  } catch {
    // Drafts are a convenience; private windows may block storage.
  }
}

/** Console output from the last run. */
function ConsolePanel({ result, running }: { result: RunResult | null; running: boolean }) {
  return (
    <div
      role="log"
      aria-live="polite"
      aria-label="Console output"
      className="bg-muted/40 h-36 overflow-auto px-4 py-3 font-mono text-[13px] leading-relaxed"
    >
      {running ? (
        <p className="text-muted-foreground">Running…</p>
      ) : !result ? (
        <p className="text-muted-foreground">
          Press Run (or Ctrl+Enter) to see your console.log output here.
        </p>
      ) : (
        <>
          {result.lines.length === 0 ? (
            <p className="text-muted-foreground">Nothing was logged.</p>
          ) : (
            result.lines.map((line, i) => (
              <p
                key={i}
                className={cn(
                  "break-words whitespace-pre-wrap",
                  line.level === "error" && "text-destructive",
                  line.level === "warn" && "text-amber-700 dark:text-amber-400",
                )}
              >
                {line.text}
              </p>
            ))
          )}
          {result.stopped ? (
            <p className="text-destructive mt-2">
              Stopped after {RUN_TIMEOUT_MS / 1000} seconds. Check for an infinite loop or a timer
              that never ends.
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}

/**
 * Live preview of an HTML page, filling the editor's space. Scripts are off
 * and it can't reach the app. White like a real browser page, in both themes.
 */
function PreviewPanel({ code }: { code: string }) {
  const [shown, setShown] = useState(code);
  useEffect(() => {
    const timer = setTimeout(() => setShown(code), 400);
    return () => clearTimeout(timer);
  }, [code]);
  return (
    <iframe title="Preview of your page" sandbox="" srcDoc={shown} className="size-full bg-white" />
  );
}

/**
 * Where the student writes and submits their answer: a real code editor in
 * the skill's language (or a text box for written answers), a console for
 * JavaScript and a live preview for HTML/CSS. Drafts are kept in the browser
 * until submitted.
 */
export function TaskWorkspace({ task, latest }: { task: TaskDetail; latest?: TaskSubmission }) {
  const [submit, { isLoading, error, reset }] = useSubmitTaskMutation();
  const starter = task.starter_code ?? "";
  const latestId = latest?.id ?? null;
  const [content, setContent] = useState(
    () => readDraft(task.id, latestId) ?? latest?.content ?? starter,
  );
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  // HTML/CSS tasks: show the code or the rendered page in the same space.
  const [previewing, setPreviewing] = useState(false);
  const fieldId = useId();
  const hintId = useId();

  const isCode = task.language !== "text";
  const length = content.trim().length;
  const unchanged = Boolean(starter) && content.trim() === starter.trim();
  const invalid = fieldErrors(error).content;
  const tooLong = content.length > MAX_CHARS;
  const canSubmit = length >= MIN_CHARS && !tooLong && !unchanged && !isLoading;

  const change = (value: string) => {
    setContent(value);
    writeDraft(task.id, value, latestId);
    if (error) reset();
  };

  const run = useCallback(async () => {
    // Also blocks Ctrl+Enter while the AI is reviewing (the Run button is disabled then).
    if (task.runner !== "run" || running || isLoading) return;
    setRunning(true);
    try {
      setResult(await runJavaScript(content));
    } finally {
      setRunning(false);
    }
  }, [task.runner, running, isLoading, content]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    try {
      const res = await submit({ id: task.id, content }).unwrap();
      writeDraft(task.id, null);
      track("task_submitted", { passed: res.passed });
    } catch {
      // Shown below.
    }
  }

  return (
    // On wide screens it fills the window height (below the top bar) so the
    // editor, console and submit button are all in view at once.
    <form
      onSubmit={onSubmit}
      className="bg-card flex flex-col overflow-hidden rounded-xl border shadow-xs lg:h-[calc(100dvh-6.5rem)]"
    >
      {/* Editor tab bar */}
      <div className="bg-muted/50 flex items-center justify-between gap-2 border-b px-3 py-1.5">
        <label htmlFor={fieldId} className="flex min-w-0 items-center gap-2 text-sm font-medium">
          <FileCode2 className="text-muted-foreground size-4 shrink-0" aria-hidden />
          <span className="truncate">{isCode ? FILE_NAME[task.language] : "Your answer"}</span>
          {isCode ? (
            <span className="text-muted-foreground font-normal">
              · {LANGUAGE_LABEL[task.language]}
            </span>
          ) : null}
        </label>
        <div className="flex items-center gap-1">
          {task.runner === "preview" ? (
            <Button
              type="button"
              variant={previewing ? "default" : "outline"}
              size="sm"
              aria-pressed={previewing}
              onClick={() => setPreviewing(!previewing)}
              className="pointer-coarse:h-11"
            >
              {previewing ? <Code2 /> : <Eye />}
              {previewing ? "Code" : "Preview"}
            </Button>
          ) : null}
          {starter ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={unchanged || isLoading}
              onClick={() => change(starter)}
              className="pointer-coarse:h-11"
            >
              <RotateCcw />
              Reset
            </Button>
          ) : null}
        </div>
      </div>

      {/* overflow-hidden: the editor never spills over what's below it. */}
      <div
        className={cn(
          "relative overflow-hidden lg:min-h-0 lg:flex-1",
          isCode && "h-[24rem] lg:h-auto",
        )}
      >
        {previewing ? (
          <div className="absolute inset-0 z-10">
            <PreviewPanel code={content} />
          </div>
        ) : null}
        {isCode ? (
          <CodeEditor
            id={fieldId}
            label={`Your ${LANGUAGE_LABEL[task.language]} answer`}
            describedBy={hintId}
            value={content}
            onChange={change}
            language={task.language}
            disabled={isLoading}
            onRun={task.runner === "run" ? run : undefined}
          />
        ) : (
          <Textarea
            id={fieldId}
            value={content}
            onChange={(e) => change(e.target.value)}
            rows={14}
            maxLength={MAX_CHARS}
            disabled={isLoading}
            aria-describedby={hintId}
            aria-invalid={Boolean(invalid)}
            placeholder="Write your answer here."
            className="min-h-72 rounded-none border-0 shadow-none lg:h-full lg:min-h-0 lg:resize-none"
          />
        )}
      </div>

      {task.runner === "run" ? (
        <div className="shrink-0 border-t">
          <div className="bg-muted/50 flex items-center justify-between gap-2 border-b px-3 py-1.5">
            <span className="flex items-center gap-2 text-sm font-medium">
              <SquareTerminal className="text-muted-foreground size-4" aria-hidden />
              Console
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={run}
              disabled={running || isLoading}
              className="pointer-coarse:h-11"
            >
              {running ? <Spinner className="size-4" /> : <Play />}
              Run
              <kbd className="text-muted-foreground hidden font-sans text-xs sm:inline">Ctrl+↵</kbd>
            </Button>
          </div>
          <ConsolePanel result={result} running={running} />
        </div>
      ) : null}

      <div className="shrink-0 space-y-3 border-t p-3">
        {error && !invalid ? (
          <Alert variant="destructive">
            <CircleAlert />
            <AlertTitle>Your answer wasn&apos;t reviewed</AlertTitle>
            <AlertDescription>
              {errorMessage(error)} Your answer is still here — try again.
            </AlertDescription>
          </Alert>
        ) : null}
        <div className="flex items-center justify-between gap-3">
          <p id={hintId} className="text-muted-foreground min-w-0 text-xs">
            {isLoading ? (
              <span role="status">
                The AI is marking your answer. This can take up to a minute.
              </span>
            ) : (
              (invalid ??
              (unchanged
                ? "Change the starter code to answer the task."
                : tooLong
                  ? `Too long: keep it under ${MAX_CHARS.toLocaleString()} characters.`
                  : length < MIN_CHARS
                    ? `At least ${MIN_CHARS} characters.`
                    : isCode && !task.runner
                      ? "Runs aren't available for this language — the AI reads and marks your code."
                      : "The AI marks only what's written here."))
            )}
            <span className={cn("block tabular-nums", tooLong && "text-destructive")}>
              {content.length.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters
            </span>
          </p>
          <Button type="submit" disabled={!canSubmit} className="shrink-0">
            {isLoading ? <Spinner className="size-4" /> : null}
            {isLoading ? "Reviewing…" : latest ? "Submit again" : "Submit for review"}
          </Button>
        </div>
      </div>
    </form>
  );
}
