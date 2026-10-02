import { http, HttpResponse, type JsonBodyType } from "msw";
import { setupServer } from "msw/node";

/**
 * Mock API for tests. Requests that no test handles fail the test, so a
 * component can't silently call an endpoint nobody expected.
 * Handlers return the backend's real envelope via `ok()` / `fail()`.
 */
export const API = "http://localhost:8000";
export const server = setupServer();

export const ok = (data: JsonBodyType, status = 200) =>
  HttpResponse.json(
    { success: true, data, request_id: "test", timestamp: new Date().toISOString() },
    { status },
  );

export const fail = (status: number, code: string, message: string, details: unknown[] = []) =>
  HttpResponse.json(
    {
      success: false,
      error: { code, message, details },
      request_id: "test",
      timestamp: new Date().toISOString(),
    },
    { status },
  );

export { http, HttpResponse };
