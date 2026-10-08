"use client";

import { useEffect, useState, type FormEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Loader2,
  Mail,
  MessagesSquare,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";
import { EmptyPanel } from "@/components/app/EmptyPanel";
import { SelectField, TextareaField } from "@/components/app/form-fields";
import { FeedbackImages } from "@/components/app/feedback/FeedbackImages";
import {
  CATEGORIES,
  CategoryLabel,
  formatDate,
  STATUSES,
  StatusBadge,
} from "@/components/app/feedback/meta";
import { Button } from "@/components/shadcn/button";
import { Field, FieldLabel } from "@/components/shadcn/field";
import { Input } from "@/components/shadcn/input";
import { Separator } from "@/components/shadcn/separator";
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
import { ErrorState } from "@/components/ui/ErrorState";
import {
  useGetAdminFeedbackItemQuery,
  useGetAdminFeedbackQuery,
  useGetAdminFeedbackSummaryQuery,
  useUpdateAdminFeedbackMutation,
  type AdminFeedbackQuery,
  type AdminFeedbackUpdate,
} from "@/lib/api/endpoints/admin";
import type {
  AdminFeedback as AdminFeedbackItem,
  FeedbackCategory,
  FeedbackStatus,
} from "@/lib/api/endpoints/feedback";
import { errorMessage, fieldErrors } from "@/lib/api/errors";
import { cn } from "@/lib/utils/cn";

const PAGE_SIZE = 20;
const REMARK_MAX = 1000;
const ALL = "all";

const fullName = (user: AdminFeedbackItem["user"]) =>
  [user.first_name, user.last_name].filter(Boolean).join(" ");
const firstLine = (message: string) => message.split("\n").find((line) => line.trim()) ?? "";

/** Status filter chips with the count in each (GET /admin/feedback/summary). */
function StatusChips({
  value,
  onChange,
}: {
  value: FeedbackStatus | "";
  onChange: (status: FeedbackStatus | "") => void;
}) {
  const { data } = useGetAdminFeedbackSummaryQuery();
  const total = data ? data.open + data.in_progress + data.solved : undefined;
  const chips: { value: FeedbackStatus | ""; label: string; count?: number }[] = [
    { value: "", label: "All", count: total },
    ...STATUSES.map((s) => ({ ...s, count: data?.[s.value] })),
  ];
  return (
    <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-2">
      {chips.map((chip) => {
        const active = chip.value === value;
        return (
          <button
            key={chip.label}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(chip.value)}
            className={cn(
              "focus-visible:ring-ring/50 inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-colors outline-none focus-visible:ring-3 pointer-coarse:h-11",
              active
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground hover:bg-muted",
            )}
          >
            {chip.label}{" "}
            {chip.count !== undefined ? (
              <span
                className={cn(
                  "rounded-full px-1.5 text-xs tabular-nums",
                  active ? "bg-primary-foreground/20" : "bg-muted text-muted-foreground",
                )}
              >
                {chip.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/** Status and the remark the student sees; only what changed is sent. */
function ReviewForm({ item }: { item: AdminFeedbackItem }) {
  const [status, setStatus] = useState<FeedbackStatus>(item.status);
  const [remark, setRemark] = useState(item.admin_remark ?? "");
  const [error, setError] = useState<string | undefined>();
  const [update, { isLoading }] = useUpdateAdminFeedbackMutation();

  const trimmed = remark.trim();
  const changes: AdminFeedbackUpdate = { id: item.id };
  if (status !== item.status) changes.status = status;
  if (trimmed !== (item.admin_remark ?? "")) changes.admin_remark = trimmed || null;
  const dirty = Object.keys(changes).length > 1;

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!dirty) return;
    setError(undefined);
    try {
      await update(changes).unwrap();
      toast.success("Saved.");
    } catch (caught) {
      const fields = fieldErrors(caught);
      if (fields.admin_remark) setError(fields.admin_remark);
      else toast.error(errorMessage(caught));
    }
  }

  return (
    <form onSubmit={save} noValidate className="space-y-4">
      <SelectField
        label="Status"
        value={status}
        onChange={(e) => setStatus(e.target.value as FeedbackStatus)}
        options={STATUSES}
      />
      <TextareaField
        label="Remark for the student"
        rows={4}
        maxLength={REMARK_MAX}
        value={remark}
        onChange={(e) => setRemark(e.target.value)}
        placeholder="e.g. Thanks! We fixed this today."
        error={error}
        description={`${trimmed.length} / ${REMARK_MAX}. They see it on their feedback page. Clear it to remove it.`}
        className="max-h-60"
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={!dirty || isLoading} aria-busy={isLoading || undefined}>
          {isLoading ? <Loader2 className="animate-spin" aria-hidden /> : null}
          Save
        </Button>
        {item.remarked_by || item.resolved_at ? (
          <p className="text-muted-foreground text-xs">
            {item.remarked_by ? `Remark by ${item.remarked_by.first_name}` : null}
            {item.remarked_by && item.resolved_at ? " · " : null}
            {item.resolved_at ? (
              <>
                Solved on <time dateTime={item.resolved_at}>{formatDate(item.resolved_at)}</time>
              </>
            ) : null}
          </p>
        ) : null}
      </div>
    </form>
  );
}

function Detail({ id }: { id: string }) {
  const query = useGetAdminFeedbackItemQuery(id);
  const item = query.data;

  if (query.isError) {
    return (
      <div className="p-4">
        <SheetHeader className="p-0 pb-4">
          <SheetTitle>Feedback</SheetTitle>
          <SheetDescription className="sr-only">
            This feedback couldn&apos;t be loaded.
          </SheetDescription>
        </SheetHeader>
        <ErrorState
          error={query.error}
          title="Couldn't load this feedback"
          onRetry={() => void query.refetch()}
        />
      </div>
    );
  }
  if (!item) {
    return (
      <div className="space-y-4 p-4" aria-busy>
        <SheetHeader className="p-0">
          <SheetTitle>Feedback</SheetTitle>
          <SheetDescription>Loading…</SheetDescription>
        </SheetHeader>
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    );
  }

  const name = fullName(item.user);
  return (
    <>
      <SheetHeader className="border-b pr-12">
        <SheetTitle>Feedback from {name}</SheetTitle>
        <SheetDescription className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <CategoryLabel category={item.category} />
          <span aria-hidden>·</span>
          <time dateTime={item.created_at}>{formatDate(item.created_at)}</time>
        </SheetDescription>
      </SheetHeader>
      <div className="space-y-5 px-4 pt-4 pb-6">
        <StatusBadge status={item.status} />
        <section className="space-y-1.5">
          <h3 className="text-muted-foreground text-xs font-medium">Message</h3>
          <p className="text-foreground text-sm whitespace-pre-wrap">{item.message}</p>
        </section>
        <section className="space-y-1.5">
          <h3 className="text-muted-foreground text-xs font-medium">Page they were on</h3>
          {item.page ? (
            <p className="bg-muted text-foreground w-fit max-w-full rounded-md px-2 py-1 font-mono text-xs break-all">
              {item.page}
            </p>
          ) : (
            <p className="text-muted-foreground text-sm">Not recorded</p>
          )}
        </section>
        {item.images.length ? (
          <section className="space-y-1.5">
            <h3 className="text-muted-foreground text-xs font-medium">
              Screenshots ({item.images.length})
            </h3>
            <FeedbackImages images={item.images} />
          </section>
        ) : null}
        <section className="space-y-1.5">
          <h3 className="text-muted-foreground text-xs font-medium">Student</h3>
          <p className="text-foreground text-sm font-medium">{name}</p>
          <a
            href={`mailto:${item.user.email}`}
            className="text-primary focus-visible:ring-ring/50 inline-flex min-h-8 items-center gap-1.5 rounded text-sm underline-offset-4 outline-none hover:underline focus-visible:ring-3 pointer-coarse:min-h-11"
          >
            <Mail className="size-4" aria-hidden />
            {item.user.email}
          </a>
        </section>
        <Separator />
        <ReviewForm key={`${item.id}-${item.updated_at}`} item={item} />
      </div>
    </>
  );
}

/** /admin/feedback — what students sent, newest first; open one to reply (?id=… links here). */
export function AdminFeedback() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname() ?? "/admin/feedback";
  const openId = params.get("id");

  const [status, setStatus] = useState<FeedbackStatus | "">("");
  const [category, setCategory] = useState<FeedbackCategory | typeof ALL>(ALL);
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  // Search a moment after typing stops.
  useEffect(() => {
    if (search.trim() === q) return;
    const timer = setTimeout(() => {
      setQ(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when the typed text changes
  }, [search]);

  const filters: AdminFeedbackQuery = {
    status: status || undefined,
    category: category === ALL ? undefined : category,
    q: q || undefined,
    page,
    limit: PAGE_SIZE,
  };
  const query = useGetAdminFeedbackQuery(filters);
  const total = query.data?.meta.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rows = query.data?.feedback ?? [];

  const open = (id: string | null) =>
    router.replace(id ? `${pathname}?id=${encodeURIComponent(id)}` : pathname, { scroll: false });

  return (
    <div className="space-y-4">
      <StatusChips
        value={status}
        onChange={(next) => {
          setStatus(next);
          setPage(1);
        }}
      />
      <div className="grid gap-3 sm:grid-cols-[1fr_14rem] sm:items-end">
        <Field>
          <FieldLabel htmlFor="feedback-search">Search</FieldLabel>
          <div className="relative">
            <Search
              aria-hidden
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            />
            <Input
              id="feedback-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Message, name or email"
              autoComplete="off"
              className="pl-9"
            />
          </div>
        </Field>
        <SelectField
          label="Category"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value as FeedbackCategory | typeof ALL);
            setPage(1);
          }}
          options={[
            { value: ALL, label: "All categories" },
            ...CATEGORIES.map(({ value, label }) => ({ value, label })),
          ]}
        />
      </div>

      {query.isError ? (
        <ErrorState
          error={query.error}
          title="Couldn't load feedback"
          onRetry={() => void query.refetch()}
        />
      ) : query.isLoading ? (
        <Skeleton className="h-64 rounded-2xl" aria-hidden />
      ) : rows.length === 0 ? (
        <EmptyPanel
          icon={MessagesSquare}
          title={status || category !== ALL || q ? "Nothing matches" : "No feedback yet"}
          description={
            status || category !== ALL || q
              ? "Try another status, category or search."
              : "When students send feedback, it shows up here."
          }
        />
      ) : (
        <div className="md:bg-card md:rounded-2xl md:border md:shadow-xs">
          <Table aria-label="Student feedback, newest first" className="max-md:block">
            <TableHeader className="max-md:sr-only">
              <TableRow>
                <TableHead className="pl-4">Student</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead className="pr-4 text-right">Images</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="max-md:flex max-md:flex-col max-md:gap-2 max-md:[&_tr:last-child]:border">
              {rows.map((item) => {
                const selected = item.id === openId;
                return (
                  <TableRow
                    key={item.id}
                    data-state={selected ? "selected" : undefined}
                    onClick={() => open(item.id)}
                    className="hover:bg-muted/50 data-[state=selected]:bg-muted max-md:bg-card cursor-pointer max-md:grid max-md:grid-cols-[auto_1fr_auto] max-md:gap-x-3 max-md:gap-y-1 max-md:rounded-xl max-md:border max-md:p-3"
                  >
                    <TableCell className="max-w-48 pl-4 max-md:col-span-2 max-md:row-start-1 max-md:max-w-none max-md:p-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          open(item.id);
                        }}
                        className="focus-visible:ring-ring/50 block max-w-full rounded text-left outline-none focus-visible:ring-3"
                      >
                        <span className="text-foreground block truncate font-medium">
                          {fullName(item.user)}
                        </span>
                        <span className="text-muted-foreground block truncate text-xs">
                          {item.user.email}
                        </span>
                      </button>
                    </TableCell>
                    <TableCell className="max-md:col-start-1 max-md:row-start-3 max-md:p-0 max-md:text-xs">
                      <CategoryLabel category={item.category} />
                    </TableCell>
                    <TableCell className="max-w-72 max-md:col-span-3 max-md:row-start-2 max-md:max-w-none max-md:p-0 max-md:whitespace-normal">
                      <span className="text-foreground block truncate">
                        {firstLine(item.message)}
                      </span>
                    </TableCell>
                    <TableCell className="max-md:col-start-3 max-md:row-start-1 max-md:p-0 max-md:text-right">
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground max-md:col-start-2 max-md:row-start-3 max-md:p-0 max-md:text-xs">
                      <time dateTime={item.created_at}>{formatDate(item.created_at)}</time>
                    </TableCell>
                    <TableCell className="text-muted-foreground pr-4 text-right max-md:col-start-3 max-md:row-start-3 max-md:p-0 max-md:text-xs">
                      {item.images.length ? (
                        <span className="inline-flex items-center gap-1">
                          <ImageIcon className="size-3.5" aria-hidden />
                          {item.images.length}
                          <span className="sr-only">
                            {item.images.length === 1 ? " image" : " images"}
                          </span>
                        </span>
                      ) : (
                        <span>
                          <span aria-hidden>—</span>
                          <span className="sr-only">No images</span>
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {pages > 1 ? (
        <div className="flex items-center justify-end gap-2 text-sm">
          <span className="text-muted-foreground tabular-nums">
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
          </span>
          <Button
            variant="outline"
            size="icon"
            aria-label="Previous page"
            disabled={page <= 1 || query.isFetching}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Next page"
            disabled={page >= pages || query.isFetching}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight />
          </Button>
        </div>
      ) : null}

      <Sheet open={Boolean(openId)} onOpenChange={(next) => !next && open(null)}>
        <SheetContent className="gap-0 overflow-y-auto data-[side=right]:w-full data-[side=right]:sm:max-w-lg">
          {openId ? <Detail id={openId} /> : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
