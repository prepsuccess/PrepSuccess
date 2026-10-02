import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils/cn";

// Shaped placeholders that mirror the real components' boxes, so content
// drops into place without the layout jumping.

/** Mirrors <StatCard>. */
export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("card flex flex-col gap-5 p-5", className)}>
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-4 w-4 rounded" />
      </div>
      <Skeleton className="h-10 w-20" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

/** Mirrors the body rows of <DataTable>. */
export function TableRowsSkeleton({ columns, rows = 5 }: { columns: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, row) => (
        <tr key={row} aria-hidden className="border-border border-b last:border-b-0">
          {Array.from({ length: columns }, (_, col) => (
            <td key={col} className="px-5 py-3.5">
              <Skeleton className={cn("h-4", col === 0 ? "w-32" : col % 2 ? "w-40" : "w-20")} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/** Mirrors the label/value rows of the profile details card. */
export function DetailListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div aria-hidden className="card divide-border divide-y">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="grid gap-2 px-5 py-4 sm:grid-cols-[200px_1fr]">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className={cn("h-4", i % 3 === 0 ? "w-56" : i % 3 === 1 ? "w-40" : "w-32")} />
        </div>
      ))}
    </div>
  );
}

/** A generic card with a heading and a few lines. */
export function CardSkeleton({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div aria-hidden className={cn("card flex flex-col gap-4 p-5", className)}>
      <Skeleton className="h-4 w-40" />
      <SkeletonText lines={lines} />
    </div>
  );
}
