import { Button } from "@/components/ui/Button";
import { LineIcon } from "@/components/ui/LineIcon";
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
    <div
      role="alert"
      className={cn("card flex flex-col items-center px-6 py-12 text-center", className)}
    >
      <LineIcon name="alert" className="text-danger h-6 w-6" />
      <h2 className="text-h6 mt-4">{title}</h2>
      <p className="mt-2 max-w-[46ch] text-[15px]">{errorMessage(error)}</p>
      {isApiError(error) ? (
        <p className="text-text-dim mt-2 font-mono text-[12px]">{error.code}</p>
      ) : null}
      {onRetry ? (
        <div className="mt-6">
          <Button label="Try again" variant="secondary" onClick={onRetry} />
        </div>
      ) : null}
    </div>
  );
}
