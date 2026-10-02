"use client";

import { useEffect, useSyncExternalStore } from "react";
import { getCurrentUser, type AuthUser, type TokenResponse } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { clearTokens, getAccessToken, saveTokens, type SessionState } from "./session";

const LOADING: SessionState = { status: "loading", user: null };
const SIGNED_OUT: SessionState = { status: "unauthenticated", user: null };

let state: SessionState = LOADING;
let pending: Promise<void> | null = null;
const listeners = new Set<() => void>();

function set(next: SessionState) {
  state = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Resolves the current user from the stored token, once per page load. */
function load() {
  if (state.status !== "loading" || pending) return;
  if (!getAccessToken()) {
    set(SIGNED_OUT);
    return;
  }
  pending = getCurrentUser()
    .then((user) => set({ status: "authenticated", user }))
    .catch((error: unknown) => {
      // A rejected token is dead; a network blip shouldn't wipe a good one.
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        clearTokens();
      }
      set(SIGNED_OUT);
    })
    .finally(() => {
      pending = null;
    });
}

export function signIn({ access_token, refresh_token, user }: TokenResponse) {
  saveTokens(access_token, refresh_token);
  set({ status: "authenticated", user });
}

/** Replaces the signed-in user after a profile edit, without touching the tokens. */
export function updateSessionUser(user: AuthUser) {
  if (state.status === "authenticated") set({ status: "authenticated", user });
}

export function signOut() {
  clearTokens();
  set(SIGNED_OUT);
}

export function useSession(): SessionState {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => state,
    () => LOADING,
  );
  useEffect(load, []);
  return snapshot;
}
