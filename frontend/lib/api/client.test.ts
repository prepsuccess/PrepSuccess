import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient, ApiError } from "./client";
import { clearTokens, saveTokens } from "@/lib/auth/session";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("apiClient", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    clearTokens();
  });

  it("sends a JSON body and parses a JSON response on post", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await apiClient.post<{ ok: boolean }>("/api/v1/auth/login", {
      email: "a@b.com",
    });

    expect(result).toEqual({ ok: true });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("/api/v1/auth/login");
    expect(init.method).toBe("POST");
    expect(init.body).toBe(JSON.stringify({ email: "a@b.com" }));
    expect(init.headers.Authorization).toBeUndefined();
  });

  it("attaches the stored access token as a bearer header", async () => {
    saveTokens("access-123", "refresh-456");
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}));
    vi.stubGlobal("fetch", fetchMock);

    await apiClient.get("/api/v1/auth/me");

    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe("Bearer access-123");
  });

  it("throws ApiError with FastAPI's detail message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ detail: "Invalid email or password." }, 401)),
    );

    await expect(apiClient.get("/api/v1/auth/me")).rejects.toMatchObject({
      status: 401,
      message: "Invalid email or password.",
    } satisfies Partial<ApiError>);
  });

  it("uses the first validation error when detail is a list", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse({ detail: [{ msg: "value is not a valid email address" }] }, 422),
        ),
    );

    await expect(apiClient.post("/api/v1/auth/send-otp", {})).rejects.toMatchObject({
      status: 422,
      message: "value is not a valid email address",
    });
  });
});
