"use client";

import Link from "next/link";
import { useId } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/shadcn/card";
import { Skeleton } from "@/components/shadcn/skeleton";
import { EmptyPanel } from "@/components/app/EmptyPanel";
import { QueryState } from "@/components/ui/QueryState";
import { useGetMySkillsQuery } from "@/lib/api/endpoints/skills";
import type { MySkill } from "@/lib/api/types";
import { SkillStatusBadge, actionLabel } from "./status";
import { useStartCheck } from "./useStartCheck";

type StartCheck = ReturnType<typeof useStartCheck>["startCheck"];

function ListSkeleton() {
  return (
    <div className="space-y-8" aria-hidden>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardFooter>
              <Skeleton className="h-9 w-28" />
            </CardFooter>
          </Card>
        ))}
      </div>
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
}

function ResultLink({ skill }: { skill: MySkill }) {
  if (!skill.last_result) return null;
  return (
    <Link
      href={`/assessment/${skill.last_result.assessment_id}`}
      aria-label={`See answers for ${skill.name}`}
      className="text-muted-foreground hover:text-foreground text-xs underline underline-offset-4"
    >
      See answers
    </Link>
  );
}

/** A skill the student claimed: the main thing on this page. */
function SkillCard({
  skill,
  startCheck,
  disabled,
}: {
  skill: MySkill;
  startCheck: StartCheck;
  disabled: boolean;
}) {
  const retake = Boolean(skill.last_result) && !skill.in_progress_id;
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>{skill.name}</CardTitle>
          <SkillStatusBadge skill={skill} />
        </div>
        <CardDescription>{skill.description}</CardDescription>
      </CardHeader>
      <CardFooter className="mt-auto flex items-center justify-between gap-3">
        <Button
          variant={retake ? "outline" : "default"}
          disabled={disabled}
          aria-label={`${actionLabel(skill)} — ${skill.name}`}
          onClick={() =>
            startCheck({ id: skill.id, name: skill.name, inProgressId: skill.in_progress_id })
          }
        >
          {actionLabel(skill)}
        </Button>
        <ResultLink skill={skill} />
      </CardFooter>
    </Card>
  );
}

/** Everything else, as compact rows grouped under one heading. */
function SkillGroup({
  title,
  description,
  skills,
  startCheck,
  disabled,
}: {
  title: string;
  description: string;
  skills: MySkill[];
  startCheck: StartCheck;
  disabled: boolean;
}) {
  const headingId = useId();
  if (!skills.length) return null;
  return (
    <section aria-labelledby={headingId} className="space-y-3">
      <div>
        <h2 id={headingId} className="text-foreground text-base font-semibold">
          {title}
        </h2>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      <Card className="gap-0 py-0">
        <ul className="divide-y">
          {skills.map((skill) => (
            <li
              key={skill.id}
              className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3"
            >
              <div className="min-w-0 flex-1 basis-60">
                <p className="text-foreground text-sm font-medium">{skill.name}</p>
                <p className="text-muted-foreground truncate text-xs">{skill.description}</p>
              </div>
              <div className="flex items-center gap-3">
                {/* "Not checked yet" on every row is noise; only show real progress here. */}
                {skill.in_progress_id || skill.last_result ? (
                  <SkillStatusBadge skill={skill} />
                ) : null}
                <ResultLink skill={skill} />
                <Button
                  size="sm"
                  variant="outline"
                  disabled={disabled}
                  aria-label={`${actionLabel(skill)} — ${skill.name}`}
                  onClick={() =>
                    startCheck({
                      id: skill.id,
                      name: skill.name,
                      inProgressId: skill.in_progress_id,
                    })
                  }
                >
                  {actionLabel(skill)}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}

/** The skill checks hub: the student's own skills first, then aptitude, soft and other skills. */
export function SkillChecks() {
  const query = useGetMySkillsQuery();
  const { startCheck, starting, dialog } = useStartCheck();

  return (
    <>
      <QueryState query={query} skeleton={<ListSkeleton />} errorTitle="Couldn't load your skills">
        {({ skills, unmatched_claims }) => {
          const claimed = skills.filter((s) => s.claimed);
          const rest = skills.filter((s) => !s.claimed);
          return (
            <div className="space-y-10">
              <section aria-labelledby="your-skills" className="space-y-3">
                <div>
                  <h2 id="your-skills" className="text-foreground text-base font-semibold">
                    Your skills
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    What you told your coach you know. Check each one to see where you stand.
                  </p>
                </div>
                {claimed.length ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {claimed.map((skill) => (
                      <SkillCard
                        key={skill.id}
                        skill={skill}
                        startCheck={startCheck}
                        disabled={starting}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyPanel
                    icon={MessageCircle}
                    title="No skills from your chat yet"
                    description="Skills you mention in the onboarding chat show up here. You can also check any skill below."
                    action={
                      <Button asChild variant="outline">
                        <Link href="/onboarding">Open the chat</Link>
                      </Button>
                    }
                  />
                )}
                {unmatched_claims.length ? (
                  <p className="text-muted-foreground text-xs">
                    Not in our catalogue yet: {unmatched_claims.join(", ")}. More skills are on the
                    way.
                  </p>
                ) : null}
              </section>

              <SkillGroup
                title="Aptitude"
                description="The quant, reasoning and verbal rounds most placement tests start with."
                skills={rest.filter((s) => s.category === "aptitude")}
                startCheck={startCheck}
                disabled={starting}
              />
              <SkillGroup
                title="Soft skills"
                description="Short workplace scenarios: pick the best response."
                skills={rest.filter((s) => s.category === "soft")}
                startCheck={startCheck}
                disabled={starting}
              />
              <SkillGroup
                title="More technical skills"
                description="Anything else you'd like to check."
                skills={rest.filter((s) => s.category === "technical")}
                startCheck={startCheck}
                disabled={starting}
              />
            </div>
          );
        }}
      </QueryState>
      {dialog}
    </>
  );
}
