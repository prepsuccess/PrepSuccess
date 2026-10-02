import { CircleAlert, RotateCw } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/shadcn/empty";
import { errorMessage, isApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils/cn";

/** Something failed to load: say so plainly, offer a retry, show the code for support. */
export function ErrorState({
  error,
  onRetry,
  title = "Couldn't load this",
  className,
}: {
  error: unknown;
  onRetry?: () => void;
  title?: string;
  className?: string;
}) {
  return (
    <Empty role="alert" className={cn("border", className)}>
      <EmptyHeader>
        <EmptyMedia variant="icon" className="text-destructive">
          <CircleAlert />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>
          {errorMessage(error)}
          {isApiError(error) ? (
            <span className="text-muted-foreground mt-1 block font-mono text-xs">{error.code}</span>
          ) : null}
        </EmptyDescription>
      </EmptyHeader>
      {onRetry ? (
        <EmptyContent>
          <Button variant="outline" onClick={onRetry}>
            <RotateCw />
            Try again
          </Button>
        </EmptyContent>
      ) : null}
    </Empty>
  );
}
