import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient, ApiError } from "./api-client";

describe("apiClient", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends a JSON body and parses a JSON response on post", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await apiClient.post<{ ok: boolean }>("/api/v1/auth/login", {
      email: "a@b.com",
    });

    expect(result).toEqual({ ok: true });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("/api/v1/auth/login");
    expect(init.method).toBe("POST");
    expect(init.body).toBe(JSON.stringify({ email: "a@b.com" }));
  });

  it("throws ApiError with the response status on a failed request", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response("Invalid credentials", { status: 401, statusText: "Unauthorized" }),
      );
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiClient.get("/api/v1/auth/me")).rejects.toMatchObject({
      status: 401,
    } satisfies Partial<ApiError>);
  });
});
