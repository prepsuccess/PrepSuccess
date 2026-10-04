import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { StoreProvider } from "@/lib/store/StoreProvider";
import { makeStore } from "@/lib/store/store";
import { API, fail, http, HttpResponse, ok, server } from "@/test/server";
import { testUser } from "@/test/render";
import { saveTokens } from "./session";
import { useCrossTabSession } from "./useCrossTabSession";
import { useSession } from "./useSession";

function renderSession() {
  saveTokens("test-access", "test-refresh");
  const store = makeStore();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <StoreProvider store={store}>{children}</StoreProvider>
  );
  return {
    store,
    ...renderHook(
      () => {
        useCrossTabSession();
        return useSession();
      },
      { wrapper },
    ),
  };
}

/** A fake JWT whose payload names the user; only `sub` is read. */
const tokenFor = (sub: string) => `h.${btoa(JSON.stringify({ sub }))}.s`;

describe("useSession", () => {
  it.each([
    ["offline", () => HttpResponse.error()],
    ["waking up", () => fail(503, "SERVICE_UNAVAILABLE", "Try again later.")],
  ])("keeps the session when the API is %s, and can retry", async (_case, response) => {
    let up = false;
    server.use(http.get(`${API}/api/v1/auth/me`, () => (up ? ok(testUser) : response())));
    const { result, store } = renderSession();

    await waitFor(() => expect(result.current.status).toBe("unreachable"));
    expect(store.getState().auth.status).toBe("signedIn");
    expect(localStorage.getItem("ps-access-token")).toBe("test-access");

    up = true;
    act(() => {
      if (result.current.status === "unreachable") result.current.retry();
    });
    await waitFor(() => expect(result.current.status).toBe("authenticated"));
  });

  it("treats a 403 from /me as signed out", async () => {
    server.use(http.get(`${API}/api/v1/auth/me`, () => fail(403, "FORBIDDEN", "Deactivated.")));
    const { result } = renderSession();
    await waitFor(() => expect(result.current.status).toBe("unauthenticated"));
  });
});

describe("useCrossTabSession", () => {
  it("signs out here when another tab signs out", async () => {
    server.use(http.get(`${API}/api/v1/auth/me`, () => ok(testUser)));
    const { result, store } = renderSession();
    await waitFor(() => expect(result.current.status).toBe("authenticated"));

    localStorage.removeItem("ps-access-token");
    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", { key: "ps-access-token", oldValue: "test-access" }),
      );
    });

    expect(result.current.status).toBe("unauthenticated");
    expect(store.getState().api.queries["getMe(undefined)"]).toBeUndefined();
  });

  it("loads the new user when another tab signs in as someone else", async () => {
    const ravi = { ...testUser, email: "ravi@college.edu" };
    server.use(
      http.get(`${API}/api/v1/auth/me`, ({ request }) =>
        ok(request.headers.get("Authorization") === `Bearer ${tokenFor("ravi")}` ? ravi : testUser),
      ),
    );
    const { result } = renderSession();
    await waitFor(() => expect(result.current.status).toBe("authenticated"));

    saveTokens(tokenFor("ravi"), "ravi-refresh");
    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", { key: "ps-access-token", oldValue: tokenFor("asha") }),
      );
    });

    await waitFor(() => expect(result.current.user?.email).toBe("ravi@college.edu"));
  });
});
