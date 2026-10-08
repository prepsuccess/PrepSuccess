"use client";

import { useState, type ChangeEvent } from "react";
import { CircleAlert, Download, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { TextareaField, TextField } from "@/components/app/form-fields";
import { Alert, AlertDescription, AlertTitle } from "@/components/shadcn/alert";
import { Button } from "@/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/dialog";
import {
  useImportAdminQuestionsMutation,
  type AdminQuestionImportResult,
} from "@/lib/api/endpoints/admin";
import { errorMessage } from "@/lib/api/errors";
import { csvToObjects, toCsv } from "@/lib/utils/csv";

const IMPORT_COLUMNS = [
  "skill",
  "title",
  "body",
  "answer",
  "topic",
  "difficulty",
  "company",
  "role",
] as const;
const MAX_ROWS = 500;

const TEMPLATE = toCsv([
  [...IMPORT_COLUMNS],
  [
    "sql",
    "What is the difference between WHERE and HAVING?",
    "When does each one filter rows?\n\nGive a short example.",
    "WHERE filters rows before grouping; HAVING filters groups after.",
    "Aggregation",
    "easy",
    "TCS",
    "Data Analyst",
  ],
]);
const TEMPLATE_HREF = `data:text/csv;charset=utf-8,${encodeURIComponent(TEMPLATE)}`;

type Row = Record<string, unknown>;

/** The question rows in a .csv or .json file (or pasted JSON). Throws with a short message. */
function readQuestionRows(text: string, kind: "csv" | "json"): Row[] {
  if (kind === "csv") return csvToObjects(text, [...IMPORT_COLUMNS, "skill_id"]);
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("That isn't valid JSON.");
  }
  const rows = Array.isArray(data) ? data : (data as { questions?: unknown } | null)?.questions;
  if (!Array.isArray(rows)) throw new Error('Use a list of questions, or { "questions": [...] }.');
  return rows as Row[];
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

function Summary({ result }: { result: AdminQuestionImportResult }) {
  return (
    <div className="space-y-2 text-sm">
      <p className="font-medium">
        {result.created} will be created, {result.restored} restored, {result.skipped} skipped,{" "}
        {plural(result.errors.length, "error")}.
      </p>
      {result.skipped ? (
        <p className="text-muted-foreground">
          Skipped questions already exist in that skill and are left as they are.
        </p>
      ) : null}
      {result.errors.length ? (
        <ul
          aria-label="Rows with errors"
          className="text-destructive max-h-48 space-y-1 overflow-y-auto rounded-md border p-3"
        >
          {result.errors.map((error) => (
            <li key={error.row}>
              Row {error.row}
              {error.title ? ` (“${error.title}”)` : ""}: {error.message}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function ImportForm({ onDone }: { onDone: () => void }) {
  const [file, setFile] = useState<{ name: string; text: string } | null>(null);
  const [pasted, setPasted] = useState("");
  // The rows that passed "Check file", and what the check said.
  const [checked, setChecked] = useState<{ rows: Row[]; result: AdminQuestionImportResult }>();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"check" | "import" | null>(null);
  const [run] = useImportAdminQuestionsMutation();

  const reset = () => {
    setChecked(undefined);
    setError(null);
  };

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    reset();
    const chosen = e.target.files?.[0];
    setFile(chosen ? { name: chosen.name, text: await chosen.text() } : null);
  }

  async function check() {
    reset();
    setBusy("check");
    try {
      const rows = file
        ? readQuestionRows(file.text, file.name.toLowerCase().endsWith(".csv") ? "csv" : "json")
        : readQuestionRows(pasted, "json");
      if (!rows.length) throw new Error("No questions found.");
      if (rows.length > MAX_ROWS) {
        throw new Error(`Up to ${MAX_ROWS} questions per file. This one has ${rows.length}.`);
      }
      const result = await run({ questions: rows, dry_run: true }).unwrap();
      setChecked({ rows, result });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : errorMessage(caught));
    } finally {
      setBusy(null);
    }
  }

  async function save() {
    if (!checked) return;
    setError(null);
    setBusy("import");
    try {
      const result = await run({ questions: checked.rows }).unwrap();
      const failed = result.errors.length
        ? ` ${plural(result.errors.length, "row")} had errors.`
        : "";
      toast.success(
        `Imported: ${result.created} created, ${result.restored} restored, ${result.skipped} skipped.${failed}`,
      );
      onDone();
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(null);
    }
  }

  const canImport = Boolean(checked && checked.result.created + checked.result.restored > 0);

  return (
    <div className="space-y-5">
      <div className="text-muted-foreground space-y-2 text-sm">
        <p>
          CSV columns: {IMPORT_COLUMNS.join(", ")}. Use the skill&apos;s slug (e.g. sql). Answer,
          company and role can be blank. JSON: a list of objects with the same keys.
        </p>
        <p>
          Up to {MAX_ROWS} questions per file. Row 1 is the first question. Titles already in that
          skill are skipped.
        </p>
        <a
          href={TEMPLATE_HREF}
          download="questions-template.csv"
          className="text-primary inline-flex items-center gap-1 font-medium underline-offset-4 hover:underline"
        >
          <Download className="size-4" aria-hidden />
          Download template
        </a>
      </div>

      <TextField
        label="Question file"
        type="file"
        accept=".csv,.json,text/csv,application/json"
        description=".csv or .json"
        onChange={onFile}
      />
      <TextareaField
        label="Or paste JSON"
        rows={5}
        value={pasted}
        disabled={Boolean(file)}
        description={file ? "Using the chosen file." : undefined}
        placeholder='[{ "skill": "sql", "title": "…", "body": "…", "topic": "…", "difficulty": "easy" }]'
        onChange={(e) => {
          reset();
          setPasted(e.target.value);
        }}
      />

      {error ? (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertTitle>Couldn&apos;t import</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <div aria-live="polite">{checked ? <Summary result={checked.result} /> : null}</div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone} disabled={busy !== null}>
          Cancel
        </Button>
        <Button
          type="button"
          variant={checked ? "outline" : "default"}
          onClick={check}
          disabled={busy !== null || (!file && !pasted.trim())}
          aria-busy={busy === "check" || undefined}
        >
          {busy === "check" ? <Loader2 className="animate-spin" aria-hidden /> : null}
          Check file
        </Button>
        <Button
          type="button"
          onClick={save}
          disabled={busy !== null || !canImport}
          aria-busy={busy === "import" || undefined}
        >
          {busy === "import" ? <Loader2 className="animate-spin" aria-hidden /> : null}
          Import
        </Button>
      </DialogFooter>
    </div>
  );
}

/** Bulk add from a .csv or .json file: check first (dry run), then import. */
export function QuestionImportDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import questions</DialogTitle>
          <DialogDescription>
            Add many questions at once. Check the file first to see what will happen.
          </DialogDescription>
        </DialogHeader>
        {/* Mounted only while open, so each import starts empty. */}
        {open ? <ImportForm onDone={() => onOpenChange(false)} /> : null}
      </DialogContent>
    </Dialog>
  );
}
