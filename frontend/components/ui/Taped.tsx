import type { ReactNode } from "react";
import { DrawScope } from "@/components/ui/Annotation";

/** A screen pinned to the page with a strip of tape; it straightens when hovered. */
export function Taped({
  children,
  tilt = "rotate-[1deg]",
  note,
}: {
  children: ReactNode;
  tilt?: string;
  note?: ReactNode;
}) {
  return (
    <DrawScope className="group relative">
      <span
        aria-hidden
        className="bg-brand/20 absolute -top-3 left-1/2 z-20 h-7 w-28 -translate-x-1/2 -rotate-2"
      />
      <div
        className={`transition-transform duration-700 ease-[var(--ease-out-cubic)] group-hover:rotate-0 ${tilt} max-lg:rotate-0`}
      >
        {children}
      </div>
      {note}
    </DrawScope>
  );
}
