"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Loader2,
  MessageSquareText,
  Plus,
} from "lucide-react";
import toast from "react-hot-toast";
import { EmptyPanel } from "@/components/app/EmptyPanel";
import { SelectField, TextareaField, TextField } from "@/components/app/form-fields";
import { Alert, AlertDescription, AlertTitle } from "@/components/shadcn/alert";
import { Badge } from "@/components/shadcn/badge";
import { Button } from "@/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/dialog";
import { Skeleton } from "@/components/shadcn/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn/table";
import { ErrorState } from "@/components/ui/ErrorState";
import {
  useCreateAdminQuestionMutation,
  useDeleteAdminQuestionMutation,
  useGetAdminQuestionsQuery,
  useGetAdminSkillsQuery,
  useGetQuestionTaxonomyQuery,
  useUpdateAdminQuestionMutation,
  type AdminQuestionsQuery,
} from "@/lib/api/endpoints/admin";
import { errorMessage, fieldErrors } from "@/lib/api/errors";
import type { AdminQuestion, AdminQuestionInput, AdminSkill } from "@/lib/api/types";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";

const PAGE_SIZE = 20;
// Radix Select can't hold "", so "no company / role / skill filter" needs a stand-in value.
const NONE = "none";
const ALL = "all";

const DIFFICULTIES = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

type Values = {
  skill_id: string;
  title: string;
  topic: string;
  difficulty: string;
  company: string;
  role: string;
  body: string;
  answer: string;
  is_active: boolean;
};
type TextKey = Exclude<keyof Values, "is_active">;
type Errors = Partial<Record<keyof Values, string>>;

function initialValues(question: AdminQuestion | null): Values {
  return {
    skill_id: question?.skill.id ?? "",
    title: question?.title ?? "",
    topic: question?.topic ?? "",
    difficulty: question?.difficulty ?? "medium",
    company: question?.company ?? NONE,
    role: question?.role ?? NONE,
    body: question?.body ?? "",
    answer: question?.answer ?? "",
    is_active: question?.is_active ?? true,
  };
}

// Same limits as the API, so most mistakes are caught before a round trip.
function validate(v: Values): Errors {
  const title = v.title.trim().length;
  return {
    skill_id: v.skill_id ? undefined : "Choose a skill.",
    title: title < 5 || title > 200 ? "Use 5 to 200 characters." : undefined,
    topic: v.topic.trim().length < 2 ? "Enter a topic, e.g. Joins." : undefined,
    body: v.body.trim().length < 10 ? "Write the question (at least 10 characters)." : undefined,
  };
}

function toPayload(v: Values): AdminQuestionInput {
  return {
    skill_id: v.skill_id,
    title: v.title.trim(),
    topic: v.topic.trim(),
    difficulty: v.difficulty as AdminQuestionInput["difficulty"],
    company: v.company === NONE ? null : (v.company as AdminQuestionInput["company"]),
    role: v.role === NONE ? null : (v.role as AdminQuestionInput["role"]),
    body: v.body.trim(),
    // An empty answer box clears the answer.
    answer: v.answer.trim() || null,
    is_active: v.is_active,
  };
}

/** Add / edit form. Mounted fresh for each question, so it always starts from that question. */
function QuestionForm({
  question,
  skills,
  onDone,
}: {
  question: AdminQuestion | null;
  skills: AdminSkill[];
  onDone: () => void;
}) {
  const [values, setValues] = useState(() => initialValues(question));
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [create, { isLoading: creating }] = useCreateAdminQuestionMutation();
  const [update, { isLoading: updating }] = useUpdateAdminQuestionMutation();
  const taxonomy = useGetQuestionTaxonomyQuery();
  const activeId = useId();
  const saving = creating || updating;

  const field = (name: TextKey) => ({
    name,
    value: values[name],
    error: errors[name],
    onChange: (e: { target: { value: string } }) =>
      setValues((current) => ({ ...current, [name]: e.target.value })),
  });
  const tagOptions = (list: string[] | undefined, none: string) => [
    { value: NONE, label: none },
    ...(list ?? []).map((value) => ({ value, label: value })),
  ];

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    setFormError(null);
    if (Object.values(found).some(Boolean)) return;

    try {
      if (question) {
        await update({ id: question.id, ...toPayload(values) }).unwrap();
        toast.success("Question saved.");
      } else {
        await create(toPayload(values)).unwrap();
        toast.success("Question added.");
      }
      onDone();
    } catch (error) {
      // Server-side validation lands on the matching field; anything else goes in the banner.
      const byField = fieldErrors(error) as Errors;
      if (Object.keys(byField).length > 0) setErrors(byField);
      else setFormError(errorMessage(error));
    }
  }

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-5">
      {formError ? (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertTitle>Couldn&apos;t save the question</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}
      <TextField
        label="Title"
        required
        maxLength={200}
        placeholder="e.g. What is the difference between WHERE and HAVING?"
        {...field("title")}
      />
      <div className="grid gap-x-4 gap-y-5 sm:grid-cols-3">
        <SelectField
          label="Skill"
          placeholder="Choose a skill"
          options={skills.map((s) => ({ value: s.id, label: s.name }))}
          required
          {...field("skill_id")}
        />
        <TextField
          label="Topic"
          required
          maxLength={100}
          placeholder="e.g. Joins"
          {...field("topic")}
        />
        <SelectField label="Difficulty" options={DIFFICULTIES} {...field("difficulty")} />
        <SelectField
          label="Company"
          options={tagOptions(taxonomy.data?.companies, "Any company")}
          disabled={!taxonomy.data}
          {...field("company")}
        />
        <SelectField
          label="Role"
          options={tagOptions(taxonomy.data?.roles, "Any role")}
          disabled={!taxonomy.data}
          {...field("role")}
        />
      </div>
      <TextareaField
        label="Question"
        required
        rows={6}
        maxLength={10000}
        description="Blank line = new paragraph. Start a line with “- ” for a list. Wrap code in ``` lines."
        {...field("body")}
      />
      <TextareaField
        label="Answer or hints"
        rows={6}
        maxLength={10000}
        description="Optional. Students see it only when they ask. Same formatting as the question."
        {...field("answer")}
      />
      <div className="flex items-center gap-2 text-sm">
        <input
          id={activeId}
          type="checkbox"
          checked={values.is_active}
          onChange={(e) => setValues((current) => ({ ...current, is_active: e.target.checked }))}
          className="accent-primary size-4 pointer-coarse:size-5"
        />
        <label htmlFor={activeId}>Show to students</label>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving} aria-busy={saving || undefined}>
          {saving ? <Loader2 className="animate-spin" aria-hidden /> : null}
          {question ? "Save changes" : "Add question"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function ActiveButton({ question }: { question: AdminQuestion }) {
  const [update, { isLoading }] = useUpdateAdminQuestionMutation();
  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={isLoading}
      aria-label={`${question.is_active ? "Hide" : "Show"} “${question.title}” for students`}
      onClick={async () => {
        try {
          await update({ id: question.id, is_active: !question.is_active }).unwrap();
        } catch (error) {
          toast.error(errorMessage(error));
        }
      }}
    >
      {question.is_active ? "Hide" : "Show"}
    </Button>
  );
}

/** /admin/content → Interview questions: the bank students browse at /questions. */
export function QuestionsManager() {
  const [filters, setFilters] = useState<Omit<AdminQuestionsQuery, "limit">>({ page: 1 });
  const [search, setSearch] = useState("");
  // null = dialog closed, "new" = adding, otherwise the question being edited.
  const [editing, setEditing] = useState<AdminQuestion | "new" | null>(null);
  const [deleting, setDeleting] = useState<AdminQuestion | null>(null);
  const query = useGetAdminQuestionsQuery({ ...filters, limit: PAGE_SIZE });
  const skills = useGetAdminSkillsQuery();
  const [remove] = useDeleteAdminQuestionMutation();

  // Search as the admin types, without a request per keystroke.
  useEffect(() => {
    const q = search.trim() || undefined;
    const timer = setTimeout(() => setFilters((f) => (f.q === q ? f : { ...f, q, page: 1 })), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const total = query.data?.meta.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const filtered = Boolean(filters.skill || filters.q);
  const editingQuestion = editing === "new" ? null : editing;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-56">
          <SelectField
            label="Skill"
            value={filters.skill ?? ALL}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                skill: e.target.value === ALL ? undefined : e.target.value,
                page: 1,
              }))
            }
            options={[
              { value: ALL, label: "All skills" },
              ...(skills.data ?? []).map((s) => ({ value: s.slug, label: s.name })),
            ]}
          />
        </div>
        <div className="w-full sm:w-72">
          <TextField
            label="Search titles"
            type="search"
            placeholder="e.g. HAVING"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="ml-auto flex items-center gap-3">
          {query.data ? (
            <p className="text-muted-foreground text-sm" aria-live="polite">
              {total.toLocaleString()} {total === 1 ? "question" : "questions"}
            </p>
          ) : null}
          <Button onClick={() => setEditing("new")} disabled={!skills.data}>
            <Plus aria-hidden />
            Add question
          </Button>
        </div>
      </div>

      {query.isError ? (
        <ErrorState
          error={query.error}
          title="Couldn't load questions"
          onRetry={() => void query.refetch()}
        />
      ) : query.isLoading ? (
        <Skeleton className="h-96 w-full rounded-lg" aria-hidden />
      ) : !query.data?.questions.length ? (
        <EmptyPanel
          icon={MessageSquareText}
          title={filtered ? "No questions match" : "No questions yet"}
          description={
            filtered
              ? "Try another skill or search term."
              : "Add the first one, and students will see it under Interview prep."
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table aria-busy={query.isFetching || undefined}>
            <caption className="sr-only">Interview questions, newest changes first</caption>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead>Skill</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.data.questions.map((question) => (
                <TableRow key={question.id} className={question.is_active ? "" : "opacity-60"}>
                  <TableCell className="max-w-md whitespace-normal">
                    <span className="font-medium">{question.title}</span>
                    <span className="text-muted-foreground block text-xs">{question.topic}</span>
                  </TableCell>
                  <TableCell>{question.skill.name}</TableCell>
                  <TableCell className="capitalize">{question.difficulty}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {question.company ? (
                        <Badge variant="secondary">{question.company}</Badge>
                      ) : null}
                      {question.role ? <Badge variant="outline">{question.role}</Badge> : null}
                      {!question.company && !question.role ? (
                        <span className="text-muted-foreground">—</span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    {question.is_active ? "Live" : <Badge variant="outline">Hidden</Badge>}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        aria-label={`Edit “${question.title}”`}
                        onClick={() => setEditing(question)}
                      >
                        Edit
                      </Button>
                      <ActiveButton question={question} />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        aria-label={`Delete “${question.title}”`}
                        onClick={() => setDeleting(question)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {pages > 1 ? (
        <div className="flex items-center justify-end gap-2 text-sm">
          <span className="text-muted-foreground tabular-nums">
            Page {filters.page} of {pages}
          </span>
          <Button
            variant="outline"
            size="icon"
            aria-label="Previous page"
            disabled={filters.page <= 1 || query.isFetching}
            onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Next page"
            disabled={filters.page >= pages || query.isFetching}
            onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
          >
            <ChevronRight />
          </Button>
        </div>
      ) : null}

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingQuestion ? "Edit question" : "Add a question"}</DialogTitle>
            <DialogDescription>
              Students find it in the question bank, filtered by skill, company and role.
            </DialogDescription>
          </DialogHeader>
          {editing !== null ? (
            <QuestionForm
              key={editingQuestion?.id ?? "new"}
              question={editingQuestion}
              skills={skills.data ?? []}
              onDone={() => setEditing(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={deleting !== null}
        title={`Delete “${deleting?.title ?? ""}”?`}
        description="It disappears from the question bank for everyone. Students' solved and bookmark history is kept."
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await remove(deleting.id).unwrap();
            toast.success("Question deleted.");
            setDeleting(null);
          } catch (error) {
            toast.error(errorMessage(error));
          }
        }}
      />
    </div>
  );
}
