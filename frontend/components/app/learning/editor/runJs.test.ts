import { describe, expect, it, vi } from "vitest";
import {
  MAX_LINE_CHARS,
  MAX_OUTPUT_CHARS,
  TRUNCATED_SUFFIX,
  WORKER_SOURCE,
  toOutputLine,
} from "./runJs";

type Posted = { type: string; level?: string; text?: string };

/**
 * Boots the worker script against a stand-in worker scope (jsdom has no
 * workers) and returns that scope plus everything the script posted.
 */
function bootWorker() {
  const posted: Posted[] = [];
  const scope: Record<string, unknown> = {
    postMessage: (msg: Posted) => posted.push(msg),
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    addEventListener: vi.fn(),
  };
  new Function("self", WORKER_SOURCE)(scope);
  const console = scope.console as Record<"log" | "warn", (...args: unknown[]) => void>;
  return { scope, posted, console, texts: () => posted.map((m) => m.text) };
}

describe("runJs worker", () => {
  it("takes postMessage and nested workers away from student code", () => {
    const { scope } = bootWorker();
    expect(scope.postMessage).toBeUndefined();
    expect(() => {
      scope.postMessage = () => {};
    }).toThrow();
    for (const name of ["Worker", "SharedWorker", "WebTransport", "fetch"]) {
      expect(scope[name], name).toBeUndefined();
    }
  });

  it("formats dates, regexes, errors and class instances", () => {
    const { console, texts } = bootWorker();
    class Point {
      constructor(
        public x: number,
        public y: number,
      ) {}
    }
    class Empty {}
    console.log(new Date(0));
    console.log(/ab+c/gi);
    console.log(new TypeError("bad"));
    console.log(new Point(1, 2));
    console.log(new Empty());
    console.log({ when: new Date(0), list: [1, "a"] });
    expect(texts()).toEqual([
      "1970-01-01T00:00:00.000Z",
      "/ab+c/gi",
      "TypeError: bad",
      "Point { x: 1, y: 2 }",
      "Empty {}",
      '{ when: 1970-01-01T00:00:00.000Z, list: [1, "a"] }',
    ]);
  });

  it("truncates long lines and stops after too much output", () => {
    const { console, posted } = bootWorker();
    console.log("x".repeat(MAX_LINE_CHARS + 50));
    expect(posted[0]!.text).toBe("x".repeat(MAX_LINE_CHARS) + TRUNCATED_SUFFIX);

    const lines = Math.ceil(MAX_OUTPUT_CHARS / MAX_LINE_CHARS) + 5;
    for (let i = 0; i < lines; i++) console.log("y".repeat(MAX_LINE_CHARS));
    const last = posted[posted.length - 1]!;
    expect(last).toMatchObject({ level: "warn", text: expect.stringMatching(/Output truncated/) });
    const total = posted.reduce((sum, m) => sum + (m.text?.length ?? 0), 0);
    expect(total).toBeLessThan(MAX_OUTPUT_CHARS + 100);

    console.log("after the cap");
    expect(posted[posted.length - 1]).toBe(last);
  });
});

describe("toOutputLine", () => {
  it("coerces text to a string and only accepts known levels", () => {
    expect(toOutputLine({ type: "line", level: "warn", text: "hi" })).toEqual({
      level: "warn",
      text: "hi",
    });
    expect(toOutputLine({ type: "line", level: "<img>", text: 42 })).toEqual({
      level: "log",
      text: "42",
    });
    expect(toOutputLine({ type: "line", text: { a: 1 } })?.text).toBe("[object Object]");
    expect(toOutputLine({ type: "line" })?.text).toBe("");
    expect(toOutputLine({ type: "line", text: "z".repeat(MAX_LINE_CHARS + 1) })?.text).toBe(
      "z".repeat(MAX_LINE_CHARS) + TRUNCATED_SUFFIX,
    );
    expect(toOutputLine({ type: "done" })).toBeNull();
    expect(toOutputLine(null)).toBeNull();
    expect(toOutputLine("line")).toBeNull();
  });
});
