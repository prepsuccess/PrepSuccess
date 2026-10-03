"use client";

import Link from "next/link";
import { ArrowRight, Bot, Eye, Play } from "lucide-react";
import { Badge } from "@/components/shadcn/badge";
import { Skeleton } from "@/components/shadcn/skeleton";
import { QueryState } from "@/components/ui/QueryState";
import { useGetTasksQuery } from "@/lib/api/endpoints/learning";
import type { TaskSummary } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";
import { LANGUAGE_LABEL } from "./editor/languages";

export function TaskStatusBadge({ task }: { task: Pick<TaskSummary, "best" | "attempts"> }) {
  if (!task.best) return <Badge variant="outline">Not tried</Badge>;
  return task.best.passed ? (
    <Badge className="bg-success/10 text-success">Passed · {task.best.percent}%</Badge>
  ) : (
    <Badge variant="secondary">Best {task.best.percent}%</Badge>
  );
}

const LEVEL = { easy: 1, medium: 2, hard: 3 } as const;

/** Difficulty as 1–3 filled bars plus the word, so it never relies on colour. */
function Difficulty({ level }: { level: TaskSummary["difficulty"] }) {
  const filled = LEVEL[level];
  return (
    <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs font-medium">
      <span aria-hidden className="flex items-end gap-0.5">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={cn(
              "w-1 rounded-sm",
              n === 1 ? "h-1.5" : n === 2 ? "h-2.5" : "h-3.5",
              n <= filled ? "bg-foreground/70" : "bg-border",
            )}
          />
        ))}
      </span>
      <span className="capitalize">{level}</span>
    </span>
  );
}

/** How the student works on it: run it here, preview it, or write it for AI review. */
function Mode({ task }: { task: TaskSummary }) {
  const [Icon, text] =
    task.runner === "run"
      ? [Play, "Run it here"]
      : task.runner === "preview"
        ? [Eye, "Live preview"]
        : [Bot, "AI review"];
  return (
    <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
      <Icon className="size-3.5" aria-hidden />
      {task.language === "text" ? "Written answer" : LANGUAGE_LABEL[task.language]} · {text}
    </span>
  );
}

function TaskCard({ task, number }: { task: TaskSummary; number: number }) {
  const action = !task.best ? "Start" : task.best.passed ? "Review" : "Try again";
  return (
    <li>
      <Link
        href={`/tasks/${task.id}`}
        className="group bg-card hover:border-foreground/20 focus-visible:ring-ring/50 flex h-full flex-col gap-3 rounded-xl border p-4 shadow-xs transition-colors outline-none focus-visible:ring-3"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground flex items-center gap-2 text-xs">
            <span className="bg-muted text-foreground flex size-6 items-center justify-center rounded-md font-semibold tabular-nums">
              {number}
            </span>
            <Difficulty level={task.difficulty} />
          </span>
          <TaskStatusBadge task={task} />
        </div>
        <p className="text-foreground leading-snug font-medium">{task.title}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <Mode task={task} />
          <span className="text-foreground flex shrink-0 items-center gap-1 text-sm font-medium">
            {action}
            <ArrowRight
              aria-hidden
              className="size-4 transition-transform group-hover:translate-x-0.5"
            />
          </span>
        </div>
      </Link>
    </li>
  );
}

/** A skill's practical tasks, easiest first, as cards with the student's best score. */
export function TaskList({ slug }: { slug: string }) {
  const query = useGetTasksQuery(slug);
  return (
    <QueryState
      query={query}
      skeleton={
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-hidden>
          {[0, 1, 2].map((n) => (
            <Skeleton key={n} className="h-36 rounded-xl" />
          ))}
        </div>
      }
      errorTitle="Couldn't load the tasks"
      isEmpty={(data) => data.tasks.length === 0}
      empty={
        <p className="text-muted-foreground text-sm">No practical tasks for this skill yet.</p>
      }
    >
      {({ tasks }) => {
        const passed = tasks.filter((t) => t.best?.passed).length;
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div
                role="progressbar"
                aria-label="Tasks passed"
                aria-valuemin={0}
                aria-valuemax={tasks.length}
                aria-valuenow={passed}
                className="bg-muted h-1.5 max-w-48 flex-1 overflow-hidden rounded-full"
              >
                <div
                  className="bg-success h-full rounded-full transition-[width]"
                  style={{ width: `${(passed / tasks.length) * 100}%` }}
                />
              </div>
              <p className="text-muted-foreground text-xs tabular-nums">
                {passed} of {tasks.length} passed
              </p>
            </div>
            <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {tasks.map((task, i) => (
                <TaskCard key={task.id} task={task} number={i + 1} />
              ))}
            </ol>
          </div>
        );
      }}
    </QueryState>
  );
}
