import { waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { saveTokens } from "@/lib/auth/session";
import { signedIn } from "@/lib/auth/authSlice";
import { makeStore } from "@/lib/store/store";
import { API, fail, http, HttpResponse, ok, server } from "@/test/server";
import { testUser } from "@/test/render";
import { aiApi } from "./endpoints/ai";
import { authApi } from "./endpoints/auth";
import { dashboardApi } from "./endpoints/dashboard";
import { onboardingApi } from "./endpoints/onboarding";
import { fieldErrors, isApiError } from "./errors";
import type { AiInsight, OnboardingState } from "./types";

const aiStatus = {
  available: true,
  allowed: true,
  reason: null,
  trial: { active: true, ends_at: "2027-01-01T00:00:00.000Z", days_left: 90, enforced: false },
  today: { requests: 1, limit: 200 },
};

const onboardingState: OnboardingState = {
  conversation_id: "c0ffee00-0000-4000-8000-000000000001",
  messages: [],
  completed: false,
  progress: { collected: 0, total: 5, items: [] },
  profile: {},
  skill_options: { stacks: [], topics: [] },
};

const emptyInsight: AiInsight = {
  status: "empty",
  summary: null,
  gaps: [],
  plan: [],
  generated_at: null,
};

function signedInStore() {
  saveTokens("old-access", "old-refresh");
  const store = makeStore();
  store.dispatch(signedIn());
  return store;
}

describe("baseApi", () => {
  it("unwraps the success envelope and sends the bearer token", async () => {
    let auth: string | null = null;
    server.use(
      http.get(`${API}/api/v1/auth/me`, ({ request }) => {
        auth = request.headers.get("Authorization");
        return ok(testUser);
      }),
    );
    const store = signedInStore();

    const user = await store.dispatch(authApi.endpoints.getMe.initiate()).unwrap();

    expect(user).toEqual(testUser);
    expect(auth).toBe("Bearer old-access");
  });

  it("turns the error envelope into an ApiError", async () => {
    server.use(http.get(`${API}/api/v1/auth/me`, () => fail(403, "FORBIDDEN", "No access.")));
    const store = signedInStore();

    const result = await store.dispatch(authApi.endpoints.getMe.initiate());

    expect(result.error).toEqual({
      status: 403,
      code: "FORBIDDEN",
      message: "No access.",
      details: [],
    });
  });

  it("reports a network failure as NETWORK_ERROR", async () => {
    server.use(http.get(`${API}/api/v1/auth/me`, () => HttpResponse.error()));
    const store = signedInStore();

    const result = await store.dispatch(authApi.endpoints.getMe.initiate());

    expect(isApiError(result.error)).toBe(true);
    expect(result.error).toMatchObject({ status: 0, code: "NETWORK_ERROR" });
  });

  it("refreshes an expired session once for concurrent requests, then retries them", async () => {
    let refreshCalls = 0;
    server.use(
      http.post(`${API}/api/v1/auth/refresh`, async ({ request }) => {
        refreshCalls += 1;
        expect(await request.json()).toEqual({ refresh_token: "old-refresh" });
        return ok({
          access_token: "new-access",
          refresh_token: "new-refresh",
          token_type: "bearer",
          expires_in: 1800,
          user: testUser,
        });
      }),
      http.get(`${API}/api/v1/auth/me`, ({ request }) =>
        request.headers.get("Authorization") === "Bearer new-access"
          ? ok(testUser)
          : fail(401, "INVALID_TOKEN", "Expired."),
      ),
      http.get(`${API}/api/v1/ai/status`, ({ request }) =>
        request.headers.get("Authorization") === "Bearer new-access"
          ? ok(aiStatus)
          : fail(401, "INVALID_TOKEN", "Expired."),
      ),
    );
    const store = signedInStore();

    const [me, status] = await Promise.all([
      store.dispatch(authApi.endpoints.getMe.initiate()).unwrap(),
      store.dispatch(aiApi.endpoints.getAiStatus.initiate()).unwrap(),
    ]);

    expect(me.email).toBe(testUser.email);
    expect(status.today.limit).toBe(200);
    expect(refreshCalls).toBe(1);
    expect(localStorage.getItem("ps-access-token")).toBe("new-access");
    expect(localStorage.getItem("ps-refresh-token")).toBe("new-refresh");
  });

  it("signs out when the refresh token is also rejected", async () => {
    server.use(
      http.get(`${API}/api/v1/auth/me`, () => fail(401, "INVALID_TOKEN", "Expired.")),
      http.post(`${API}/api/v1/auth/refresh`, () => fail(401, "INVALID_REFRESH_TOKEN", "Expired.")),
    );
    const store = signedInStore();

    const result = await store.dispatch(authApi.endpoints.getMe.initiate());

    expect(result.error).toMatchObject({ status: 401 });
    expect(store.getState().auth.status).toBe("signedOut");
    expect(localStorage.getItem("ps-access-token")).toBeNull();
    expect(localStorage.getItem("ps-refresh-token")).toBeNull();
  });

  it.each([
    ["offline", () => HttpResponse.error(), "NETWORK_ERROR"],
    ["down", () => fail(503, "SERVICE_UNAVAILABLE", "Try again later."), "SERVICE_UNAVAILABLE"],
    ["rate limited", () => fail(429, "RATE_LIMITED", "Slow down."), "RATE_LIMITED"],
  ])(
    "keeps the student signed in when the refresh endpoint is %s",
    async (_case, refreshResponse, code) => {
      server.use(
        http.get(`${API}/api/v1/auth/me`, () => fail(401, "INVALID_TOKEN", "Expired.")),
        http.post(`${API}/api/v1/auth/refresh`, refreshResponse),
      );
      const store = signedInStore();

      const result = await store.dispatch(authApi.endpoints.getMe.initiate());

      // The request reports why the refresh failed, not the 401.
      expect(result.error).toMatchObject({ code });
      expect(store.getState().auth.status).toBe("signedIn");
      expect(localStorage.getItem("ps-access-token")).toBe("old-access");
      expect(localStorage.getItem("ps-refresh-token")).toBe("old-refresh");
    },
  );

  it("never refreshes for a failed login — a 401 there means wrong password", async () => {
    server.use(
      http.post(`${API}/api/v1/auth/login`, () =>
        fail(401, "INVALID_CREDENTIALS", "Invalid email or password."),
      ),
      // No refresh handler: calling it would fail the test as an unhandled request.
    );
    const store = signedInStore();

    const result = await store.dispatch(
      authApi.endpoints.login.initiate({ email: "a@b.co", password: "wrong-pass" }),
    );

    expect(result.error).toMatchObject({ code: "INVALID_CREDENTIALS" });
    expect(store.getState().auth.status).toBe("signedIn");
  });
});

describe("AI usage stays current", () => {
  /** A store watching AI usage, plus a count of how often it was fetched. */
  async function watchingAiStatus() {
    const calls = { count: 0 };
    server.use(
      http.get(`${API}/api/v1/ai/status`, () => {
        calls.count += 1;
        return ok(aiStatus);
      }),
    );
    const store = signedInStore();
    store.dispatch(aiApi.endpoints.getAiStatus.initiate());
    await waitFor(() => expect(calls.count).toBe(1));
    return { store, calls };
  }

  it("refetches after an onboarding message, sent or not", async () => {
    let attempts = 0;
    server.use(
      http.post(`${API}/api/v1/ai/onboarding/messages`, () => {
        attempts += 1;
        return attempts === 1
          ? fail(429, "AI_DAILY_LIMIT", "You've used today's AI chats.")
          : ok({ onboarding: onboardingState, user: testUser });
      }),
    );
    const { store, calls } = await watchingAiStatus();

    await store.dispatch(
      onboardingApi.endpoints.sendOnboardingMessage.initiate({ content: "BCA" }),
    );
    await waitFor(() => expect(calls.count).toBe(2));

    await store.dispatch(
      onboardingApi.endpoints.sendOnboardingMessage.initiate({ content: "BCA" }),
    );
    await waitFor(() => expect(calls.count).toBe(3));
  });

  it("refetches after the coach's take loads", async () => {
    server.use(http.get(`${API}/api/v1/ai/insight`, () => ok(emptyInsight)));
    const { store, calls } = await watchingAiStatus();

    await store.dispatch(dashboardApi.endpoints.getInsight.initiate());
    await waitFor(() => expect(calls.count).toBe(2));
  });
});

describe("fieldErrors", () => {
  it("maps 422 issues to field names", () => {
    const error = {
      status: 422,
      code: "VALIDATION_ERROR",
      message: "Request validation failed.",
      details: [
        { path: ["profile", "mobile_no"], message: "Enter a valid phone number." },
        { path: ["first_name"], message: "Enter your first name." },
      ],
    };
    expect(fieldErrors(error)).toEqual({
      mobile_no: "Enter a valid phone number.",
      first_name: "Enter your first name.",
    });
  });

  it("ignores anything that isn't a validation error", () => {
    expect(fieldErrors({ status: 500, code: "X", message: "Y", details: [] })).toEqual({});
    expect(fieldErrors(new Error("boom"))).toEqual({});
  });
});

describe("startSession", () => {
  it("drops the previous user's cached data before seeding the new user", async () => {
    const { startSession } = await import("@/lib/auth/useSession");
    const store = makeStore();
    store.dispatch(
      aiApi.util.upsertQueryEntries([
        { endpointName: "getAiStatus", arg: undefined, value: aiStatus },
      ]),
    );
    expect(store.getState().api.queries["getAiStatus(undefined)"]).toBeDefined();

    const newUser = {
      ...testUser,
      id: "9f8e7d6c-5b4a-4321-9876-543210fedcba",
      email: "ravi@college.edu",
    };
    startSession(store.dispatch, {
      access_token: "a",
      refresh_token: "r",
      token_type: "bearer",
      expires_in: 1800,
      user: newUser,
    });

    const queries = store.getState().api.queries;
    expect(queries["getAiStatus(undefined)"]).toBeUndefined();
    expect(queries["getMe(undefined)"]?.data).toMatchObject({ email: "ravi@college.edu" });
    expect(store.getState().auth.status).toBe("signedIn");
  });
});
