import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement } from "react";
import { authApi } from "@/lib/api/endpoints/auth";
import type { AuthUser } from "@/lib/api/types";
import { signedIn, storageChecked } from "@/lib/auth/authSlice";
import { saveTokens } from "@/lib/auth/session";
import { StoreProvider } from "@/lib/store/StoreProvider";
import { makeStore } from "@/lib/store/store";

export const testUser: AuthUser = {
  id: "4b7a3c1e-2f0d-4a6b-9c8e-1d2f3a4b5c6d",
  first_name: "Asha",
  last_name: "Verma",
  email: "asha@college.edu",
  profile_image_url: null,
  role: "student",
  auth_provider: "local",
  is_verified: true,
  onboarding_completed: false,
  profile: { student_year: 3, mobile_no: "9876543210", skills: ["HTML"] },
  created_at: "2026-10-01T00:00:00.000Z",
};

/**
 * Renders with a fresh store. `signedInAs` stores tokens and seeds the user,
 * like a returning visitor whose session was already loaded.
 */
export function renderWithStore(
  ui: ReactElement,
  { signedInAs, ...options }: { signedInAs?: AuthUser } & RenderOptions = {},
) {
  const store = makeStore();
  if (signedInAs) {
    saveTokens("test-access", "test-refresh");
    store.dispatch(
      authApi.util.upsertQueryEntries([
        { endpointName: "getMe", arg: undefined, value: signedInAs },
      ]),
    );
    store.dispatch(signedIn());
  } else {
    store.dispatch(storageChecked({ hasToken: false }));
  }
  return { store, ...render(<StoreProvider store={store}>{ui}</StoreProvider>, options) };
}
