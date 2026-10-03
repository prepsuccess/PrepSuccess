"use client";

import { useId, useState, type FormEvent } from "react";
import { CircleAlert, ExternalLink, FileText, Loader2, Plus } from "lucide-react";
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
import { QueryState } from "@/components/ui/QueryState";
import {
  useCreateAdminPrepPdfMutation,
  useDeleteAdminPrepPdfMutation,
  useGetAdminPrepPdfsQuery,
  useGetAdminSkillsQuery,
  useGetQuestionTaxonomyQuery,
  useUpdateAdminPrepPdfMutation,
} from "@/lib/api/endpoints/admin";
import { errorMessage, fieldErrors } from "@/lib/api/errors";
import type { AdminPrepPdf, AdminPrepPdfInput, AdminSkill } from "@/lib/api/types";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";

// Radix Select can't hold "", so "not tied to a skill / company / role" needs a stand-in value.
const NONE = "none";

type Values = {
  title: string;
  description: string;
  skill_id: string;
  company: string;
  role: string;
  file_url: string;
  size_label: string;
  is_active: boolean;
};
type TextKey = Exclude<keyof Values, "is_active">;
type Errors = Partial<Record<keyof Values, string>>;

function initialValues(pdf: AdminPrepPdf | null): Values {
  return {
    title: pdf?.title ?? "",
    description: pdf?.description ?? "",
    skill_id: pdf?.skill?.id ?? NONE,
    company: pdf?.company ?? NONE,
    role: pdf?.role ?? NONE,
    file_url: pdf?.file_url ?? "",
    size_label: pdf?.size_label ?? "",
    is_active: pdf?.is_active ?? true,
  };
}

function validate(v: Values): Errors {
  const title = v.title.trim().length;
  return {
    title: title < 5 || title > 200 ? "Use 5 to 200 characters." : undefined,
    file_url: /^https:\/\/\S+$/.test(v.file_url.trim())
      ? undefined
      : "Paste a full link, starting with https://",
  };
}

function toPayload(v: Values): AdminPrepPdfInput {
  const text = (value: string) => value.trim() || null;
  return {
    title: v.title.trim(),
    description: text(v.description),
    skill_id: v.skill_id === NONE ? null : v.skill_id,
    company: v.company === NONE ? null : (v.company as AdminPrepPdfInput["company"]),
    role: v.role === NONE ? null : (v.role as AdminPrepPdfInput["role"]),
    file_url: v.file_url.trim(),
    size_label: text(v.size_label),
    is_active: v.is_active,
  };
}

/** Add / edit form. Mounted fresh for each guide, so it always starts from that guide. */
function PrepPdfForm({
  pdf,
  skills,
  onDone,
}: {
  pdf: AdminPrepPdf | null;
  skills: AdminSkill[];
  onDone: () => void;
}) {
  const [values, setValues] = useState(() => initialValues(pdf));
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [create, { isLoading: creating }] = useCreateAdminPrepPdfMutation();
  const [update, { isLoading: updating }] = useUpdateAdminPrepPdfMutation();
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
      if (pdf) {
        await update({ id: pdf.id, ...toPayload(values) }).unwrap();
        toast.success("Guide saved.");
      } else {
        await create(toPayload(values)).unwrap();
        toast.success("Guide added.");
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
          <AlertTitle>Couldn&apos;t save the guide</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}
      <TextField
        label="Title"
        required
        maxLength={200}
        placeholder="e.g. SDE interview guide"
        {...field("title")}
      />
      <TextField
        label="Link to the PDF"
        type="url"
        inputMode="url"
        required
        maxLength={500}
        placeholder="https://"
        description="Paste a public link to the PDF, e.g. Google Drive 'anyone with the link'."
        {...field("file_url")}
      />
      <TextareaField
        label="Description"
        rows={3}
        maxLength={500}
        description="Optional. One or two lines on what's inside."
        {...field("description")}
      />
      <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
        <SelectField
          label="Skill"
          options={[
            { value: NONE, label: "Any skill" },
            ...skills.map((s) => ({ value: s.id, label: s.name })),
          ]}
          {...field("skill_id")}
        />
        <TextField
          label="Size"
          maxLength={50}
          placeholder="e.g. 12 pages"
          {...field("size_label")}
        />
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
          {pdf ? "Save changes" : "Add guide"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function ActiveButton({ pdf }: { pdf: AdminPrepPdf }) {
  const [update, { isLoading }] = useUpdateAdminPrepPdfMutation();
  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={isLoading}
      aria-label={`${pdf.is_active ? "Hide" : "Show"} “${pdf.title}” for students`}
      onClick={async () => {
        try {
          await update({ id: pdf.id, is_active: !pdf.is_active }).unwrap();
        } catch (error) {
          toast.error(errorMessage(error));
        }
      }}
    >
      {pdf.is_active ? "Hide" : "Show"}
    </Button>
  );
}

/** /admin/content → Prep guides: the PDFs students download from /prep-guides. */
export function PrepPdfsManager() {
  const query = useGetAdminPrepPdfsQuery();
  const skills = useGetAdminSkillsQuery();
  const [remove] = useDeleteAdminPrepPdfMutation();
  // null = dialog closed, "new" = adding, otherwise the guide being edited.
  const [editing, setEditing] = useState<AdminPrepPdf | "new" | null>(null);
  const [deleting, setDeleting] = useState<AdminPrepPdf | null>(null);
  const editingPdf = editing === "new" ? null : editing;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setEditing("new")} disabled={!skills.data}>
          <Plus aria-hidden />
          Add guide
        </Button>
      </div>

      <QueryState
        query={query}
        skeleton={<Skeleton className="h-64 w-full rounded-lg" aria-hidden />}
        errorTitle="Couldn't load prep guides"
        isEmpty={(list) => list.length === 0}
        empty={
          <EmptyPanel
            icon={FileText}
            title="No prep guides yet"
            description="Add a PDF link, and students can download it from Prep guides."
          />
        }
      >
        {(pdfs) => (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <caption className="sr-only">Prep guides, with their downloads</caption>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Guide</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead className="text-right">Downloads</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pdfs.map((pdf) => {
                  const tags = [pdf.skill?.name, pdf.company, pdf.role].filter(Boolean);
                  return (
                    <TableRow key={pdf.id} className={pdf.is_active ? "" : "opacity-60"}>
                      <TableCell className="max-w-md whitespace-normal">
                        <span className="font-medium">{pdf.title}</span>
                        <span className="text-muted-foreground block text-xs">
                          {[pdf.size_label, pdf.description].filter(Boolean).join(" · ") || "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {tags.length ? (
                            tags.map((tag) => (
                              <Badge key={tag} variant="outline">
                                {tag}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <a
                          href={pdf.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 underline underline-offset-2"
                        >
                          Open <ExternalLink className="size-3" aria-hidden />
                          <span className="sr-only">{pdf.title} (opens in a new tab)</span>
                        </a>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {pdf.downloads.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {pdf.is_active ? "Live" : <Badge variant="outline">Hidden</Badge>}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            aria-label={`Edit “${pdf.title}”`}
                            onClick={() => setEditing(pdf)}
                          >
                            Edit
                          </Button>
                          <ActiveButton pdf={pdf} />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            aria-label={`Delete “${pdf.title}”`}
                            onClick={() => setDeleting(pdf)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </QueryState>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingPdf ? "Edit guide" : "Add a prep guide"}</DialogTitle>
            <DialogDescription>
              Students download it from Prep guides. We count each download.
            </DialogDescription>
          </DialogHeader>
          {editing !== null ? (
            <PrepPdfForm
              key={editingPdf?.id ?? "new"}
              pdf={editingPdf}
              skills={skills.data ?? []}
              onDone={() => setEditing(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={deleting !== null}
        title={`Delete “${deleting?.title ?? ""}”?`}
        description="Students can no longer see or download it. The file itself stays wherever it's hosted."
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await remove(deleting.id).unwrap();
            toast.success("Guide deleted.");
            setDeleting(null);
          } catch (error) {
            toast.error(errorMessage(error));
          }
        }}
      />
    </div>
  );
}
