import { render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { authApi } from "@/lib/api/endpoints/auth";
import { dashboardApi } from "@/lib/api/endpoints/dashboard";
import type { AiInsight } from "@/lib/api/types";
import {
  authErrorMessage,
  createGoogleNonce,
  googleSignInUrl,
  takeGoogleNonce,
} from "@/lib/auth/google";
import { StoreProvider } from "@/lib/store/StoreProvider";
import { makeStore } from "@/lib/store/store";
import { API, fail, http, ok, server } from "@/test/server";
import { testUser } from "@/test/render";
import { GoogleCallback } from "./GoogleCallback";

const previousInsight: AiInsight = {
  status: "ready",
  summary: "Asha's results.",
  gaps: [],
  plan: [],
  generated_at: "2026-10-02T10:00:00.000Z",
};

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

const NONCE = "n0nce-n0nce-n0nce-n0nce-n0nce-12";

/** Renders the callback as if this tab had started a Google sign-in with NONCE. */
function renderCallback(url: string, store = makeStore(), nonce: string | null = NONCE) {
  sessionStorage.setItem("ps-google-nonce", NONCE);
  window.history.replaceState(null, "", nonce ? `${url}&nonce=${nonce}` : url);
  render(
    <StoreProvider store={store}>
      <GoogleCallback />
    </StoreProvider>,
  );
  return store;
}

describe("GoogleCallback", () => {
  afterEach(() => {
    replace.mockReset();
    sessionStorage.clear();
    window.history.replaceState(null, "", "/");
  });

  it("stores the tokens, wipes them from the URL, loads the user and continues to next", async () => {
    let auth: string | null = null;
    server.use(
      http.get(`${API}/api/v1/auth/me`, ({ request }) => {
        auth = request.headers.get("Authorization");
        return ok(testUser);
      }),
    );
    const store = renderCallback(
      "/auth/callback#access_token=acc&refresh_token=ref&next=%2Fprofile",
    );

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/profile"));
    expect(localStorage.getItem("ps-access-token")).toBe("acc");
    expect(localStorage.getItem("ps-refresh-token")).toBe("ref");
    expect(window.location.hash).toBe("");
    expect(auth).toBe("Bearer acc");
    expect(store.getState().auth.status).toBe("signedIn");
    // Used up: the same callback link can't be replayed in this tab.
    expect(sessionStorage.getItem("ps-google-nonce")).toBeNull();
  });

  it.each([
    ["a different nonce", "someone-elses-nonce-0000000000000"],
    ["no nonce", null],
  ])("discards the tokens when the callback has %s", async (_case, nonce) => {
    renderCallback("/auth/callback#access_token=acc&refresh_token=ref", makeStore(), nonce);
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login?error=google_failed"));
    expect(localStorage.getItem("ps-access-token")).toBeNull();
    expect(localStorage.getItem("ps-refresh-token")).toBeNull();
  });

  it("discards the tokens when this tab never started a Google sign-in", async () => {
    window.history.replaceState(
      null,
      "",
      `/auth/callback#access_token=acc&refresh_token=ref&nonce=${NONCE}`,
    );
    render(
      <StoreProvider store={makeStore()}>
        <GoogleCallback />
      </StoreProvider>,
    );
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login?error=google_failed"));
    expect(localStorage.getItem("ps-access-token")).toBeNull();
  });

  it("drops anything cached for a previous user in this tab", async () => {
    const newUser = { ...testUser, email: "ravi@college.edu" };
    server.use(http.get(`${API}/api/v1/auth/me`, () => ok(newUser)));
    const store = makeStore();
    store.dispatch(
      authApi.util.upsertQueryEntries([{ endpointName: "getMe", arg: undefined, value: testUser }]),
    );
    store.dispatch(
      dashboardApi.util.upsertQueryEntries([
        { endpointName: "getInsight", arg: undefined, value: previousInsight },
      ]),
    );

    renderCallback("/auth/callback#access_token=a&refresh_token=r", store);

    await waitFor(() => expect(store.getState().auth.status).toBe("signedIn"));
    const queries = store.getState().api.queries;
    expect(queries["getInsight(undefined)"]).toBeUndefined();
    expect(queries["getMe(undefined)"]?.data).toMatchObject({ email: "ravi@college.edu" });
  });

  it("goes to the dashboard without a next path, ignoring off-site ones", async () => {
    server.use(
      http.get(`${API}/api/v1/auth/me`, () => ok({ ...testUser, onboarding_completed: true })),
    );
    renderCallback("/auth/callback#access_token=a&refresh_token=r&next=%2F%2Fevil.example.com");
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/dashboard"));
  });

  it("sends a new student to the onboarding chat first", async () => {
    server.use(http.get(`${API}/api/v1/auth/me`, () => ok(testUser)));
    renderCallback("/auth/callback#access_token=a&refresh_token=r");
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/onboarding"));
  });

  it("sends the user back to login when tokens are missing", async () => {
    renderCallback("/auth/callback#");
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login?error=google_failed"));
  });

  it("clears the tokens if they don't work", async () => {
    server.use(
      http.get(`${API}/api/v1/auth/me`, () => fail(401, "INVALID_TOKEN", "Expired.")),
      http.post(`${API}/api/v1/auth/refresh`, () => fail(401, "INVALID_REFRESH_TOKEN", "Expired.")),
    );
    renderCallback("/auth/callback#access_token=bad&refresh_token=bad");
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login?error=google_failed"));
    expect(localStorage.getItem("ps-access-token")).toBeNull();
  });
});

describe("google helpers", () => {
  it("builds the backend sign-in URL with an optional next", () => {
    expect(googleSignInUrl()).toBe("http://localhost:8000/api/v1/auth/google");
    expect(googleSignInUrl("/dashboard")).toBe(
      "http://localhost:8000/api/v1/auth/google?next=%2Fdashboard",
    );
  });

  it("adds the nonce, keeping next", () => {
    expect(googleSignInUrl("/dashboard", "abc")).toBe(
      "http://localhost:8000/api/v1/auth/google?next=%2Fdashboard&nonce=abc",
    );
  });

  it("creates a fresh 32-character base64url nonce, usable once", () => {
    const nonce = createGoogleNonce();
    expect(nonce).toMatch(/^[A-Za-z0-9_-]{32}$/);
    expect(createGoogleNonce()).not.toBe(nonce);
    const latest = sessionStorage.getItem("ps-google-nonce");
    expect(takeGoogleNonce()).toBe(latest);
    expect(takeGoogleNonce()).toBeNull();
  });

  it("maps error codes to sentences", () => {
    expect(authErrorMessage(undefined)).toBeNull();
    expect(authErrorMessage("google_cancelled")).toBe("Google sign-in was cancelled.");
    expect(authErrorMessage("something_new")).toMatch(/didn't work/);
  });
});
