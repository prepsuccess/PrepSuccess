"use client";

import toast from "react-hot-toast";
import { Download, FileText } from "lucide-react";
import { Badge } from "@/components/shadcn/badge";
import { Button } from "@/components/shadcn/button";
import { Skeleton } from "@/components/shadcn/skeleton";
import { EmptyPanel } from "@/components/app/EmptyPanel";
import { QueryState } from "@/components/ui/QueryState";
import { useDownloadPrepPdfMutation, useGetPrepPdfsQuery } from "@/lib/api/endpoints/questions";
import { errorMessage } from "@/lib/api/errors";
import type { PrepPdf } from "@/lib/api/types";
import { track } from "@/lib/analytics";

function GuideCard({ guide }: { guide: PrepPdf }) {
  const [download, { isLoading }] = useDownloadPrepPdfMutation();

  async function open() {
    // Open the tab now (inside the click), so pop-up blockers allow it; point it at the file once known.
    const tab = window.open("", "_blank");
    try {
      const { url } = await download(guide.id).unwrap();
      track("prep_pdf_downloaded", {});
      if (tab) {
        tab.opener = null;
        tab.location.href = url;
      } else {
        window.location.href = url;
      }
    } catch (error) {
      tab?.close();
      toast.error(errorMessage(error));
    }
  }

  const tags = [guide.skill?.name, guide.role, guide.company].filter(Boolean) as string[];
  return (
    <li className="bg-card flex flex-col gap-3 rounded-2xl border p-5 shadow-xs">
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-xl"
        >
          <FileText className="size-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-foreground font-semibold">{guide.title}</h2>
          {guide.description ? (
            <p className="text-muted-foreground mt-1 text-sm">{guide.description}</p>
          ) : null}
        </div>
      </div>
      {tags.length ? (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      ) : null}
      <div className="mt-auto flex items-center justify-between gap-3 pt-1">
        <span className="text-muted-foreground text-xs">{guide.size_label ?? "PDF"}</span>
        <Button onClick={() => void open()} disabled={isLoading} className="pointer-coarse:h-11">
          <Download />
          Download
        </Button>
      </div>
    </li>
  );
}

/** /prep-guides — curated interview prep PDFs, added by admins. */
export function PrepGuides() {
  const query = useGetPrepPdfsQuery();
  return (
    <QueryState
      query={query}
      skeleton={<Skeleton className="h-48 rounded-2xl" aria-hidden />}
      errorTitle="Couldn't load the guides"
      isEmpty={(guides) => guides.length === 0}
      empty={
        <EmptyPanel
          icon={FileText}
          title="No guides yet"
          description="Prep guides added by the PrepSuccess team will appear here."
        />
      }
    >
      {(guides) => (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {guides.map((guide) => (
            <GuideCard key={guide.id} guide={guide} />
          ))}
        </ul>
      )}
    </QueryState>
  );
}
