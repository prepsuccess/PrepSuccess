import { cn } from "@/lib/utils/cn";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "bg-skeleton relative overflow-hidden rounded-md",
        "after:animate-shimmer after:via-shimmer after:absolute after:inset-0 after:bg-linear-to-r after:from-transparent after:to-transparent motion-reduce:after:hidden",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
