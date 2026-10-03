"use client";

import Link from "next/link";
import { useId, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CircleCheck,
  CircleDashed,
  CircleDot,
  PartyPopper,
  Search,
  SearchX,
  TriangleAlert,
  X,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Skeleton } from "@/components/shadcn/skeleton";
import { EmptyPanel } from "@/components/app/EmptyPanel";
import {
  groupByTopic,
  matches,
  statusOf,
  type SkillStatus,
} from "@/components/app/skill-checks/skillsView";
import { TopicIcon } from "@/components/app/skill-checks/TopicIcon";
import { QueryState } from "@/components/ui/QueryState";
import { useGetMySkillsQuery } from "@/lib/api/endpoints/skills";
import type { MySkill } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";

/** Status: icon + word + colour, never colour alone. `square` is the Khan-style progress square. */
const STATUS: Record<
  SkillStatus,
  { label: string; icon: LucideIcon; text: string; square: string }
> = {
  todo: {
    label: "Not checked",
    icon: CircleDashed,
    text: "text-muted-foreground",
    square: "border border-dashed border-muted-foreground/50 bg-transparent",
  },
  in_progress: {
    label: "In progress",
    icon: CircleDot,
    text: "text-blue-600 dark:text-blue-400",
    square: "bg-blue-500",
  },
  needs_revision: {
    label: "Needs revision",
    icon: TriangleAlert,
    text: "text-red-600 dark:text-red-400",
    square: "bg-red-500",
  },
  mastered: {
    label: "Mastered",
    icon: CircleCheck,
    text: "text-emerald-600 dark:text-emerald-400",
    square: "bg-emerald-500",
  },
};

function Status({ skill }: { skill: MySkill }) {
  const { label, icon: Icon, text } = STATUS[statusOf(skill)];
  const percent =
    skill.last_result && !skill.in_progress_id ? ` · ${skill.last_result.percent}%` : "";
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium", text)}>
      <Icon aria-hidden className="size-3.5 shrink-0" />
      {label}
      {percent}
    </span>
  );
}

function HubSkeleton() {
  return (
    <div className="space-y-8" aria-hidden>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-11 w-full max-w-md rounded-xl" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

/** Skills to work on now: below the pass mark first (weakest first), then unfinished checks. */
function ContinueLearning({ skills }: { skills: MySkill[] }) {
  const revise = skills
    .filter((s) => statusOf(s) === "needs_revision")
    .sort((a, b) => a.last_result!.percent - b.last_result!.percent);
  const started = skills.filter((s) => statusOf(s) === "in_progress");
  const items = [...revise, ...started].slice(0, 3);
  const checked = skills.some((s) => s.last_result);

  return (
    <section aria-labelledby="continue" className="space-y-4">
      <div>
        <h2 id="continue" className="text-foreground text-lg font-semibold">
          Continue learning
        </h2>
        <p className="text-muted-foreground text-sm">
          Skills below the pass mark, weakest first. Study, then retake the check.
        </p>
      </div>
      {items.length ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((skill, i) => (
            <li
              key={skill.id}
              className="bg-card flex flex-col gap-4 rounded-2xl border p-5 shadow-xs"
            >
              <div className="flex items-start gap-3">
                <TopicIcon topic={skill.topic} className="size-10" />
                <div className="min-w-0 space-y-1">
                  <p className="text-foreground font-semibold">{skill.name}</p>
                  <Status skill={skill} />
                </div>
              </div>
              {/* Only the weakest skill gets the solid button: one main action. */}
              <Button
                asChild
                variant={i === 0 ? "default" : "outline"}
                className="mt-auto self-start"
              >
                <Link href={`/learn/${skill.slug}`}>
                  <BookOpen />
                  Study {skill.name}
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyPanel
          icon={PartyPopper}
          title={checked ? "Nothing below the pass mark" : "No checks yet"}
          description={
            checked
              ? "Every skill you've checked is mastered. Pick any skill below to go deeper with practical tasks."
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
  );
}

/** Khan Academy-style: one square per skill, coloured by where the student stands. */
function ProgressSquares({ skills }: { skills: MySkill[] }) {
  return (
    <span aria-hidden className="flex flex-wrap gap-1">
      {skills.map((s) => (
        <span key={s.id} className={cn("size-3 rounded-[3px]", STATUS[statusOf(s)].square)} />
      ))}
    </span>
  );
}

/** One skill in the catalogue: the whole card opens its Learn page. */
function SkillCard({ skill }: { skill: MySkill }) {
  return (
    <li>
      <Link
        href={`/learn/${skill.slug}`}
        className="group bg-card hover:border-foreground/20 focus-visible:ring-ring/50 flex h-full flex-col gap-2 rounded-2xl border p-4 shadow-xs transition-[border-color,box-shadow] outline-none hover:shadow-md focus-visible:ring-3 motion-reduce:transition-none"
      >
        <span className="text-foreground flex items-start justify-between gap-2 text-sm font-semibold">
          {skill.name}
          <ArrowRight
            aria-hidden
            className="text-muted-foreground group-hover:text-foreground mt-0.5 size-4 shrink-0 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
          />
        </span>
        <span className="text-muted-foreground hidden text-sm leading-relaxed sm:line-clamp-2">
          {skill.description}
        </span>
        <span className="mt-auto pt-1">
          <Status skill={skill} />
        </span>
      </Link>
    </li>
  );
}

function TopicSection({
  topic,
  skills,
  all,
}: {
  topic: string;
  skills: MySkill[];
  all: MySkill[];
}) {
  const headingId = useId();
  const checked = all.filter((s) => s.last_result).length;
  return (
    <section aria-labelledby={headingId} className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-2.5">
          <TopicIcon topic={topic} className="size-8" />
          <h3 id={headingId} className="text-foreground font-semibold">
            {topic}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <ProgressSquares skills={all} />
          <span className="text-muted-foreground text-xs tabular-nums">
            {checked} of {all.length} checked
          </span>
        </div>
      </div>
      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {skills.map((skill) => (
          <SkillCard key={skill.id} skill={skill} />
        ))}
      </ul>
    </section>
  );
}

/** /learn — what to study now, then every skill by topic. */
export function LearnHub() {
  const query = useGetMySkillsQuery();
  const [search, setSearch] = useState("");
  const searchId = useId();

  return (
    <QueryState query={query} skeleton={<HubSkeleton />} errorTitle="Couldn't load your skills">
      {({ skills }) => {
        const visible = skills.filter((s) => matches(s, search, "all"));
        const byTopic = new Map(groupByTopic(skills).map((g) => [g.topic, g.skills]));
        return (
          <div className="space-y-10">
            {search ? null : <ContinueLearning skills={skills} />}

            <section aria-labelledby="all-skills" className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 id="all-skills" className="text-foreground text-lg font-semibold">
                    All skills
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Study material and practical tasks for every skill.
                  </p>
                </div>
                <div className="w-full space-y-1.5 sm:max-w-xs">
                  <label htmlFor={searchId} className="text-foreground text-sm font-medium">
                    Find a skill
                  </label>
                  <div className="relative">
                    <Search
                      aria-hidden
                      className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                    />
                    <input
                      id={searchId}
                      type="search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="e.g. SQL, arrays, aptitude"
                      autoComplete="off"
                      className="border-input bg-card focus-visible:border-ring focus-visible:ring-ring/50 h-11 w-full rounded-xl border pr-10 pl-9 text-base outline-none focus-visible:ring-3 md:text-sm [&::-webkit-search-cancel-button]:hidden"
                    />
                    {search ? (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        aria-label="Clear search"
                        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 absolute top-1/2 right-1.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg outline-none focus-visible:ring-3"
                      >
                        <X className="size-4" />
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>

              {visible.length ? (
                groupByTopic(visible).map(({ topic, skills: list }) => (
                  <TopicSection
                    key={topic}
                    topic={topic}
                    skills={list}
                    all={byTopic.get(topic) ?? list}
                  />
                ))
              ) : (
                <EmptyPanel
                  icon={SearchX}
                  title="No skills match"
                  description={`Nothing matches "${search.trim()}".`}
                  action={
                    <Button variant="outline" onClick={() => setSearch("")}>
                      Show all skills
                    </Button>
                  }
                />
              )}
            </section>
          </div>
        );
      }}
    </QueryState>
  );
}
