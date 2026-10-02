"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { authApi } from "@/lib/api/endpoints/auth";
import { signedIn } from "@/lib/auth/authSlice";
import { clearTokens, homeFor, safeNext, saveTokens } from "@/lib/auth/session";
import { useAppDispatch } from "@/lib/store/hooks";

/**
 * Landing page after Google sign-in. The backend puts the tokens in the URL
 * fragment; read them, wipe them from the address bar and history straight
 * away, load the user, then continue to where they were headed.
 */
export function GoogleCallback() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const started = useRef(false);

  useEffect(() => {
    // Strict mode runs effects twice in development; the hash is gone after the first run.
    if (started.current) return;
    started.current = true;

    const params = new URLSearchParams(window.location.hash.slice(1));
    window.history.replaceState(null, "", window.location.pathname);

    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    if (!access_token || !refresh_token) {
      router.replace("/login?error=google_failed");
      return;
    }

    saveTokens(access_token, refresh_token);
    dispatch(authApi.endpoints.getMe.initiate())
      .unwrap()
      .then((user) => {
        dispatch(signedIn());
        router.replace(safeNext(params.get("next")) ?? homeFor(user));
      })
      .catch(() => {
        clearTokens();
        router.replace("/login?error=google_failed");
      });
  }, [dispatch, router]);

  return (
    <div className="text-text-dim flex flex-col items-center gap-4 py-16 text-[15px]" role="status">
      <Spinner className="h-6 w-6" />
      Signing you in…
    </div>
  );
}
