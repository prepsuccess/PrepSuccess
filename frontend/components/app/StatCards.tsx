import type { LucideIcon } from "lucide-react";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/card";
import { Skeleton } from "@/components/shadcn/skeleton";
import { cn } from "@/lib/utils/cn";

export type Stat = {
  label: string;
  icon: LucideIcon;
  /** `null` until there's data to show. */
  value: string | number | null;
  note?: string;
};

/** A row of headline numbers (shadcn Cards). `loading` swaps in same-sized skeletons. */
export function StatCards({
  stats,
  loading = false,
  className,
}: {
  stats: Stat[];
  loading?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-4 sm:grid-cols-2",
        stats.length >= 3 && "lg:grid-cols-3",
        stats.length >= 4 && "xl:grid-cols-4",
        className,
      )}
    >
      {stats.map(({ label, icon: Icon, value, note }) => (
        <Card key={label} aria-busy={loading || undefined}>
          <CardHeader>
            <CardDescription>{label}</CardDescription>
            <CardTitle className="text-3xl font-semibold tabular-nums">
              {loading ? (
                <Skeleton className="h-9 w-16" />
              ) : value === null ? (
                <span className="text-muted-foreground" aria-label="No data yet">
                  —
                </span>
              ) : (
                value
              )}
            </CardTitle>
            <CardAction>
              <Icon className="text-muted-foreground size-4" aria-hidden />
            </CardAction>
          </CardHeader>
          {note ? <CardFooter className="text-muted-foreground text-sm">{note}</CardFooter> : null}
        </Card>
      ))}
    </div>
  );
}
