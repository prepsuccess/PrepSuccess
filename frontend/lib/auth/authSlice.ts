import { createSlice } from "@reduxjs/toolkit";

/**
 * Whether this browser holds a session. The user object itself lives in the
 * RTK Query cache (`getMe`); this slice only answers "should we even ask?".
 *
 * Starts as "unknown" on both the server and the first client render (no
 * localStorage on the server, and the two renders must match), then
 * StoreProvider checks storage after mount.
 */
export type AuthStatus = "unknown" | "signedIn" | "signedOut";

export const authSlice = createSlice({
  name: "auth",
  initialState: { status: "unknown" as AuthStatus },
  reducers: {
    storageChecked(state, action: { payload: { hasToken: boolean } }) {
      state.status = action.payload.hasToken ? "signedIn" : "signedOut";
    },
    signedIn(state) {
      state.status = "signedIn";
    },
    signedOut(state) {
      state.status = "signedOut";
    },
  },
});

export const { storageChecked, signedIn, signedOut } = authSlice.actions;
