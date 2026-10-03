import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "./test/server";

// jsdom has no ResizeObserver; Recharts' ResponsiveContainer needs one to mount.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// jsdom doesn't lay pages out, so it has no scrollIntoView.
Element.prototype.scrollIntoView ??= function scrollIntoView() {};

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
});
afterAll(() => server.close());
