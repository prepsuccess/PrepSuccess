"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { baseApi } from "@/lib/api/baseApi";
import { authApi } from "@/lib/api/endpoints/auth";
import { signedIn } from "@/lib/auth/authSlice";
import { takeGoogleNonce } from "@/lib/auth/google";
import { clearTokens, homeFor, safeNext, saveTokens } from "@/lib/auth/session";
import { useAppDispatch } from "@/lib/store/hooks";

/**
 * Landing page after Google sign-in. The backend puts the tokens in the URL
 * fragment; read them, wipe them from the address bar and history straight
 * away, check the nonce matches the one this tab sent, load the user, then
 * continue to where they were headed.
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
    // Only finish a sign-in this tab started: anything else could be a link
    // signing the visitor into someone else's account. The tokens are dropped.
    const expectedNonce = takeGoogleNonce();
    const nonceMatches = Boolean(expectedNonce) && params.get("nonce") === expectedNonce;
    if (!access_token || !refresh_token || !nonceMatches) {
      router.replace("/login?error=google_failed");
      return;
    }

    // Like startSession: nothing cached for a previous user in this tab survives.
    dispatch(baseApi.util.resetApiState());
    saveTokens(access_token, refresh_token);
    const me = dispatch(authApi.endpoints.getMe.initiate());
    me.unwrap()
      .then((user) => {
        dispatch(signedIn());
        router.replace(safeNext(params.get("next")) ?? homeFor(user));
      })
      .catch(() => {
        clearTokens();
        router.replace("/login?error=google_failed");
      })
      // Only this page asked for the user; the app's own useSession subscribes
      // once it's signed in, so let go of this one rather than hold it forever.
      .finally(() => me.unsubscribe());
  }, [dispatch, router]);

  return (
    <div className="text-text-dim flex flex-col items-center gap-4 py-16 text-[15px]" role="status">
      <Spinner className="h-6 w-6" />
      Signing you in…
    </div>
  );
}
