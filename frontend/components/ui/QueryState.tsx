"use client";

import type { ReactNode } from "react";
import { ErrorState } from "@/components/ui/ErrorState";
import { Loading } from "@/components/ui/Skeleton";
import { useDelayedFlag } from "@/lib/hooks/useDelayedFlag";

/** The subset of an RTK Query hook result this component needs. */
export interface QueryLike<T> {
  data?: T;
  error?: unknown;
  isLoading: boolean;
  isError: boolean;
  refetch?: () => unknown;
}

/**
 * One way to render every data-loading region:
 *   loading → `skeleton` (after a short delay, so fast responses don't flash)
 *   error   → <ErrorState> with a retry
 *   empty   → `empty`, when `isEmpty(data)` says so
 *   data    → `children(data)`
 * Background refetches keep showing the current data.
 */
export function QueryState<T>({
  query,
  skeleton,
  empty,
  isEmpty,
  errorTitle,
  children,
}: {
  query: QueryLike<T>;
  skeleton: ReactNode;
  empty?: ReactNode;
  isEmpty?: (data: T) => boolean;
  errorTitle?: string;
  children: (data: T) => ReactNode;
}) {
  const showSkeleton = useDelayedFlag(query.isLoading);

  if (query.isLoading) {
    return showSkeleton ? <Loading>{skeleton}</Loading> : <Loading>{null}</Loading>;
  }
  if (query.isError || query.data === undefined) {
    return (
      <ErrorState
        error={query.error}
        title={errorTitle}
        onRetry={query.refetch ? () => void query.refetch?.() : undefined}
      />
    );
  }
  if (empty && isEmpty?.(query.data)) return <>{empty}</>;
  return <>{children(query.data)}</>;
}
