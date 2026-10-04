import {
  Bug,
  CircleCheck,
  CircleDot,
  FileWarning,
  Lightbulb,
  LoaderCircle,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/shadcn/badge";
import type { FeedbackCategory, FeedbackStatus } from "@/lib/api/endpoints/feedback";
import { cn } from "@/lib/utils/cn";

/** Labels shared by the student and admin views. */
export const CATEGORIES: { value: FeedbackCategory; label: string; icon: LucideIcon }[] = [
  { value: "bug", label: "Bug", icon: Bug },
  { value: "idea", label: "Idea", icon: Lightbulb },
  { value: "content", label: "Content issue", icon: FileWarning },
  { value: "other", label: "Other", icon: MessageSquare },
];

export const STATUSES: { value: FeedbackStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "solved", label: "Solved" },
];

export const categoryLabel = (category: FeedbackCategory) =>
  CATEGORIES.find((c) => c.value === category)?.label ?? "Other";

export const statusLabel = (status: FeedbackStatus) =>
  STATUSES.find((s) => s.value === status)?.label ?? "Open";

const STATUS_STYLE: Record<FeedbackStatus, { icon: LucideIcon; className: string }> = {
  open: { icon: CircleDot, className: "border-border bg-transparent text-foreground" },
  in_progress: { icon: LoaderCircle, className: "bg-brand/10 text-brand-ink" },
  solved: { icon: CircleCheck, className: "bg-success/10 text-success" },
};

/** Status as a word plus an icon, never colour alone. */
export function StatusBadge({ status, className }: { status: FeedbackStatus; className?: string }) {
  const { icon: Icon, className: style } = STATUS_STYLE[status] ?? STATUS_STYLE.open;
  return (
    <Badge variant="outline" className={cn(style, className)}>
      <Icon aria-hidden />
      {statusLabel(status)}
    </Badge>
  );
}

export function CategoryLabel({
  category,
  className,
}: {
  category: FeedbackCategory;
  className?: string;
}) {
  const Icon = CATEGORIES.find((c) => c.value === category)?.icon ?? MessageSquare;
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <Icon className="text-muted-foreground size-3.5 shrink-0" aria-hidden />
      {categoryLabel(category)}
    </span>
  );
}

/** "4 Oct 2026". */
export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { dateStyle: "medium" });
