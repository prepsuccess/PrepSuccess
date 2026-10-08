"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/dialog";
import { AuthImage } from "@/components/ui/AuthImage";
import type { FeedbackImage } from "@/lib/api/endpoints/feedback";
import { formatBytes } from "@/lib/utils/images";
import { cn } from "@/lib/utils/cn";

/** Screenshot thumbnails; each opens larger in a dialog. */
export function FeedbackImages({
  images,
  className,
}: {
  images: FeedbackImage[];
  className?: string;
}) {
  const [openAt, setOpenAt] = useState<number | null>(null);
  if (!images.length) return null;
  const current = openAt === null ? undefined : images[openAt];

  return (
    <>
      <ul className={cn("flex flex-wrap gap-2", className)} aria-label="Screenshots">
        {images.map((image, i) => (
          <li key={image.id}>
            <button
              type="button"
              onClick={() => setOpenAt(i)}
              aria-label={`Open screenshot ${i + 1} of ${images.length}`}
              className="focus-visible:ring-ring/50 hover:border-foreground/30 block overflow-hidden rounded-lg border transition-colors outline-none focus-visible:ring-3"
            >
              <AuthImage
                src={image.url}
                alt={`Screenshot ${i + 1}`}
                className="h-16 w-24 rounded-none sm:h-20 sm:w-28"
              />
            </button>
          </li>
        ))}
      </ul>
      <Dialog open={current !== undefined} onOpenChange={(open) => !open && setOpenAt(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Screenshot {(openAt ?? 0) + 1} of {images.length}
            </DialogTitle>
            <DialogDescription>{current ? formatBytes(current.size) : null}</DialogDescription>
          </DialogHeader>
          {current ? (
            <AuthImage
              src={current.url}
              alt={`Screenshot ${(openAt ?? 0) + 1}, full size`}
              className="max-h-[75dvh] min-h-40 w-full"
              imgClassName="bg-muted h-auto object-contain"
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
