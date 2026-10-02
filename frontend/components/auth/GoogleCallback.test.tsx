import { render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { authErrorMessage, googleSignInUrl } from "@/lib/auth/google";
import { StoreProvider } from "@/lib/store/StoreProvider";
import { makeStore } from "@/lib/store/store";
import { API, fail, http, ok, server } from "@/test/server";
import { testUser } from "@/test/render";
import { GoogleCallback } from "./GoogleCallback";

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

function renderCallback(url: string) {
  window.history.replaceState(null, "", url);
  const store = makeStore();
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
  });

  it("goes to the dashboard without a next path, ignoring off-site ones", async () => {
    server.use(http.get(`${API}/api/v1/auth/me`, () => ok(testUser)));
    renderCallback("/auth/callback#access_token=a&refresh_token=r&next=%2F%2Fevil.example.com");
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/dashboard"));
  });

  it("sends the user back to login when tokens are missing", async () => {
    renderCallback("/auth/callback");
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

  it("maps error codes to sentences", () => {
    expect(authErrorMessage(undefined)).toBeNull();
    expect(authErrorMessage("google_cancelled")).toBe("Google sign-in was cancelled.");
    expect(authErrorMessage("something_new")).toMatch(/didn't work/);
  });
});
