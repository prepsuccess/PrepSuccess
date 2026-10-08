"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  CircleCheck,
  FileText,
  Search,
  SearchX,
  SlidersHorizontal,
  UserRoundCheck,
  X,
} from "lucide-react";
import { Badge } from "@/components/shadcn/badge";
import { Button } from "@/components/shadcn/button";
import { Skeleton } from "@/components/shadcn/skeleton";
import { DifficultyBars } from "@/components/app/DifficultyBars";
import { EmptyPanel } from "@/components/app/EmptyPanel";
import { SelectField } from "@/components/app/form-fields";
import { QueryState } from "@/components/ui/QueryState";
import {
  useGetMyQuestionScopeQuery,
  useGetQuestionFiltersQuery,
  useGetQuestionsQuery,
  type MyQuestionScope,
  type QuestionsQuery,
} from "@/lib/api/endpoints/questions";
import type { QuestionSummary } from "@/lib/api/types";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils/cn";

export const PAGE_SIZE = 20;
const ALL = "all";
const FILTER_KEYS = [
  "skill",
  "company",
  "role",
  "topic",
  "difficulty",
  "status",
  "q",
  "mine",
] as const;
type FilterKey = (typeof FILTER_KEYS)[number];

const DIFFICULTIES = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];
const STATUSES = [
  { value: "unsolved", label: "Not solved yet" },
  { value: "solved", label: "Solved" },
  { value: "bookmarked", label: "Bookmarked" },
];

/** Filters live in the URL (?skill=sql&company=TCS), so a filtered view can be shared. */
function useUrlFilters() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const value = (key: FilterKey) => params.get(key) ?? "";
  const page = Math.max(1, Number(params.get("page")) || 1);

  const set = (changes: Partial<Record<FilterKey | "page", string>>) => {
    // Start from the URL as it is now, not as it was at render: the search
    // debounce fires later and mustn't undo a filter picked in the meantime.
    const next = new URLSearchParams(window.location.search);
    for (const [key, val] of Object.entries(changes)) {
      if (val && val !== ALL) next.set(key, val);
      else next.delete(key);
    }
    // Any filter change starts again from page 1.
    if (!("page" in changes)) next.delete("page");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };
  const active = FILTER_KEYS.filter((key) => value(key)).length;
  // The dropdown filters only; search and "My skills" sit outside the panel.
  const picked = FILTER_KEYS.filter((key) => key !== "q" && key !== "mine" && value(key)).length;
  return {
    value,
    page,
    set,
    active,
    picked,
    clear: () => router.replace(pathname, { scroll: false }),
  };
}

function QuestionCard({ question }: { question: QuestionSummary }) {
  return (
    <li>
      <Link
        href={`/questions/${question.id}`}
        className="group bg-card hover:border-foreground/20 focus-visible:ring-ring/50 flex h-full flex-col gap-3 rounded-xl border p-4 shadow-xs transition-colors outline-none focus-visible:ring-3"
      >
        <div className="flex items-center justify-between gap-2">
          <DifficultyBars level={question.difficulty} />
          <span className="flex items-center gap-1.5">
            {question.solved ? (
              <Badge className="bg-success/10 text-success">
                <CircleCheck aria-hidden />
                Solved
              </Badge>
            ) : null}
            {question.bookmarked ? (
              <Badge variant="secondary">
                <Bookmark aria-hidden />
                Saved
              </Badge>
            ) : null}
          </span>
        </div>
        <p className="text-foreground leading-snug font-medium">{question.title}</p>
        <div className="text-muted-foreground mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          <span className="text-foreground font-medium">{question.skill.name}</span>
          <span aria-hidden>·</span>
          <span>{question.topic}</span>
          {question.company ? <Badge variant="outline">{question.company}</Badge> : null}
          {question.role ? <Badge variant="outline">{question.role}</Badge> : null}
        </div>
      </Link>
    </li>
  );
}

function ScopeChip({
  label,
  progress,
  active,
  onClick,
}: {
  label: string;
  progress?: { solved: number; total: number };
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={progress ? `${label}, ${progress.solved} of ${progress.total} solved` : label}
      onClick={onClick}
      className={cn(
        "focus-visible:ring-ring/50 flex min-h-9 flex-col justify-center gap-1 rounded-lg border px-3 py-1.5 text-sm outline-none focus-visible:ring-3 pointer-coarse:min-h-11",
        active
          ? "border-foreground bg-foreground text-background"
          : "bg-card hover:border-foreground/20",
      )}
    >
      <span className="flex items-baseline gap-1.5">
        <span className="font-medium">{label}</span>
        {progress ? (
          <span className="text-xs tabular-nums opacity-70">
            {progress.solved}/{progress.total}
          </span>
        ) : null}
      </span>
      {progress ? (
        <span aria-hidden className="block h-0.5 w-full overflow-hidden rounded-full bg-current/15">
          <span
            className="block h-full rounded-full bg-current"
            style={{ width: `${(progress.solved / progress.total) * 100}%` }}
          />
        </span>
      ) : null}
    </button>
  );
}

/**
 * With My skills on: a chip per skill with questions (solved/total; picking
 * one filters to it), and where the rest of the list comes from.
 */
function MyScope({
  scope,
  skill,
  onSkill,
}: {
  scope: MyQuestionScope;
  skill: string;
  onSkill: (slug: string) => void;
}) {
  const withQuestions = scope.progress.filter((s) => s.total > 0);
  const notes = [
    scope.goal_skills.length
      ? `From your goals: ${scope.goal_skills.map((s) => s.name).join(", ")}`
      : "",
    scope.role ? `Role: ${scope.role}` : "",
  ].filter(Boolean);
  return (
    <div className="space-y-2">
      {withQuestions.length ? (
        <div role="group" aria-label="Your skills" className="flex flex-wrap gap-2">
          <ScopeChip label="All" active={!skill} onClick={() => onSkill("")} />
          {withQuestions.map((s) => (
            <ScopeChip
              key={s.slug}
              label={s.name}
              progress={s}
              active={skill === s.slug}
              onClick={() => onSkill(s.slug)}
            />
          ))}
        </div>
      ) : null}
      <p className="text-muted-foreground text-sm">
        {notes.map((note) => (
          <span key={note}>{note} · </span>
        ))}
        <Link
          href="/profile"
          // A bigger tap area on touch screens, without changing the line.
          className="text-foreground relative underline underline-offset-4 pointer-coarse:after:absolute pointer-coarse:after:-inset-x-3 pointer-coarse:after:-inset-y-3.5"
        >
          Edit
        </Link>
      </p>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="grid gap-3 md:grid-cols-2" aria-hidden>
      {Array.from({ length: 6 }, (_, i) => (
        <Skeleton key={i} className="h-32 rounded-xl" />
      ))}
    </div>
  );
}

/** /questions — browse, search and filter the interview question bank. */
export function QuestionBank() {
  const filters = useUrlFilters();
  const skill = filters.value("skill");
  const { data: options } = useGetQuestionFiltersQuery(skill || undefined);
  const searchId = useId();
  const panelId = useId();
  // Closed by default; open when the page arrives already filtered (a shared link).
  const [showFilters, setShowFilters] = useState(() => filters.picked > 0);

  // "My skills": profile skills, skills named in goals, and the target role,
  // exactly as the server reads them for ?mine=1.
  const mine = filters.value("mine") === "1";
  const { data: scope } = useGetMyQuestionScopeQuery(undefined, { skip: !mine });
  const scopeEmpty = !!scope && !scope.skills.length && !scope.goal_skills.length && !scope.role;
  const noProfileSkills = mine && scopeEmpty;

  // Search updates the URL a moment after typing stops.
  const urlSearch = filters.value("q");
  const [search, setSearch] = useState(urlSearch);
  const [lastUrlSearch, setLastUrlSearch] = useState(urlSearch);
  if (urlSearch !== lastUrlSearch) {
    setLastUrlSearch(urlSearch);
    setSearch(urlSearch);
  }
  useEffect(() => {
    if (search.trim() === urlSearch) return;
    const timer = setTimeout(() => filters.set({ q: search.trim() }), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when the typed text changes
  }, [search]);

  const query: QuestionsQuery = {
    skill: skill || undefined,
    company: filters.value("company") || undefined,
    role: filters.value("role") || undefined,
    topic: filters.value("topic") || undefined,
    difficulty: (filters.value("difficulty") || undefined) as QuestionsQuery["difficulty"],
    status: (filters.value("status") || undefined) as QuestionsQuery["status"],
    q: urlSearch || undefined,
    mine: mine || undefined,
    page: filters.page,
    limit: PAGE_SIZE,
  };
  const result = useGetQuestionsQuery(query);

  // ?page past the end (a shared link, or fewer results now): go to the last page.
  const current = result.currentData;
  const lastPage = current ? Math.max(1, Math.ceil(current.meta.total / current.meta.limit)) : null;
  const pastEnd = !!current && current.questions.length === 0 && current.meta.total > 0;
  useEffect(() => {
    if (pastEnd && lastPage && filters.page > lastPage) {
      filters.set({ page: lastPage > 1 ? String(lastPage) : "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when the result changes
  }, [pastEnd, lastPage, filters.page]);

  const select = (
    key: FilterKey,
    label: string,
    all: string,
    choices: { value: string; label: string }[],
    extra?: Partial<Record<FilterKey, string>>,
  ) => (
    <SelectField
      label={label}
      value={filters.value(key) || ALL}
      onChange={(e) => filters.set({ [key]: e.target.value, ...extra })}
      options={[{ value: ALL, label: all }, ...choices]}
    />
  );
  const counted = (list: { name: string; count: number }[] = []) =>
    list.map((o) => ({ value: o.name, label: `${o.name} (${o.count})` }));

  return (
    // Bottom room on phones so the coach button doesn't cover the last card.
    <div className="space-y-6">
      {/* Two by two on phones rather than three and a straggler. */}
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <Button asChild variant="outline" size="sm" className="pointer-coarse:h-11">
          <Link href="/questions/bookmarks">
            <Bookmark />
            My bookmarks
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="pointer-coarse:h-11">
          <Link href="/prep-guides">
            <FileText />
            Prep guides
          </Link>
        </Button>
        <Button
          variant={mine ? "default" : "outline"}
          size="sm"
          aria-pressed={mine}
          onClick={() => {
            filters.set({ mine: mine ? "" : "1" });
            track("my_skills_toggled", { on: !mine });
          }}
          className="pointer-coarse:h-11"
        >
          <UserRoundCheck />
          My skills
        </Button>
        <Button
          variant={showFilters ? "secondary" : "outline"}
          size="sm"
          aria-expanded={showFilters}
          aria-controls={panelId}
          aria-label={filters.picked ? `Filters, ${filters.picked} on` : undefined}
          onClick={() => setShowFilters((open) => !open)}
          className="pointer-coarse:h-11"
        >
          <SlidersHorizontal />
          Filters
          {filters.picked ? (
            <Badge aria-hidden className="ml-0.5 h-5 min-w-5 px-1.5 tabular-nums">
              {filters.picked}
            </Badge>
          ) : null}
        </Button>
      </div>

      <div className="space-y-1.5">
        <label htmlFor={searchId} className="text-foreground text-sm font-medium">
          Search questions
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
            placeholder="e.g. joins, closures, deadlock"
            autoComplete="off"
            className="border-input bg-card focus-visible:border-ring h-11 w-full rounded-xl border pr-10 pl-9 text-base outline-none md:text-sm [&::-webkit-search-cancel-button]:hidden"
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

      {mine && scope && !scopeEmpty ? (
        <MyScope
          scope={scope}
          skill={skill}
          // A new skill has its own topics, so the topic filter resets.
          onSkill={(slug) => filters.set({ skill: slug, topic: "" })}
        />
      ) : null}

      <section
        id={panelId}
        aria-label="Filters"
        hidden={!showFilters}
        className="bg-card space-y-4 rounded-2xl border p-4 shadow-xs"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* A new skill has its own topics, so the topic filter resets. */}
          {select(
            "skill",
            "Skill",
            "All skills",
            (options?.skills ?? []).map((s) => ({
              value: s.slug,
              label: `${s.name} (${s.count})`,
            })),
            { topic: "" },
          )}
          {skill ? select("topic", "Topic", "All topics", counted(options?.topics)) : null}
          {select("company", "Company", "Any company", counted(options?.companies))}
          {select("role", "Role", "Any role", counted(options?.roles))}
          {select("difficulty", "Difficulty", "Any difficulty", DIFFICULTIES)}
          {select("status", "Your progress", "All questions", STATUSES)}
        </div>
        {filters.picked ? (
          <Button
            variant="ghost"
            size="sm"
            // Resets the dropdowns only; the search box has its own clear button.
            onClick={() =>
              filters.set({
                skill: "",
                company: "",
                role: "",
                topic: "",
                difficulty: "",
                status: "",
              })
            }
            className="pointer-coarse:h-11"
          >
            <X />
            Clear filters
          </Button>
        ) : null}
      </section>

      <QueryState
        query={result}
        skeleton={<ListSkeleton />}
        errorTitle="Couldn't load questions"
        isEmpty={(data) => data.meta.total === 0}
        empty={
          noProfileSkills ? (
            <EmptyPanel
              icon={UserRoundCheck}
              title="No skills on your profile yet"
              description="Add the skills you know to your profile, and My skills shows questions for just those."
              action={
                <Button asChild variant="outline">
                  <Link href="/profile">Add skills</Link>
                </Button>
              }
            />
          ) : (
            <EmptyPanel
              icon={SearchX}
              title="No questions match"
              description="Try fewer filters or a different search."
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    filters.clear();
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          )
        }
      >
        {({ questions, meta }) => {
          const pages = Math.max(1, Math.ceil(meta.total / meta.limit));
          return (
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm" aria-live="polite">
                {meta.total} question{meta.total === 1 ? "" : "s"}
              </p>
              <ul className="grid gap-3 md:grid-cols-2">
                {questions.map((q) => (
                  <QuestionCard key={q.id} question={q} />
                ))}
              </ul>
              {pages > 1 ? (
                <nav aria-label="Pages" className="flex items-center justify-between gap-3">
                  <Button
                    variant="outline"
                    disabled={meta.page <= 1}
                    onClick={() => filters.set({ page: String(meta.page - 1) })}
                  >
                    <ArrowLeft />
                    Previous
                  </Button>
                  <span className="text-muted-foreground text-sm tabular-nums">
                    Page {meta.page} of {pages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={meta.page >= pages}
                    onClick={() => filters.set({ page: String(meta.page + 1) })}
                  >
                    Next
                    <ArrowRight />
                  </Button>
                </nav>
              ) : null}
            </div>
          );
        }}
      </QueryState>
    </div>
  );
}
