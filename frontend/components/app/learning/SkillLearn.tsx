"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen, ListChecks, PlayCircle, RotateCw, SearchX } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Skeleton } from "@/components/shadcn/skeleton";
import { EmptyPanel } from "@/components/app/EmptyPanel";
import { statusOf } from "@/components/app/skill-checks/skillsView";
import { SkillStatusBadge } from "@/components/app/skill-checks/status";
import { TopicIcon } from "@/components/app/skill-checks/TopicIcon";
import { useStartCheck } from "@/components/app/skill-checks/useStartCheck";
import { QueryState } from "@/components/ui/QueryState";
import { useGetMySkillsQuery } from "@/lib/api/endpoints/skills";
import type { MySkill } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";
import { ResourceList } from "./ResourceList";
import { TaskList } from "./TaskList";

/** Heading for a section: a title and one line of help, no extra spacing. */
function SectionHead({ id, title, hint }: { id: string; title: string; hint: string }) {
  return (
    <div className="mb-3">
      <h2 id={id} className="text-foreground text-base font-semibold">
        {title}
      </h2>
      <p className="text-muted-foreground text-sm">{hint}</p>
    </div>
  );
}

/** Where the student stands, with the one action that fits: start, resume, or retake. */
function Standing({ skill }: { skill: MySkill }) {
  const { startCheck, starting, dialog } = useStartCheck();
  const status = statusOf(skill);
  const result = skill.last_result;
  const go = () =>
    startCheck({ id: skill.id, name: skill.name, inProgressId: skill.in_progress_id });

  return (
    // Same heading row as Study and Practise, so the columns line up.
    <section aria-labelledby="standing">
      <SectionHead id="standing" title="Your standing" hint="Your latest skill check." />
      <div className="bg-card space-y-3 rounded-2xl border p-4 shadow-xs">
        {status === "in_progress" ? (
          <>
            <p className="text-muted-foreground text-sm">
              You have a {skill.name} check in progress. Pick up where you left off.
            </p>
            <Button className="w-full" disabled={starting} onClick={go}>
              <PlayCircle />
              Resume check
            </Button>
          </>
        ) : result ? (
          <>
            <div className="flex items-end justify-between gap-3">
              <p className="text-foreground text-3xl font-semibold tabular-nums">
                {result.percent}%
              </p>
              <span className="text-muted-foreground pb-1 text-xs">
                Pass mark {skill.mastery_threshold}%
              </span>
            </div>
            <div className="relative">
              <div
                role="meter"
                aria-label="Your last score"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={result.percent}
                aria-valuetext={`${result.percent}%, pass mark ${skill.mastery_threshold}%`}
                className="bg-muted h-2 overflow-hidden rounded-full"
              >
                <div
                  className={cn(
                    "h-full rounded-full",
                    status === "mastered" ? "bg-emerald-500" : "bg-red-500",
                  )}
                  style={{ width: `${Math.max(result.percent, 3)}%` }}
                />
              </div>
              <span
                aria-hidden
                className="bg-foreground absolute -top-1 h-4 w-0.5 rounded"
                style={{ left: `${skill.mastery_threshold}%` }}
              />
            </div>
            <p className="text-muted-foreground text-sm">
              {status === "mastered"
                ? "At or above the pass mark. Try a practical task to go deeper."
                : "Below the pass mark. Study the material, then retake the check."}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={status === "needs_revision" ? "default" : "outline"}
                disabled={starting}
                onClick={go}
              >
                <RotateCw />
                Retake
              </Button>
              <Button asChild variant="ghost">
                <Link href={`/assessment/${result.assessment_id}`}>Review answers</Link>
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-muted-foreground text-sm">
              Not checked yet. A short check (10 questions or more) shows where you stand.
            </p>
            <Button className="w-full" disabled={starting} onClick={go}>
              <ListChecks />
              Start check
            </Button>
          </>
        )}
      </div>
      {dialog}
    </section>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-6" aria-hidden>
      <Skeleton className="h-14 w-72 rounded-xl" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    </div>
  );
}

/** /learn/[slug] — one skill: where the student stands, what to study, tasks to practise. */
export function SkillLearn({ slug }: { slug: string }) {
  const query = useGetMySkillsQuery();
  return (
    <QueryState query={query} skeleton={<PageSkeleton />} errorTitle="Couldn't load this skill">
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
          <div className="space-y-6">
            <header className="space-y-3">
              <Link
                href="/learn"
                className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 inline-flex items-center gap-1 rounded text-sm outline-none focus-visible:ring-3"
              >
                <ArrowLeft className="size-4" aria-hidden /> All skills
              </Link>
              <div className="flex items-start gap-3">
                <TopicIcon topic={skill.topic} className="size-12" />
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h1 className="text-foreground text-2xl font-semibold tracking-tight">
                      {skill.name}
                    </h1>
                    <SkillStatusBadge skill={skill} />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {skill.topic ? `${skill.topic} · ` : ""}
                    {skill.description}
                  </p>
                </div>
              </div>
            </header>

            {/* Phones read top to bottom: standing, study, practise. Desktop puts
                study on the left and standing + practise in a sidebar. */}
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
              <div className="lg:col-start-2 lg:row-start-1">
                <Standing skill={skill} />
              </div>

              <section
                aria-labelledby="study"
                className="lg:col-start-1 lg:row-span-2 lg:row-start-1"
              >
                <SectionHead
                  id="study"
                  title="Study"
                  hint="Hand-picked material. Links open in a new tab; our notes open here."
                />
                <ResourceList slug={skill.slug} />
                <p className="text-muted-foreground mt-3 flex items-center gap-1.5 text-xs">
                  <BookOpen className="size-3.5" aria-hidden />
                  Study first, then retake the check to see your progress.
                </p>
              </section>

              <section aria-labelledby="practise" className="lg:col-start-2 lg:row-start-2">
                <SectionHead
                  id="practise"
                  title="Practise"
                  hint="Hands-on tasks, marked by AI against a rubric."
                />
                <TaskList slug={skill.slug} />
              </section>
            </div>
          </div>
        );
      }}
    </QueryState>
  );
}
