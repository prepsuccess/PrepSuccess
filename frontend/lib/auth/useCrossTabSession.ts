"use client";

import { useEffect } from "react";
import { baseApi } from "@/lib/api/baseApi";
import { authApi } from "@/lib/api/endpoints/auth";
import { useAppDispatch } from "@/lib/store/hooks";
import { signedIn, signedOut } from "./authSlice";
import { ACCESS_KEY, getAccessToken, REFRESH_KEY } from "./session";

/** The user id (`sub`) inside an access token, or null if it can't be read. */
function tokenUser(token: string | null): string | null {
  const payload = token?.split(".")[1];
  if (!payload) return null;
  try {
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const sub = (JSON.parse(json) as { sub?: unknown }).sub;
    return typeof sub === "string" ? sub : null;
  } catch {
    return null;
  }
}

/**
 * Keeps this tab in step with the others, since they all share the tokens in
 * localStorage: signing out elsewhere signs out here, and signing in as
 * someone else elsewhere drops this tab's cached data and loads the new user.
 * A token refresh in another tab (same user) needs nothing.
 */
export function useCrossTabSession() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    function onStorage(event: StorageEvent) {
      // key is null when another tab cleared all of storage.
      if (event.key !== null && event.key !== ACCESS_KEY && event.key !== REFRESH_KEY) return;
      const access = getAccessToken();
      if (!access) {
        dispatch(signedOut());
        dispatch(baseApi.util.resetApiState());
        return;
      }
      if (event.key !== ACCESS_KEY) return;
      const before = tokenUser(event.oldValue);
      if (before && before === tokenUser(access)) return;
      dispatch(baseApi.util.resetApiState());
      dispatch(signedIn());
      void dispatch(
        authApi.endpoints.getMe.initiate(undefined, { subscribe: false, forceRefetch: true }),
      );
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [dispatch]);
}
