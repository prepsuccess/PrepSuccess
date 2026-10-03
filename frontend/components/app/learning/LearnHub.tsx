"use client";

import Link from "next/link";
import { useId } from "react";
import { ArrowRight, PartyPopper } from "lucide-react";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/shadcn/card";
import { Button } from "@/components/shadcn/button";
import { Skeleton } from "@/components/shadcn/skeleton";
import { EmptyPanel } from "@/components/app/EmptyPanel";
import { SkillStatusBadge } from "@/components/app/skill-checks/status";
import { QueryState } from "@/components/ui/QueryState";
import { useGetMySkillsQuery } from "@/lib/api/endpoints/skills";
import type { MySkill } from "@/lib/api/types";

const GROUPS: { category: MySkill["category"]; title: string }[] = [
  { category: "technical", title: "Technical" },
  { category: "aptitude", title: "Aptitude" },
  { category: "soft", title: "Soft skills" },
];

function HubSkeleton() {
  return (
    <div className="space-y-8" aria-hidden>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-36 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

function SkillLinks({ title, skills }: { title: string; skills: MySkill[] }) {
  const headingId = useId();
  if (!skills.length) return null;
  return (
    <section aria-labelledby={headingId} className="space-y-3">
      <h2 id={headingId} className="text-foreground text-base font-semibold">
        {title}
      </h2>
      <Card className="gap-0 py-0">
        <ul className="divide-y">
          {skills.map((skill) => (
            <li key={skill.id}>
              <Link
                href={`/learn/${skill.slug}`}
                className="group hover:bg-muted/50 focus-visible:ring-ring/50 flex items-center gap-3 px-4 py-3 transition-colors outline-none focus-visible:ring-3"
              >
                <span className="min-w-0 flex-1">
                  <span className="text-foreground block text-sm font-medium">{skill.name}</span>
                  <span className="text-muted-foreground block truncate text-xs">
                    {skill.description}
                  </span>
                </span>
                {skill.last_result || skill.in_progress_id ? (
                  <SkillStatusBadge skill={skill} />
                ) : null}
                <ArrowRight
                  aria-hidden
                  className="text-muted-foreground group-hover:text-foreground size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}

/** /learn — what to revise first, then every skill's study material and tasks. */
export function LearnHub() {
  const query = useGetMySkillsQuery();
  return (
    <QueryState query={query} skeleton={<HubSkeleton />} errorTitle="Couldn't load your skills">
      {({ skills }) => {
        const revise = skills
          .filter((s) => s.last_result?.mastery === "needs_revision")
          .sort((a, b) => a.last_result!.percent - b.last_result!.percent);
        const checked = skills.some((s) => s.last_result);
        return (
          <div className="space-y-10">
            <section aria-labelledby="revise-first" className="space-y-3">
              <div>
                <h2 id="revise-first" className="text-foreground text-base font-semibold">
                  Revise first
                </h2>
                <p className="text-muted-foreground text-sm">
                  Skills you scored below the pass mark on, weakest first.
                </p>
              </div>
              {revise.length ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {revise.map((skill) => (
                    <Card key={skill.id}>
                      <CardHeader>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <CardTitle>{skill.name}</CardTitle>
                          <SkillStatusBadge skill={skill} />
                        </div>
                        <CardDescription>
                          Pass mark {skill.mastery_threshold}%. Study, then retake the check.
                        </CardDescription>
                      </CardHeader>
                      <CardFooter className="mt-auto">
                        <Button asChild>
                          <Link href={`/learn/${skill.slug}`}>Study {skill.name}</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <EmptyPanel
                  icon={PartyPopper}
                  title={checked ? "Nothing below the pass mark" : "No checks yet"}
                  description={
                    checked
                      ? "Every skill you've checked is mastered. Try a practical task to go further."
                      : "Take a skill check and anything you need to revise will show up here."
                  }
                  action={
                    checked ? undefined : (
                      <Button asChild variant="outline">
                        <Link href="/assessment">Take a skill check</Link>
                      </Button>
                    )
                  }
                />
              )}
            </section>

            {GROUPS.map((group) => (
              <SkillLinks
                key={group.category}
                title={group.title}
                skills={skills.filter((s) => s.category === group.category)}
              />
            ))}
          </div>
        );
      }}
    </QueryState>
  );
}
