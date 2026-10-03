"use client";

import Link from "next/link";
import { ArrowLeft, ListChecks, RotateCw, SearchX } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Card, CardContent } from "@/components/shadcn/card";
import { Progress } from "@/components/shadcn/progress";
import { Skeleton } from "@/components/shadcn/skeleton";
import { EmptyPanel } from "@/components/app/EmptyPanel";
import { SkillStatusBadge, actionLabel } from "@/components/app/skill-checks/status";
import { useStartCheck } from "@/components/app/skill-checks/useStartCheck";
import { QueryState } from "@/components/ui/QueryState";
import { useGetMySkillsQuery } from "@/lib/api/endpoints/skills";
import type { MySkill } from "@/lib/api/types";
import { ResourceList } from "./ResourceList";
import { TaskList } from "./TaskList";

function Standing({ skill }: { skill: MySkill }) {
  const { startCheck, starting, dialog } = useStartCheck();
  const result = skill.last_result;
  return (
    <Card>
      <CardContent className="space-y-4">
        {result ? (
          <>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-muted-foreground text-sm">Your last check</p>
                <p className="text-foreground text-3xl font-semibold tabular-nums">
                  {result.percent}%
                </p>
              </div>
              <SkillStatusBadge skill={skill} />
            </div>
            <div className="relative">
              <Progress
                value={result.percent}
                aria-label="Your last score"
                getValueLabel={() => `${result.percent}%, pass mark ${skill.mastery_threshold}%`}
                className="h-2"
              />
              <span
                aria-hidden
                className="bg-foreground absolute -top-1 h-4 w-0.5 rounded"
                style={{ left: `${skill.mastery_threshold}%` }}
              />
            </div>
            <p className="text-muted-foreground text-sm">
              {result.mastery === "mastered"
                ? `At or above the ${skill.mastery_threshold}% pass mark. Try a practical task to go deeper.`
                : `Below the ${skill.mastery_threshold}% pass mark. Work through the material below, review your answers, then retake the check.`}
            </p>
          </>
        ) : (
          <p className="text-muted-foreground text-sm">
            You haven&apos;t checked {skill.name} yet. Five quick questions show where you stand.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={result?.mastery === "needs_revision" ? "default" : "outline"}
            disabled={starting}
            onClick={() =>
              startCheck({ id: skill.id, name: skill.name, inProgressId: skill.in_progress_id })
            }
          >
            {result ? <RotateCw /> : <ListChecks />}
            {actionLabel(skill)}
          </Button>
          {result ? (
            <Button asChild variant="ghost">
              <Link href={`/assessment/${result.assessment_id}`}>Review your answers</Link>
            </Button>
          ) : null}
        </div>
      </CardContent>
      {dialog}
    </Card>
  );
}

/** /learn/[slug] — where the student stands on one skill, what to study, and tasks to practise. */
export function SkillLearn({ slug }: { slug: string }) {
  const query = useGetMySkillsQuery();
  return (
    <QueryState
      query={query}
      skeleton={<Skeleton className="h-72 w-full rounded-xl" aria-hidden />}
      errorTitle="Couldn't load this skill"
    >
      {({ skills }) => {
        const skill = skills.find((s) => s.slug === slug);
        if (!skill) {
          return (
            <EmptyPanel
              icon={SearchX}
              title="Skill not found"
              description="It may have been removed from the catalogue."
              action={
                <Button asChild variant="outline">
                  <Link href="/learn">All skills</Link>
                </Button>
              }
            />
          );
        }
        return (
          <div className="space-y-8">
            <div className="space-y-2">
              <Link
                href="/learn"
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
              >
                <ArrowLeft className="size-4" aria-hidden /> Learn
              </Link>
              <h1 className="text-foreground text-2xl font-semibold tracking-tight">
                {skill.name}
              </h1>
              {skill.description ? (
                <p className="text-muted-foreground max-w-2xl text-sm">{skill.description}</p>
              ) : null}
            </div>

            <Standing skill={skill} />

            <section aria-labelledby="study" className="space-y-3">
              <div>
                <h2 id="study" className="text-foreground text-base font-semibold">
                  Study
                </h2>
                <p className="text-muted-foreground text-sm">
                  Hand-picked material. Links open in a new tab; our notes open here.
                </p>
              </div>
              <ResourceList slug={skill.slug} />
            </section>

            <section aria-labelledby="practise" className="space-y-3">
              <div>
                <h2 id="practise" className="text-foreground text-base font-semibold">
                  Practise
                </h2>
                <p className="text-muted-foreground text-sm">
                  Small hands-on tasks. Write your answer and the AI marks it against a rubric.
                </p>
              </div>
              <TaskList slug={skill.slug} />
            </section>
          </div>
        );
      }}
    </QueryState>
  );
}
