import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AppError } from "../src/lib/http.js";

// Google itself can't be called from tests: mock the code exchange and the
// account logic, and test everything around them (redirects, PKCE, state, cookies).
vi.mock("../src/modules/auth/google.client.js", async (importOriginal) => {
  const original = await importOriginal<typeof import("../src/modules/auth/google.client.js")>();
  return {
    ...original,
    exchangeGoogleCode: vi.fn(),
    isGoogleConfigured: vi.fn(original.isGoogleConfigured),
  };
});
vi.mock("../src/modules/auth/auth.service.js", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../src/modules/auth/auth.service.js")>()),
  loginWithGoogle: vi.fn(),
}));

const { createApp } = await import("../src/app.js");
const { exchangeGoogleCode, isGoogleConfigured } =
  await import("../src/modules/auth/google.client.js");
const { loginWithGoogle } = await import("../src/modules/auth/auth.service.js");

const app = createApp();
const START = "/api/v1/auth/google";
const CALLBACK = "/api/v1/auth/google/callback";

/** Runs /google and returns the state Google would echo back plus the flow cookie. */
async function startFlow(next?: string, nonce?: string) {
  const res = await request(app)
    .get(START)
    .query({ ...(next ? { next } : {}), ...(nonce ? { nonce } : {}) });
  const location = new URL(res.headers.location!);
  const cookie = (res.headers["set-cookie"] as unknown as string[]).find((c) =>
    c.startsWith("ps_google_oauth="),
  )!;
  return {
    res,
    location,
    state: location.searchParams.get("state")!,
    cookie: cookie.split(";")[0]!,
  };
}

afterEach(() => vi.mocked(exchangeGoogleCode).mockReset());

const IDENTITY = {
  googleId: "g-1",
  email: "a@gmail.com",
  emailVerified: true,
  firstName: null,
  lastName: null,
  picture: null,
};
const SESSION = { access_token: "a", refresh_token: "r" } as Awaited<
  ReturnType<typeof loginWithGoogle>
>;

/** Runs the whole flow and returns the fragment handed to the frontend. */
async function signIn(next?: string, nonce?: string) {
  vi.mocked(exchangeGoogleCode).mockResolvedValue(IDENTITY);
  vi.mocked(loginWithGoogle).mockResolvedValue(SESSION);
  const { state, cookie } = await startFlow(next, nonce);
  const res = await request(app).get(CALLBACK).set("Cookie", cookie).query({ code: "c", state });
  return new URLSearchParams(new URL(res.headers.location!).hash.slice(1));
}

describe("GET /auth/google", () => {
  it("redirects to Google with state and an S256 PKCE challenge", async () => {
    const { res, location, cookie } = await startFlow("/dashboard");

    expect(res.status).toBe(302);
    expect(location.origin).toBe("https://accounts.google.com");
    expect(location.searchParams.get("client_id")).toBe(
      "test-client-id.apps.googleusercontent.com",
    );
    expect(location.searchParams.get("redirect_uri")).toBe(
      "http://localhost:8000/api/v1/auth/google/callback",
    );
    expect(location.searchParams.get("scope")).toBe("openid email profile");
    expect(location.searchParams.get("code_challenge_method")).toBe("S256");
    expect(location.searchParams.get("code_challenge")).toBeTruthy();
    expect(location.searchParams.get("state")!.length).toBeGreaterThan(20);

    const setCookie = (res.headers["set-cookie"] as unknown as string[]).join(";");
    expect(setCookie).toMatch(/HttpOnly/i);
    expect(setCookie).toMatch(/SameSite=Lax/i);
    // The verifier lives only in the cookie, never in the URL sent to the browser.
    expect(res.headers.location).not.toContain(
      JSON.parse(decodeURIComponent(cookie.split("=")[1]!)).verifier,
    );
  });

  it("sends the browser back to /login when Google isn't configured", async () => {
    vi.mocked(isGoogleConfigured).mockReturnValueOnce(false);
    const res = await request(app).get(START);
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("http://localhost:3000/login?error=google_not_configured");
  });

  it("rejects a malformed nonce without starting the flow", async () => {
    for (const nonce of ["short", "has spaces in it!!", "x".repeat(129)]) {
      const res = await request(app).get(START).query({ nonce });
      expect(res.headers.location).toBe("http://localhost:3000/login?error=google_failed");
      expect(res.headers["set-cookie"]).toBeUndefined();
    }
  });
});

describe("GET /auth/google/callback", () => {
  it("sends a cancelled consent back to /login", async () => {
    const res = await request(app).get(CALLBACK).query({ error: "access_denied" });
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("http://localhost:3000/login?error=google_cancelled");
  });

  it("rejects a callback with no flow cookie", async () => {
    const res = await request(app).get(CALLBACK).query({ code: "c", state: "s" });
    expect(res.headers.location).toBe("http://localhost:3000/login?error=google_session_expired");
  });

  it("rejects a forged state", async () => {
    const { cookie } = await startFlow();
    const res = await request(app)
      .get(CALLBACK)
      .set("Cookie", cookie)
      .query({ code: "c", state: "attacker-state" });
    expect(res.headers.location).toBe("http://localhost:3000/login?error=google_failed");
    expect(exchangeGoogleCode).not.toHaveBeenCalled();
  });

  it("signs in and hands tokens to the frontend in the URL fragment", async () => {
    vi.mocked(exchangeGoogleCode).mockResolvedValue({
      googleId: "g-123",
      email: "asha@gmail.com",
      emailVerified: true,
      firstName: "Asha",
      lastName: null,
      picture: null,
    });
    vi.mocked(loginWithGoogle).mockResolvedValue({
      access_token: "access-abc",
      refresh_token: "refresh-xyz",
      token_type: "bearer",
      expires_in: 1800,
    } as Awaited<ReturnType<typeof loginWithGoogle>>);

    const { state, cookie } = await startFlow("/dashboard");
    const res = await request(app)
      .get(CALLBACK)
      .set("Cookie", cookie)
      .query({ code: "google-code", state });

    expect(exchangeGoogleCode).toHaveBeenCalledWith("google-code", expect.any(String));
    const location = new URL(res.headers.location!);
    expect(`${location.origin}${location.pathname}`).toBe("http://localhost:3000/auth/callback");
    expect(location.search).toBe("");
    const fragment = new URLSearchParams(location.hash.slice(1));
    expect(fragment.get("access_token")).toBe("access-abc");
    expect(fragment.get("refresh_token")).toBe("refresh-xyz");
    expect(fragment.get("next")).toBe("/dashboard");
    // The one-time flow cookie is cleared.
    expect((res.headers["set-cookie"] as unknown as string[]).join(";")).toMatch(
      /ps_google_oauth=;/,
    );
  });

  it("drops an unsafe next path", async () => {
    const dropped = [
      "//evil.example.com",
      "/\\evil.example.com",
      "/\tevil",
      "/\u0000x",
      "https://evil.example.com/",
      "dashboard",
    ];
    for (const next of dropped) {
      expect((await signIn(next)).get("next"), JSON.stringify(next)).toBeNull();
    }
    // Encoded tricks stay an inert same-site path.
    expect((await signIn("/%0a//evil.example.com")).get("next")).toBe("/%0a//evil.example.com");
  });

  it("keeps a safe next path with its query and hash", async () => {
    expect((await signIn("/learn/sql?tab=tasks#t2")).get("next")).toBe("/learn/sql?tab=tasks#t2");
  });

  it("echoes the nonce back in the fragment", async () => {
    const nonce = "k3J9xQ2mW7pL0aZ8vB4nR6tY";
    expect((await signIn("/dashboard", nonce)).get("nonce")).toBe(nonce);
    expect((await signIn("/dashboard")).get("nonce")).toBeNull();
  });

  it("maps account errors to a /login error code", async () => {
    vi.mocked(exchangeGoogleCode).mockResolvedValue({
      googleId: "g-2",
      email: "b@gmail.com",
      emailVerified: true,
      firstName: null,
      lastName: null,
      picture: null,
    });
    vi.mocked(loginWithGoogle).mockRejectedValue(
      new AppError(403, "ACCOUNT_DEACTIVATED", "This account has been deactivated."),
    );

    const { state, cookie } = await startFlow();
    const res = await request(app).get(CALLBACK).set("Cookie", cookie).query({ code: "c", state });
    expect(res.headers.location).toBe("http://localhost:3000/login?error=account_deactivated");
  });

  it("hides unexpected failures behind a generic code", async () => {
    vi.mocked(exchangeGoogleCode).mockRejectedValue(new Error("invalid_grant"));
    const { state, cookie } = await startFlow();
    const res = await request(app).get(CALLBACK).set("Cookie", cookie).query({ code: "c", state });
    expect(res.headers.location).toBe("http://localhost:3000/login?error=google_failed");
  });
});
