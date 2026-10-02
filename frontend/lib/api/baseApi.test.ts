import { describe, expect, it } from "vitest";
import { saveTokens } from "@/lib/auth/session";
import { signedIn } from "@/lib/auth/authSlice";
import { makeStore } from "@/lib/store/store";
import { API, fail, http, HttpResponse, ok, server } from "@/test/server";
import { testUser } from "@/test/render";
import { aiApi } from "./endpoints/ai";
import { authApi } from "./endpoints/auth";
import { fieldErrors, isApiError } from "./errors";

const aiStatus = {
  available: true,
  allowed: true,
  reason: null,
  trial: { active: true, ends_at: "2027-01-01T00:00:00.000Z", days_left: 90, enforced: false },
  today: { requests: 1, limit: 200 },
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
