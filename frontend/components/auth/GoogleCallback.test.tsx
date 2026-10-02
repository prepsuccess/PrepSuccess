import { render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { authErrorMessage, googleSignInUrl } from "@/lib/auth/google";
import { GoogleCallback } from "./GoogleCallback";

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

const user = {
  id: "1",
  first_name: "Asha",
  last_name: null,
  email: "asha@gmail.com",
  role: "student",
  auth_provider: "google",
  profile: {},
};

function mockMe(status = 200) {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(
      JSON.stringify(status === 200 ? { success: true, data: user } : { success: false }),
      {
        status,
      },
    ),
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("GoogleCallback", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    replace.mockReset();
    localStorage.clear();
    window.history.replaceState(null, "", "/");
  });

  it("stores the tokens, wipes them from the URL and continues to next", async () => {
    const fetchMock = mockMe();
    window.history.replaceState(
      null,
      "",
      "/auth/callback#access_token=acc&refresh_token=ref&next=%2Fprofile",
    );

    render(<GoogleCallback />);

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/profile"));
    expect(localStorage.getItem("ps-access-token")).toBe("acc");
    expect(localStorage.getItem("ps-refresh-token")).toBe("ref");
    expect(window.location.hash).toBe("");
    expect(fetchMock.mock.calls[0]![1].headers.Authorization).toBe("Bearer acc");
  });

  it("goes to the dashboard without a next path, ignoring off-site ones", async () => {
    mockMe();
    window.history.replaceState(
      null,
      "",
      "/auth/callback#access_token=a&refresh_token=r&next=%2F%2Fevil.example.com",
    );
    render(<GoogleCallback />);
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/dashboard"));
  });

  it("sends the user back to login when tokens are missing", async () => {
    vi.stubGlobal("fetch", vi.fn());
    window.history.replaceState(null, "", "/auth/callback");
    render(<GoogleCallback />);
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login?error=google_failed"));
    expect(fetch).not.toHaveBeenCalled();
  });

  it("clears the tokens if they don't work", async () => {
    mockMe(401);
    window.history.replaceState(null, "", "/auth/callback#access_token=bad&refresh_token=bad");
    render(<GoogleCallback />);
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
