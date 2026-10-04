"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import type { UserRole } from "@/lib/api/types";
import { homeFor } from "@/lib/auth/session";
import { useCrossTabSession } from "@/lib/auth/useCrossTabSession";
import { useSession } from "@/lib/auth/useSession";
import { Button } from "@/components/shadcn/button";
import { Spinner } from "@/components/ui/Spinner";

/**
 * Keeps signed-out users and the wrong roles off a section of the app.
 * This is a UX guard only — the API enforces roles on every request.
 */
export function RequireAuth({ roles, children }: { roles: UserRole[]; children: ReactNode }) {
  const session = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const allowed = session.status === "authenticated" && roles.includes(session.user.role);
  useCrossTabSession();

  useEffect(() => {
    if (session.status === "unauthenticated") {
      // Read here rather than with useSearchParams, which would opt every page out of prerendering.
      const next = `${pathname}${window.location.search}`;
      router.replace(`/login?next=${encodeURIComponent(next)}`);
    } else if (session.status === "authenticated" && !roles.includes(session.user.role)) {
      router.replace(homeFor(session.user));
    }
  }, [session, roles, router, pathname]);

  if (session.status === "unreachable") {
    // Still signed in (the tokens are kept); the API is offline or waking up.
    return (
      <div className="grid min-h-screen place-items-center px-4" role="alert">
        <div className="flex max-w-sm flex-col items-center gap-4 text-center">
          <p className="text-heading text-lg font-semibold">
            Can&apos;t reach PrepSuccess right now
          </p>
          <p className="text-text-dim text-[15px]">
            Check your connection, or give it a moment if it&apos;s just waking up.
          </p>
          <Button onClick={() => session.retry()}>Retry</Button>
        </div>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="text-text-dim grid min-h-screen place-items-center" aria-busy>
        <Spinner className="h-6 w-6" />
        <span className="sr-only">Loading…</span>
      </div>
    );
  }

  return children;
}
