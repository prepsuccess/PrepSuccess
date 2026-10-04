"use client";

import { useCallback } from "react";
import { baseApi } from "@/lib/api/baseApi";
import { isApiError } from "@/lib/api/errors";
import { authApi, useGetMeQuery } from "@/lib/api/endpoints/auth";
import type { TokenResponse } from "@/lib/api/types";
import type { AppDispatch } from "@/lib/store/store";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { signedIn, signedOut } from "./authSlice";
import { clearTokens, getRefreshToken, saveTokens, type SessionState } from "./session";

const LOADING: SessionState = { status: "loading", user: null };
const SIGNED_OUT: SessionState = { status: "unauthenticated", user: null };

/**
 * The current session. The user comes from the cached `getMe` query, so it is
 * fetched once per tab and shared by every component that calls this hook.
 */
export function useSession(): SessionState {
  const status = useAppSelector((state) => state.auth.status);
  const me = useGetMeQuery(undefined, { skip: status !== "signedIn" });

  if (status === "unknown") return LOADING;
  if (status === "signedOut") return SIGNED_OUT;
  if (me.data) return { status: "authenticated", user: me.data };
  if (me.isError) {
    // Only the API saying no ends the session (a dead one is also signed out by
    // the base query). Offline, a timeout or a 5xx while the host wakes up says
    // nothing about it, so keep the tokens and offer a retry.
    const status = isApiError(me.error) ? me.error.status : 0;
    if (status === 401 || status === 403) return SIGNED_OUT;
    return { status: "unreachable", user: null, retry: me.refetch };
  }
  return LOADING;
}

/**
 * Stores the tokens and seeds the user cache, so no extra /me request is needed.
 * Clears anything cached for a previous user in this tab first.
 */
export function startSession(dispatch: AppDispatch, session: TokenResponse) {
  dispatch(baseApi.util.resetApiState());
  saveTokens(session.access_token, session.refresh_token);
  // Synchronous, so the user is in the cache before the next render.
  dispatch(
    authApi.util.upsertQueryEntries([
      { endpointName: "getMe", arg: undefined, value: session.user },
    ]),
  );
  dispatch(signedIn());
}

export function useStartSession() {
  const dispatch = useAppDispatch();
  return useCallback((session: TokenResponse) => startSession(dispatch, session), [dispatch]);
}

/** Revokes the refresh token on the server, then forgets everything locally. */
export function useSignOut() {
  const dispatch = useAppDispatch();
  return useCallback(() => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      // Fire and forget: signing out locally must not wait for (or depend on) the network.
      void dispatch(authApi.endpoints.logout.initiate({ refresh_token: refreshToken }));
    }
    clearTokens();
    dispatch(signedOut());
    dispatch(baseApi.util.resetApiState());
  }, [dispatch]);
}
