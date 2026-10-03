"use client";

import { useId, useState, type FormEvent } from "react";
import { ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/shadcn/badge";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { NativeSelect, NativeSelectOption } from "@/components/shadcn/native-select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/shadcn/sheet";
import { Skeleton } from "@/components/shadcn/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn/table";
import { Textarea } from "@/components/shadcn/textarea";
import { QueryState } from "@/components/ui/QueryState";
import {
  useCreateAdminResourceMutation,
  useDeleteAdminResourceMutation,
  useGetAdminResourcesQuery,
  useGetAdminSkillsQuery,
  useGetAdminTasksQuery,
  useUpdateAdminSkillMutation,
  useUpdateAdminTaskMutation,
} from "@/lib/api/endpoints/admin";
import { errorMessage, fieldErrors } from "@/lib/api/errors";
import type { AdminResource, AdminSkill } from "@/lib/api/types";

const CATEGORY_LABEL: Record<AdminSkill["category"], string> = {
  technical: "Technical",
  aptitude: "Aptitude",
  soft: "Soft",
};

/** Edits the pass mark inline; saves on blur or Enter. Past results keep their old pass mark. */
function PassMarkInput({ skill }: { skill: AdminSkill }) {
  const [update, { isLoading }] = useUpdateAdminSkillMutation();
  const [value, setValue] = useState(String(skill.mastery_threshold));

  async function save() {
    const next = Number(value);
    if (!Number.isInteger(next) || next < 1 || next > 100) {
      setValue(String(skill.mastery_threshold));
      toast.error("Use a whole number from 1 to 100.");
      return;
    }
    if (next === skill.mastery_threshold) return;
    try {
      await update({ id: skill.id, mastery_threshold: next }).unwrap();
      toast.success(`${skill.name}: pass mark is now ${next}% for new checks.`);
    } catch (error) {
      setValue(String(skill.mastery_threshold));
      toast.error(errorMessage(error));
    }
  }

  return (
    <Input
      type="number"
      min={1}
      max={100}
      inputMode="numeric"
      value={value}
      disabled={isLoading}
      aria-label={`Pass mark for ${skill.name}, percent`}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => void save()}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
      className="h-8 w-20 tabular-nums"
    />
  );
}

function VisibilityButton({ skill }: { skill: AdminSkill }) {
  const [update, { isLoading }] = useUpdateAdminSkillMutation();
  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={isLoading}
      aria-label={`${skill.is_active ? "Hide" : "Show"} ${skill.name} for students`}
      onClick={async () => {
        try {
          await update({ id: skill.id, is_active: !skill.is_active }).unwrap();
        } catch (error) {
          toast.error(errorMessage(error));
        }
      }}
    >
      {skill.is_active ? "Hide" : "Show"}
    </Button>
  );
}

function AddResourceForm({ skillId }: { skillId: string }) {
  const [create, { isLoading, error, reset }] = useCreateAdminResourceMutation();
  const [kind, setKind] = useState<"link" | "notes">("link");
  const [form, setForm] = useState({
    title: "",
    url: "",
    content: "",
    source: "",
    type: "reference",
  });
  const errors = fieldErrors(error);
  const ids = { title: useId(), url: useId(), content: useId(), source: useId(), type: useId() };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await create({
        skill_id: skillId,
        title: form.title,
        type: form.type as AdminResource["type"],
        source: form.source || null,
        ...(kind === "link" ? { url: form.url } : { content: form.content }),
      }).unwrap();
      setForm({ title: "", url: "", content: "", source: "", type: form.type });
      toast.success("Resource added.");
    } catch {
      // Shown below.
    }
  }

  const set = (key: keyof typeof form) => (value: string) => {
    if (error) reset();
    setForm((f) => ({ ...f, [key]: value }));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-lg border p-4">
      <h3 className="text-foreground text-sm font-semibold">Add a resource</h3>
      <div className="flex gap-2" role="radiogroup" aria-label="Resource kind">
        {(["link", "notes"] as const).map((k) => (
          <Button
            key={k}
            type="button"
            size="sm"
            role="radio"
            aria-checked={kind === k}
            variant={kind === k ? "secondary" : "ghost"}
            onClick={() => setKind(k)}
          >
            {k === "link" ? "Link" : "Our notes"}
          </Button>
        ))}
      </div>
      <div className="space-y-1">
        <label htmlFor={ids.title} className="text-sm font-medium">
          Title
        </label>
        <Input
          id={ids.title}
          value={form.title}
          onChange={(e) => set("title")(e.target.value)}
          required
          maxLength={200}
        />
        {errors.title ? <p className="text-destructive text-xs">{errors.title}</p> : null}
      </div>
      {kind === "link" ? (
        <div className="space-y-1">
          <label htmlFor={ids.url} className="text-sm font-medium">
            Link
          </label>
          <Input
            id={ids.url}
            type="url"
            placeholder="https://"
            value={form.url}
            onChange={(e) => set("url")(e.target.value)}
            required
          />
          {errors.url ? <p className="text-destructive text-xs">{errors.url}</p> : null}
        </div>
      ) : (
        <div className="space-y-1">
          <label htmlFor={ids.content} className="text-sm font-medium">
            Notes
          </label>
          <Textarea
            id={ids.content}
            rows={6}
            value={form.content}
            onChange={(e) => set("content")(e.target.value)}
            required
          />
          <p className="text-muted-foreground text-xs">
            Blank line = new paragraph. Start a line with &quot;- &quot; for a list.
          </p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor={ids.type} className="text-sm font-medium">
            Type
          </label>
          <NativeSelect
            id={ids.type}
            value={form.type}
            onChange={(e) => set("type")(e.target.value)}
          >
            <NativeSelectOption value="reference">Reference</NativeSelectOption>
            <NativeSelectOption value="example">Examples</NativeSelectOption>
            <NativeSelectOption value="lecture">Course</NativeSelectOption>
            <NativeSelectOption value="practice">Practice</NativeSelectOption>
          </NativeSelect>
        </div>
        <div className="space-y-1">
          <label htmlFor={ids.source} className="text-sm font-medium">
            Source
          </label>
          <Input
            id={ids.source}
            placeholder="e.g. MDN"
            value={form.source}
            onChange={(e) => set("source")(e.target.value)}
            maxLength={100}
          />
        </div>
      </div>
      {error && !Object.keys(errors).length ? (
        <p className="text-destructive text-sm" role="alert">
          {errorMessage(error)}
        </p>
      ) : null}
      <Button type="submit" size="sm" disabled={isLoading}>
        Add resource
      </Button>
    </form>
  );
}

function SkillPanel({ skill }: { skill: AdminSkill }) {
  const resources = useGetAdminResourcesQuery(skill.id);
  const tasks = useGetAdminTasksQuery(skill.id);
  const [remove] = useDeleteAdminResourceMutation();
  const [updateTask] = useUpdateAdminTaskMutation();

  return (
    <div className="space-y-6 px-4 pb-6">
      <section aria-labelledby="panel-resources" className="space-y-3">
        <h3 id="panel-resources" className="text-foreground text-sm font-semibold">
          Learning resources
        </h3>
        <QueryState query={resources} skeleton={<Skeleton className="h-24 w-full" />}>
          {(list) =>
            list.length ? (
              <ul className="divide-y rounded-lg border">
                {list.map((r) => (
                  <li key={r.id} className="flex items-start gap-3 px-3 py-2.5 text-sm">
                    <span className="min-w-0 flex-1">
                      <span className="text-foreground block font-medium">{r.title}</span>
                      <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                        <span className="capitalize">{r.type}</span> · {r.source ?? "—"}
                        {r.url ? (
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-foreground inline-flex items-center gap-0.5 underline underline-offset-2"
                          >
                            open <ExternalLink className="size-3" aria-hidden />
                          </a>
                        ) : (
                          " · our notes"
                        )}
                      </span>
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Remove ${r.title}`}
                      onClick={async () => {
                        try {
                          await remove({ id: r.id, skillId: skill.id }).unwrap();
                          toast.success("Resource removed.");
                        } catch (error) {
                          toast.error(errorMessage(error));
                        }
                      }}
                    >
                      <Trash2 />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">No resources yet.</p>
            )
          }
        </QueryState>
        <AddResourceForm skillId={skill.id} />
      </section>

      <section aria-labelledby="panel-tasks" className="space-y-3">
        <h3 id="panel-tasks" className="text-foreground text-sm font-semibold">
          Practical tasks
        </h3>
        <QueryState query={tasks} skeleton={<Skeleton className="h-16 w-full" />}>
          {(list) =>
            list.length ? (
              <ul className="divide-y rounded-lg border">
                {list.map((t) => (
                  <li key={t.id} className="flex items-center gap-3 px-3 py-2.5 text-sm">
                    <span className="min-w-0 flex-1">
                      <span className="text-foreground block font-medium">{t.title}</span>
                      <span className="text-muted-foreground text-xs capitalize">
                        {t.difficulty} · {t.rubric.length} rubric items ·{" "}
                        {t.rubric.reduce((s, c) => s + c.points, 0)} points
                      </span>
                    </span>
                    {t.is_active ? null : <Badge variant="outline">Hidden</Badge>}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        try {
                          await updateTask({ id: t.id, is_active: !t.is_active }).unwrap();
                        } catch (error) {
                          toast.error(errorMessage(error));
                        }
                      }}
                    >
                      {t.is_active ? "Hide" : "Show"}
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">No tasks yet.</p>
            )
          }
        </QueryState>
        <p className="text-muted-foreground text-xs">
          New tasks and rubric edits go through the API (POST/PATCH /api/v1/admin/tasks) or the seed
          catalogue for now.
        </p>
      </section>
    </div>
  );
}

/** /admin/content — the skill taxonomy, each skill's pass mark, resources and tasks. */
export function ContentManager() {
  const query = useGetAdminSkillsQuery();
  const [openId, setOpenId] = useState<string | null>(null);
  const open = query.data?.find((s) => s.id === openId) ?? null;

  return (
    <>
      <QueryState
        query={query}
        skeleton={<Skeleton className="h-96 w-full rounded-lg" aria-hidden />}
        errorTitle="Couldn't load skills"
      >
        {(skills) => (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <caption className="sr-only">Skills, with their pass marks and content</caption>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Skill</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Pass mark</TableHead>
                  <TableHead className="text-right">Resources</TableHead>
                  <TableHead className="text-right">Tasks</TableHead>
                  <TableHead className="text-right">Checks</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {skills.map((skill) => (
                  <TableRow key={skill.id} className={skill.is_active ? "" : "opacity-60"}>
                    <TableCell>
                      <span className="font-medium">{skill.name}</span>
                      {skill.is_active ? null : (
                        <Badge variant="outline" className="ml-2">
                          Hidden
                        </Badge>
                      )}
                      <span className="text-muted-foreground block text-xs">{skill.topic}</span>
                    </TableCell>
                    <TableCell>{CATEGORY_LABEL[skill.category]}</TableCell>
                    <TableCell>
                      <PassMarkInput key={skill.mastery_threshold} skill={skill} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{skill.resources}</TableCell>
                    <TableCell className="text-right tabular-nums">{skill.tasks}</TableCell>
                    <TableCell className="text-right tabular-nums">{skill.checks}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="outline" onClick={() => setOpenId(skill.id)}>
                          Content
                        </Button>
                        <VisibilityButton skill={skill} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </QueryState>

      <Sheet open={Boolean(open)} onOpenChange={(v) => !v && setOpenId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{open?.name}</SheetTitle>
            <SheetDescription>
              What students see on this skill&apos;s Learn page. Removing a resource hides it;
              nothing students already used is deleted.
            </SheetDescription>
          </SheetHeader>
          {open ? <SkillPanel skill={open} /> : null}
        </SheetContent>
      </Sheet>
    </>
  );
}
