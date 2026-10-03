"use client";

import Link from "next/link";
import { useId, useState } from "react";
import {
  ArrowRight,
  CircleCheck,
  CircleDashed,
  CircleDot,
  MessageCircle,
  Search,
  SearchX,
  TriangleAlert,
  X,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Skeleton } from "@/components/shadcn/skeleton";
import { EmptyPanel } from "@/components/app/EmptyPanel";
import { QueryState } from "@/components/ui/QueryState";
import { useGetMySkillsQuery } from "@/lib/api/endpoints/skills";
import type { MySkill } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";
import { groupByTopic, matches, statusOf, summarise, upNext, type SkillStatus } from "./skillsView";
import { actionLabel } from "./status";
import { TopicIcon } from "./TopicIcon";
import { useStartCheck } from "./useStartCheck";

type StartCheck = ReturnType<typeof useStartCheck>["startCheck"];
const startArgs = (skill: MySkill) => ({
  id: skill.id,
  name: skill.name,
  inProgressId: skill.in_progress_id,
});

/** Status: an icon, a word and a colour — never colour alone. */
const STATUS: Record<SkillStatus, { label: string; icon: LucideIcon; className: string }> = {
  todo: { label: "Not checked", icon: CircleDashed, className: "text-muted-foreground" },
  in_progress: {
    label: "In progress",
    icon: CircleDot,
    className: "text-blue-600 dark:text-blue-400",
  },
  needs_revision: {
    label: "Needs revision",
    icon: TriangleAlert,
    className: "text-red-600 dark:text-red-400",
  },
  mastered: {
    label: "Mastered",
    icon: CircleCheck,
    className: "text-emerald-600 dark:text-emerald-400",
  },
};

function Status({ skill }: { skill: MySkill }) {
  const { label, icon: Icon, className } = STATUS[statusOf(skill)];
  const percent =
    skill.last_result && !skill.in_progress_id ? ` · ${skill.last_result.percent}%` : "";
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium", className)}>
      <Icon aria-hidden className="size-3.5" />
      {label}
      {percent}
    </span>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-8" aria-hidden>
      <Skeleton className="h-28 rounded-2xl" />
      <Skeleton className="h-11 w-full max-w-md rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

const NEXT_TITLE: Record<ReturnType<typeof upNext>["kind"], (name: string) => string> = {
  resume: (name) => `Finish your ${name} check`,
  start_claimed: (name) => `Check your ${name}`,
  revise: (name) => `Revise ${name}`,
  start_aptitude: (name) => `Try ${name}`,
  explore: () => "Pick any skill below to check next",
};

/** Progress on the left, the one next step on the right. */
function Overview({
  skills,
  startCheck,
  disabled,
}: {
  skills: MySkill[];
  startCheck: StartCheck;
  disabled: boolean;
}) {
  const s = summarise(skills);
  const next = upNext(skills);
  const skill = "skill" in next ? next.skill : null;
  const share = (n: number) => `${(n / Math.max(s.total, 1)) * 100}%`;

  return (
    <section
      aria-label="Your progress and what to do next"
      className="bg-card flex flex-col gap-5 rounded-2xl border p-5 shadow-xs md:flex-row md:items-center md:gap-8"
    >
      <div className="flex-1 space-y-2.5">
        <p className="text-foreground font-semibold">
          {s.checked} of {s.total} skills checked
        </p>
        <div
          role="img"
          aria-label={`${s.mastered} mastered, ${s.needs_revision} need revision, ${s.in_progress} in progress, ${s.todo} not checked yet, out of ${s.total}`}
          className="bg-muted flex h-2 overflow-hidden rounded-full"
        >
          <span className="bg-emerald-500" style={{ width: share(s.mastered) }} />
          <span className="bg-red-500" style={{ width: share(s.needs_revision) }} />
          <span className="bg-blue-500" style={{ width: share(s.in_progress) }} />
        </div>
        <p className="text-muted-foreground text-sm">
          {s.mastered} mastered · {s.needs_revision} to revise · {s.in_progress} in progress
        </p>
      </div>

      <div className="flex flex-col gap-3 border-t pt-5 md:w-80 md:border-t-0 md:border-l md:pt-0 md:pl-8">
        <div>
          <p className="text-muted-foreground text-xs font-medium">Up next</p>
          <h2 className="text-foreground text-base font-semibold">
            {NEXT_TITLE[next.kind](skill?.name ?? "")}
          </h2>
        </div>
        {skill ? (
          next.kind === "revise" ? (
            <Button asChild className="self-start">
              <Link href={`/learn/${skill.slug}`}>
                Study {skill.name}
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          ) : (
            <Button
              className="self-start"
              disabled={disabled}
              onClick={() => startCheck(startArgs(skill))}
            >
              {actionLabel(skill)}
              <ArrowRight data-icon="inline-end" />
            </Button>
          )
        ) : null}
      </div>
    </section>
  );
}

function SearchBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const id = useId();
  return (
    <div className="max-w-md space-y-1.5">
      <label htmlFor={id} className="text-foreground text-sm font-medium">
        Find a skill
      </label>
      <div className="relative">
        <Search
          aria-hidden
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
        />
        <input
          id={id}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. SQL, arrays, aptitude"
          autoComplete="off"
          className="border-input bg-card focus-visible:border-ring h-11 w-full rounded-xl border pr-10 pl-9 text-base outline-none md:text-sm [&::-webkit-search-cancel-button]:hidden"
        />
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear search"
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 absolute top-1/2 right-1.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg outline-none focus-visible:ring-3"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

/** One of the student's own skills. */
function SkillCard({
  skill,
  startCheck,
  disabled,
}: {
  skill: MySkill;
  startCheck: StartCheck;
  disabled: boolean;
}) {
  return (
    <li className="bg-card flex flex-col gap-4 rounded-2xl border p-5 shadow-xs">
      <div className="flex items-start gap-3">
        <TopicIcon topic={skill.topic} className="size-10" />
        <div className="min-w-0 space-y-1">
          <Link
            href={`/learn/${skill.slug}`}
            className="text-foreground focus-visible:ring-ring/50 rounded font-semibold underline-offset-4 outline-none hover:underline focus-visible:ring-3"
          >
            {skill.name}
          </Link>
          <div>
            <Status skill={skill} />
          </div>
        </div>
      </div>
      <Button
        variant="outline"
        className="mt-auto self-start"
        disabled={disabled}
        aria-label={`${actionLabel(skill)} — ${skill.name}`}
        onClick={() => startCheck(startArgs(skill))}
      >
        {actionLabel(skill)}
      </Button>
    </li>
  );
}

/** Any other skill: one simple row. */
function SkillRow({
  skill,
  startCheck,
  disabled,
}: {
  skill: MySkill;
  startCheck: StartCheck;
  disabled: boolean;
}) {
  return (
    <li className="bg-card flex min-h-16 items-center gap-3 rounded-xl border px-4 py-3">
      <div className="min-w-0 flex-1">
        <Link
          href={`/learn/${skill.slug}`}
          className="text-foreground focus-visible:ring-ring/50 rounded text-sm font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-3"
        >
          {skill.name}
        </Link>
        <div>
          <Status skill={skill} />
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="shrink-0"
        disabled={disabled}
        aria-label={`${actionLabel(skill)} — ${skill.name}`}
        onClick={() => startCheck(startArgs(skill))}
      >
        {actionLabel(skill)}
      </Button>
    </li>
  );
}

function TopicGroup({
  topic,
  skills,
  startCheck,
  disabled,
}: {
  topic: string;
  skills: MySkill[];
  startCheck: StartCheck;
  disabled: boolean;
}) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className="space-y-3">
      <div className="flex items-center gap-2.5">
        <TopicIcon topic={topic} className="size-8" />
        <h3 id={headingId} className="text-foreground font-semibold">
          {topic}
        </h3>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {skills.map((skill) => (
          <SkillRow key={skill.id} skill={skill} startCheck={startCheck} disabled={disabled} />
        ))}
      </ul>
    </section>
  );
}

function SkillChecksView({
  skills,
  unmatched,
  startCheck,
  starting,
}: {
  skills: MySkill[];
  unmatched: string[];
  startCheck: StartCheck;
  starting: boolean;
}) {
  const [query, setQuery] = useState("");
  const visible = skills.filter((s) => matches(s, query, "all"));
  const claimed = visible.filter((s) => s.claimed);
  const topics = groupByTopic(visible.filter((s) => !s.claimed));
  const anyClaimed = skills.some((s) => s.claimed);

  return (
    <div className="space-y-10">
      <Overview skills={skills} startCheck={startCheck} disabled={starting} />
      <SearchBox value={query} onChange={setQuery} />

      {visible.length === 0 ? (
        <EmptyPanel
          icon={SearchX}
          title="No skills match"
          description={`Nothing matches "${query.trim()}".`}
          action={
            <Button variant="outline" onClick={() => setQuery("")}>
              Show all skills
            </Button>
          }
        />
      ) : (
        <>
          {claimed.length ? (
            <section aria-labelledby="your-skills" className="space-y-4">
              <h2 id="your-skills" className="text-foreground text-lg font-semibold">
                Your skills
              </h2>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {claimed.map((skill) => (
                  <SkillCard
                    key={skill.id}
                    skill={skill}
                    startCheck={startCheck}
                    disabled={starting}
                  />
                ))}
              </ul>
              {unmatched.length && !query ? (
                <p className="text-muted-foreground text-sm">
                  Not in our catalogue yet: {unmatched.join(", ")}.
                </p>
              ) : null}
            </section>
          ) : !anyClaimed && !query ? (
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
          ) : null}

          {topics.length ? (
            <section aria-labelledby="all-skills" className="space-y-6">
              <h2 id="all-skills" className="text-foreground text-lg font-semibold">
                {anyClaimed ? "More skills" : "All skills"}
              </h2>
              {topics.map(({ topic, skills: list }) => (
                <TopicGroup
                  key={topic}
                  topic={topic}
                  skills={list}
                  startCheck={startCheck}
                  disabled={starting}
                />
              ))}
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}

/** /assessment — where the student stands on every skill, and the one thing to do next. */
export function SkillChecks() {
  const query = useGetMySkillsQuery();
  const { startCheck, starting, dialog } = useStartCheck();
  return (
    <>
      <QueryState query={query} skeleton={<PageSkeleton />} errorTitle="Couldn't load your skills">
        {({ skills, unmatched_claims }) => (
          <SkillChecksView
            skills={skills}
            unmatched={unmatched_claims}
            startCheck={startCheck}
            starting={starting}
          />
        )}
      </QueryState>
      {dialog}
    </>
  );
}
