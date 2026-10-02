"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import type { UserRole } from "@/lib/api/types";
import { homeFor } from "@/lib/auth/session";
import { useSession } from "@/lib/auth/useSession";
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

  useEffect(() => {
    if (session.status === "unauthenticated") {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    } else if (session.status === "authenticated" && !roles.includes(session.user.role)) {
      router.replace(homeFor(session.user.role));
    }
  }, [session, roles, router, pathname]);

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
