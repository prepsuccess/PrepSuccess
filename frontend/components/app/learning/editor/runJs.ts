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
/** Longest single line of output, in characters. */
export const MAX_LINE_CHARS = 10_000;
/** Total output a run may produce (about 200 KB) before the rest is dropped. */
export const MAX_OUTPUT_CHARS = 200_000;
export const TRUNCATED_SUFFIX = "… (truncated)";

/**
 * Executed inside the worker. Kept as plain ES2017 source so it runs as-is.
 * Exported for tests only.
 */
export const WORKER_SOURCE = String.raw`
"use strict";
const MAX_LINE_CHARS = ${MAX_LINE_CHARS};
const MAX_OUTPUT_CHARS = ${MAX_OUTPUT_CHARS};
const TRUNCATED_SUFFIX = ${JSON.stringify(TRUNCATED_SUFFIX)};

// Keep postMessage for ourselves, then take it away from student code so it
// can't fake output lines or end the run early.
const post = self.postMessage.bind(self);
const scopes = [self];
if (typeof DedicatedWorkerGlobalScope === "function") scopes.push(DedicatedWorkerGlobalScope.prototype);
for (const scope of scopes) {
  try { Object.defineProperty(scope, "postMessage", { value: undefined, writable: false, configurable: false }); } catch (_) {}
}

function fmt(value, depth, seen) {
  if (typeof value === "string") return depth ? JSON.stringify(value) : value;
  if (value === undefined) return "undefined";
  if (typeof value === "function") return "[Function " + (value.name || "anonymous") + "]";
  if (typeof value === "bigint") return value + "n";
  if (typeof value === "symbol") return value.toString();
  if (value === null || typeof value !== "object") return String(value);
  if (value instanceof Error) return value.name + ": " + value.message;
  if (value instanceof Date) return isNaN(value.getTime()) ? "Invalid Date" : value.toISOString();
  if (value instanceof RegExp) return String(value);
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
    // Instances of a class show its name, like Node does: Point { x: 1, y: 2 }.
    const proto = Object.getPrototypeOf(value);
    const ctor = proto && proto !== Object.prototype ? proto.constructor : null;
    const name = typeof ctor === "function" && ctor.name ? ctor.name + " " : "";
    const entries = Object.keys(value).map((k) => k + ": " + fmt(value[k], depth + 1, seen));
    out = name + (entries.length ? "{ " + entries.join(", ") + " }" : "{}");
  }
  seen.delete(value);
  return out;
}

let written = 0;
let full = false;
const line = (level, args) => {
  if (full) return;
  let text;
  try {
    text = args.map((a) => fmt(a, 0, new Set())).join(" ");
  } catch (_) {
    text = "[value that can't be printed]";
  }
  if (text.length > MAX_LINE_CHARS) text = text.slice(0, MAX_LINE_CHARS) + TRUNCATED_SUFFIX;
  written += text.length;
  if (written > MAX_OUTPUT_CHARS) {
    full = true;
    post({ type: "line", level: "warn", text: "Output truncated: your code printed too much." });
    return;
  }
  post({ type: "line", level, text });
};
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

// No network, extra scripts, nested workers or channels to other tabs from student code.
for (const name of ["fetch", "XMLHttpRequest", "WebSocket", "EventSource", "WebTransport", "importScripts", "indexedDB", "caches", "Worker", "SharedWorker", "BroadcastChannel"]) {
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

const LEVELS: ReadonlySet<string> = new Set<OutputLevel>(["log", "info", "warn", "error"]);

/**
 * Turns a message from the worker into an output line, or null if it isn't
 * one. The worker is ours, but its messages are still checked: a level we
 * don't know becomes "log" and the text is always a bounded string.
 */
export function toOutputLine(msg: unknown): OutputLine | null {
  if (!msg || typeof msg !== "object") return null;
  const { type, level, text } = msg as { type?: unknown; level?: unknown; text?: unknown };
  if (type !== "line") return null;
  let value = String(text ?? "");
  if (value.length > MAX_LINE_CHARS) value = value.slice(0, MAX_LINE_CHARS) + TRUNCATED_SUFFIX;
  return {
    level: typeof level === "string" && LEVELS.has(level) ? (level as OutputLevel) : "log",
    text: value,
  };
}

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

    worker.onmessage = (event: MessageEvent<unknown>) => {
      const msg = event.data;
      if (msg && typeof msg === "object" && (msg as { type?: unknown }).type === "done") {
        return finish();
      }
      const out = toOutputLine(msg);
      if (out && lines.length < MAX_LINES) lines.push(out);
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
