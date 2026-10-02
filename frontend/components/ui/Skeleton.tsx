import { cn } from "@/lib/utils/cn";

/**
 * A placeholder block with a soft highlight sweeping across it. Size it like
 * the content it stands in for, so nothing shifts when the data arrives.
 * Decorative only: wrap a group of skeletons in <Loading> for screen readers.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "bg-skeleton relative overflow-hidden rounded-md",
        "after:animate-shimmer after:via-shimmer after:absolute after:inset-0 after:bg-linear-to-r after:from-transparent after:to-transparent",
        "motion-reduce:after:hidden",
        className,
      )}
    />
  );
}

/** Lines of text; the last one is shorter, like a real paragraph. */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div aria-hidden className={cn("flex flex-col gap-2", className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          className={cn("h-3.5", i === lines - 1 && lines > 1 ? "w-3/5" : "w-full")}
        />
      ))}
    </div>
  );
}

export function SkeletonCircle({ className }: { className?: string }) {
  return <Skeleton className={cn("h-10 w-10 rounded-full", className)} />;
}

/**
 * Announces loading once for a whole region (role="status" + aria-busy),
 * while the skeletons inside stay hidden from assistive tech.
 */
export function Loading({
  label = "Loading…",
  className,
  children,
}: {
  label?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div role="status" aria-busy="true" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}
