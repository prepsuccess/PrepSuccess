"use client";

import { useState } from "react";
import { BookOpen, ChevronDown, ExternalLink, FileText, Lightbulb, PenLine } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/shadcn/badge";
import { Card } from "@/components/shadcn/card";
import { Skeleton } from "@/components/shadcn/skeleton";
import { QueryState } from "@/components/ui/QueryState";
import { useGetResourcesQuery } from "@/lib/api/endpoints/learning";
import type { LearningResource } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";
import { Prose } from "./Prose";

const TYPE: Record<LearningResource["type"], { label: string; icon: LucideIcon }> = {
  reference: { label: "Reference", icon: FileText },
  example: { label: "Examples", icon: Lightbulb },
  lecture: { label: "Course", icon: BookOpen },
  practice: { label: "Practice", icon: PenLine },
};

function ResourceRow({ resource }: { resource: LearningResource }) {
  const [open, setOpen] = useState(false);
  const { label, icon: Icon } = TYPE[resource.type];
  const meta = (
    <span className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
      <Badge variant="outline">{label}</Badge>
      {resource.source}
    </span>
  );

  if (resource.url) {
    return (
      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:bg-muted/50 focus-visible:ring-ring/50 flex items-start gap-3 px-4 py-3 transition-colors outline-none focus-visible:ring-3"
      >
        <Icon className="text-muted-foreground mt-0.5 size-4 shrink-0" aria-hidden />
        <span className="min-w-0 flex-1 space-y-1">
          <span className="text-foreground block text-sm font-medium">{resource.title}</span>
          {meta}
        </span>
        <ExternalLink className="text-muted-foreground mt-0.5 size-4 shrink-0" aria-hidden />
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    );
  }

  // Hosted notes open in place.
  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="hover:bg-muted/50 focus-visible:ring-ring/50 flex w-full items-start gap-3 px-4 py-3 text-left transition-colors outline-none focus-visible:ring-3"
      >
        <Icon className="text-muted-foreground mt-0.5 size-4 shrink-0" aria-hidden />
        <span className="min-w-0 flex-1 space-y-1">
          <span className="text-foreground block text-sm font-medium">{resource.title}</span>
          {meta}
        </span>
        <ChevronDown
          aria-hidden
          className={cn(
            "text-muted-foreground mt-0.5 size-4 shrink-0 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && resource.content ? (
        <div className="text-foreground border-t px-4 py-4 sm:pl-11">
          <Prose text={resource.content} />
        </div>
      ) : null}
    </div>
  );
}

function ListSkeleton({ rows }: { rows: number }) {
  return (
    <Card className="gap-0 py-0" aria-hidden>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="space-y-2 border-b px-4 py-3 last:border-0">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </Card>
  );
}

/** A skill's learning resources: outside links open in a new tab, our notes open in place. */
export function ResourceList({ slug, limit }: { slug: string; limit?: number }) {
  const query = useGetResourcesQuery(slug);
  return (
    <QueryState
      query={query}
      skeleton={<ListSkeleton rows={limit ?? 3} />}
      errorTitle="Couldn't load the study material"
      isEmpty={(data) => data.resources.length === 0}
      empty={
        <p className="text-muted-foreground text-sm">
          No study material for this skill yet — we&apos;re adding more.
        </p>
      }
    >
      {({ resources }) => (
        <Card className="gap-0 py-0">
          <ul className="divide-y">
            {resources.slice(0, limit).map((resource) => (
              <li key={resource.id}>
                <ResourceRow resource={resource} />
              </li>
            ))}
          </ul>
        </Card>
      )}
    </QueryState>
  );
}
