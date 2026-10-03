"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/shadcn/badge";
import { Card } from "@/components/shadcn/card";
import { Skeleton } from "@/components/shadcn/skeleton";
import { QueryState } from "@/components/ui/QueryState";
import { useGetTasksQuery } from "@/lib/api/endpoints/learning";
import type { TaskSummary } from "@/lib/api/types";

export function TaskStatusBadge({ task }: { task: Pick<TaskSummary, "best" | "attempts"> }) {
  if (!task.best) return <Badge variant="outline">Not tried</Badge>;
  return task.best.passed ? (
    <Badge className="bg-success/10 text-success">Passed · {task.best.percent}%</Badge>
  ) : (
    <Badge variant="secondary">Best {task.best.percent}%</Badge>
  );
}

/** A skill's practical tasks, easiest first, each with the student's best score. */
export function TaskList({ slug }: { slug: string }) {
  const query = useGetTasksQuery(slug);
  return (
    <QueryState
      query={query}
      skeleton={<Skeleton className="h-20 w-full rounded-xl" aria-hidden />}
      errorTitle="Couldn't load the tasks"
      isEmpty={(data) => data.tasks.length === 0}
      empty={
        <p className="text-muted-foreground text-sm">No practical tasks for this skill yet.</p>
      }
    >
      {({ tasks }) => (
        <Card className="gap-0 py-0">
          <ul className="divide-y">
            {tasks.map((task) => (
              <li key={task.id}>
                <Link
                  href={`/tasks/${task.id}`}
                  className="group hover:bg-muted/50 focus-visible:ring-ring/50 flex items-center gap-3 px-4 py-3 transition-colors outline-none focus-visible:ring-3"
                >
                  <span className="min-w-0 flex-1">
                    <span className="text-foreground block text-sm font-medium">{task.title}</span>
                    <span className="text-muted-foreground text-xs">
                      <span className="capitalize">{task.difficulty}</span>
                      {task.attempts
                        ? ` · ${task.attempts} attempt${task.attempts === 1 ? "" : "s"}`
                        : ""}
                    </span>
                  </span>
                  <TaskStatusBadge task={task} />
                  <ArrowRight
                    aria-hidden
                    className="text-muted-foreground group-hover:text-foreground size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </QueryState>
  );
}
