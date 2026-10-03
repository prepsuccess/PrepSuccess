/**
 * Runs a student's JavaScript in a throwaway Web Worker: no page, no DOM, no
 * network, and it's killed after a few seconds so an infinite loop can't hang
 * the tab. console.* calls come back as lines of output. The run ends as soon
 * as the code and every timer it started have finished.
 */

export type OutputLevel = "log" | "info" | "warn" | "error";
export interface OutputLine {
  level: OutputLevel;
  text: string;
}
export interface RunResult {
  lines: OutputLine[];
  /** Why the run stopped early, if it did. */
  stopped?: "timeout";
}

export const RUN_TIMEOUT_MS = 3000;
const MAX_LINES = 500;

// Executed inside the worker. Kept as plain ES2017 source so it runs as-is.
const WORKER_SOURCE = String.raw`
"use strict";
const post = (msg) => self.postMessage(msg);

function fmt(value, depth, seen) {
  if (typeof value === "string") return depth ? JSON.stringify(value) : value;
  if (value === undefined) return "undefined";
  if (typeof value === "function") return "[Function " + (value.name || "anonymous") + "]";
  if (typeof value === "bigint") return value + "n";
  if (typeof value === "symbol") return value.toString();
  if (value === null || typeof value !== "object") return String(value);
  if (value instanceof Error) return value.name + ": " + value.message;
  if (seen.has(value)) return "[Circular]";
  if (depth > 3) return Array.isArray(value) ? "[Array]" : "[Object]";
  seen.add(value);
  let out;
  if (Array.isArray(value)) {
    out = "[" + value.map((v) => fmt(v, depth + 1, seen)).join(", ") + "]";
  } else if (value instanceof Map) {
    out = "Map(" + value.size + ") {" + Array.from(value, ([k, v]) => fmt(k, depth + 1, seen) + " => " + fmt(v, depth + 1, seen)).join(", ") + "}";
  } else if (value instanceof Set) {
    out = "Set(" + value.size + ") {" + Array.from(value, (v) => fmt(v, depth + 1, seen)).join(", ") + "}";
  } else {
    const entries = Object.keys(value).map((k) => k + ": " + fmt(value[k], depth + 1, seen));
    out = entries.length ? "{ " + entries.join(", ") + " }" : "{}";
  }
  seen.delete(value);
  return out;
}

const line = (level, args) => post({ type: "line", level, text: args.map((a) => fmt(a, 0, new Set())).join(" ") });
const report = (error) => line("error", ["Uncaught " + (error && error.stack ? String(error.stack).split("\n")[0] : fmt(error, 0, new Set()))]);

self.console = {
  log: (...a) => line("log", a),
  info: (...a) => line("info", a),
  debug: (...a) => line("log", a),
  warn: (...a) => line("warn", a),
  error: (...a) => line("error", a),
  table: (...a) => line("log", a),
};

// Track timers so the run can end as soon as nothing is left to do.
const rawSetTimeout = self.setTimeout.bind(self);
const rawClearTimeout = self.clearTimeout.bind(self);
const rawSetInterval = self.setInterval.bind(self);
const rawClearInterval = self.clearInterval.bind(self);
const timers = new Set();
const idle = () => rawSetTimeout(() => { if (!timers.size) post({ type: "done" }); }, 0);
const guard = (fn, args) => { try { if (typeof fn === "function") fn(...args); } catch (e) { report(e); } };

self.setTimeout = (fn, ms, ...args) => {
  const id = rawSetTimeout(() => { timers.delete(id); guard(fn, args); idle(); }, ms);
  timers.add(id);
  return id;
};
self.clearTimeout = (id) => { timers.delete(id); rawClearTimeout(id); idle(); };
self.setInterval = (fn, ms, ...args) => {
  const id = rawSetInterval(() => guard(fn, args), ms);
  timers.add(id);
  return id;
};
self.clearInterval = (id) => { timers.delete(id); rawClearInterval(id); idle(); };

self.addEventListener("unhandledrejection", (event) => { report(event.reason); idle(); });

// No network or extra scripts from student code.
for (const name of ["fetch", "XMLHttpRequest", "WebSocket", "EventSource", "importScripts", "indexedDB", "caches"]) {
  try { Object.defineProperty(self, name, { value: undefined, configurable: false }); } catch (_) {}
}

self.onmessage = (event) => {
  self.onmessage = null;
  try {
    new Function(event.data)();
  } catch (e) {
    report(e);
  }
  idle();
};
`;

let workerUrl: string | null = null;

/** Runs `code` and resolves with its console output. */
export function runJavaScript(code: string, timeoutMs = RUN_TIMEOUT_MS): Promise<RunResult> {
  workerUrl ??= URL.createObjectURL(new Blob([WORKER_SOURCE], { type: "text/javascript" }));
  const worker = new Worker(workerUrl);
  const lines: OutputLine[] = [];

  return new Promise((resolve) => {
    const finish = (stopped?: RunResult["stopped"]) => {
      clearTimeout(timer);
      worker.terminate();
      resolve(stopped ? { lines, stopped } : { lines });
    };
    const timer = setTimeout(() => finish("timeout"), timeoutMs);

    worker.onmessage = (
      event: MessageEvent<{ type: string; level?: OutputLevel; text?: string }>,
    ) => {
      const msg = event.data;
      if (msg.type === "done") return finish();
      if (msg.type === "line" && lines.length < MAX_LINES) {
        lines.push({ level: msg.level ?? "log", text: msg.text ?? "" });
      }
    };
    // A syntax error in the worker itself (shouldn't happen) still ends the run.
    worker.onerror = (event) => {
      event.preventDefault();
      lines.push({ level: "error", text: event.message || "The code couldn't run." });
      finish();
    };
    worker.postMessage(code);
  });
}
