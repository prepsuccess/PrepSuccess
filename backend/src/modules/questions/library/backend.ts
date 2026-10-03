import { q, type CatalogueQuestion } from "./helpers.js";

/** Interview questions for this topic group (see helpers.ts for the format). */
export const BACKEND_QUESTIONS: CatalogueQuestion[] = [
  // ---------------------------------------------------------------- nodejs
  q(
    "nodejs",
    "What is Node.js and why is it called single-threaded?",
    "Event Loop",
    "EASY",
    `
What is Node.js? People say it is "single-threaded", yet it handles thousands of concurrent connections. How is that possible?
`,
    `
- Node.js is a JavaScript runtime built on Chrome's V8 engine, used to run JS outside the browser (servers, CLIs, tooling).
- Your JavaScript runs on one main thread with a single call stack, so only one piece of JS executes at a time.
- I/O (network, files, timers) is non-blocking: Node hands it to the OS or to libuv's thread pool and registers a callback.
- The event loop picks up completed I/O and runs the callbacks, so one thread can juggle many connections that are mostly waiting.
- It shines for I/O-heavy work (APIs, real-time apps); CPU-heavy work blocks the loop and needs worker threads or another service.
`,
  ),
  q(
    "nodejs",
    "What is the difference between require and import in Node.js?",
    "Modules",
    "EASY",
    `
Node supports two module systems: CommonJS (require / module.exports) and ES Modules (import / export). What are the differences, and how does Node decide which one a file uses?
`,
    `
- CommonJS: require() is synchronous, can be called anywhere (even inside an if), and returns module.exports.
- ESM: import/export are static, hoisted and analysed before the code runs, which enables tree-shaking; dynamic loading uses import().
- ESM loads asynchronously and supports top-level await; CommonJS does not.
- In ESM there is no __dirname, __filename or require by default (use import.meta.url / import.meta.dirname).
- Node treats .mjs as ESM and .cjs as CommonJS; for .js it checks "type": "module" in the nearest package.json (default is CommonJS).
`,
  ),
  q(
    "nodejs",
    "What is package.json and what does package-lock.json add?",
    "Modules",
    "EASY",
    `
Explain the purpose of package.json in a Node project. Why do we also commit package-lock.json, and what does a version range like ^4.18.2 mean?
`,
    `
- package.json is the project manifest: name, version, scripts, entry point, and dependency ranges.
- ^4.18.2 allows any 4.x.y that is >= 4.18.2 (minor and patch updates); ~4.18.2 allows only patch updates (4.18.x).
- package-lock.json records the exact version and integrity hash of every installed package, including transitive ones.
- Committing the lock file makes installs reproducible: every developer and CI machine gets the same tree.
- Use npm ci in CI: it installs exactly what the lock file says and fails if it is out of sync with package.json.
`,
  ),
  q(
    "nodejs",
    "What is the difference between dependencies and devDependencies?",
    "Modules",
    "EASY",
    `
When you install a package you can save it as a dependency or a devDependency. What is the difference, and give examples of packages that belong in each.
`,
    `
- dependencies: needed at runtime in production, e.g. express, mongoose, zod.
- devDependencies: only needed while developing, building or testing, e.g. typescript, eslint, jest, nodemon.
- npm install --omit=dev (or NODE_ENV=production) skips devDependencies, giving smaller, safer production images.
- Install with npm install express versus npm install -D jest.
- A common bug: putting a runtime package in devDependencies, so the app crashes with "Cannot find module" in production.
`,
  ),
  q(
    "nodejs",
    "What is callback hell and how do you avoid it?",
    "Async Patterns",
    "EASY",
    `
What is "callback hell" (the pyramid of doom) in Node.js? Show how you would rewrite deeply nested callbacks in a cleaner way.
`,
    `
Callback hell is deep nesting of callbacks where each async step depends on the previous one, making code hard to read and error handling repetitive.

Ways to avoid it:
- Use Promises and chain them with .then().
- Use async/await so async code reads top to bottom.
- Use promise-based APIs (fs/promises) or util.promisify for old callback APIs.
- Split logic into small named functions.

\`\`\`js
const fs = require("fs/promises");

async function copyConfig() {
  const data = await fs.readFile("config.json", "utf8");
  await fs.writeFile("backup.json", data);
}
\`\`\`
`,
  ),
  q(
    "nodejs",
    "What is the difference between fs.readFile and fs.readFileSync?",
    "Async Patterns",
    "EASY",
    `
Compare fs.readFile and fs.readFileSync. When is it acceptable to use the synchronous version in a server?
`,
    `
- fs.readFile is asynchronous: the read happens off the main thread and a callback (or promise with fs/promises) gets the result. The event loop keeps serving other requests.
- fs.readFileSync blocks the main thread until the whole file is read; no other request can be handled in the meantime.
- In a request handler, sync I/O hurts every user of the server.
- Acceptable uses: startup code (loading config or certificates once before the server listens), CLI scripts, and build tools.
- For large files prefer fs.createReadStream so the whole file is not held in memory.
`,
    { role: "Backend Developer" },
  ),
  q(
    "nodejs",
    "What is process.env and how do you manage configuration?",
    "Process",
    "EASY",
    `
What is process.env in Node.js? How should an application handle configuration like database URLs and API keys across development and production?
`,
    `
- process.env is an object holding the environment variables of the running process; all values are strings (or undefined).
- Keep config and secrets in environment variables, not in code (the 12-factor app principle).
- Locally, load a .env file with dotenv or node --env-file=.env; add .env to .gitignore and commit a .env.example.
- In production, set variables through the platform (Docker, Kubernetes secrets, cloud config).
- Validate config at startup (e.g. with zod) and fail fast if a required variable is missing; convert types such as Number(process.env.PORT).
`,
  ),
  q(
    "nodejs",
    "Explain the phases of the Node.js event loop.",
    "Event Loop",
    "MEDIUM",
    `
Walk through the phases of the Node.js event loop. Where do setTimeout, setImmediate, I/O callbacks and close events run?
`,
    `
Each loop iteration goes through these phases (implemented by libuv):
- Timers: callbacks of expired setTimeout / setInterval.
- Pending callbacks: some deferred system I/O callbacks (e.g. TCP errors).
- Idle / prepare: internal use.
- Poll: retrieve new I/O events and run their callbacks; it may block here waiting for I/O if nothing else is scheduled.
- Check: setImmediate callbacks.
- Close callbacks: e.g. socket.on("close").

Between every callback, Node drains the process.nextTick queue first and then the promise microtask queue. The loop exits when there is no pending work left.
`,
    { role: "Backend Developer" },
  ),
  q(
    "nodejs",
    "What is the output order of nextTick, promises, setTimeout and setImmediate?",
    "Event Loop",
    "MEDIUM",
    `
What does this CommonJS script print, and why?

\`\`\`js
console.log("A");
setTimeout(() => console.log("B"), 0);
setImmediate(() => console.log("C"));
process.nextTick(() => console.log("D"));
Promise.resolve().then(() => console.log("E"));
console.log("F");
\`\`\`
`,
    `
Output: A, F, D, E, then B and C (their order can vary).

- A and F are synchronous, so they print first.
- After the main script finishes, Node drains the nextTick queue (D) and then the promise microtask queue (E).
- B (timers phase) and C (check phase) run in the event loop. From the main module, whether the 0 ms timer has expired when the loop starts depends on process timing, so B and C can come in either order.
- Inside an I/O callback, setImmediate always runs before setTimeout(..., 0).
`,
  ),
  q(
    "nodejs",
    "What are streams in Node.js and what types exist?",
    "Streams",
    "MEDIUM",
    `
What are streams in Node.js? Name the four stream types with an example of each, and explain why you would stream a 2 GB file instead of reading it with fs.readFile.
`,
    `
Streams process data piece by piece (chunks) instead of loading everything into memory.

- Readable: a source, e.g. fs.createReadStream, an HTTP request on the server.
- Writable: a destination, e.g. fs.createWriteStream, an HTTP response.
- Duplex: both readable and writable, e.g. a TCP socket.
- Transform: a duplex that modifies data as it passes, e.g. zlib.createGzip().

Reading a 2 GB file with readFile needs about 2 GB of memory (and may exceed the Buffer limit). Streaming keeps memory to a small buffer (64 KB chunks by default for file streams) and lets you start sending data immediately.

\`\`\`js
const { pipeline } = require("stream/promises");
await pipeline(fs.createReadStream("big.log"), zlib.createGzip(), fs.createWriteStream("big.log.gz"));
\`\`\`
`,
    { role: "Backend Developer" },
  ),
  q(
    "nodejs",
    "What is a Buffer in Node.js?",
    "Streams",
    "MEDIUM",
    `
What is a Buffer, why does Node.js need it, and how do you convert between a Buffer and a string? What does Buffer.from("hi").length return, and what about Buffer.from("₹").length?
`,
    `
- A Buffer is a fixed-size chunk of raw binary memory allocated outside the V8 heap; it is a subclass of Uint8Array.
- Node needs it because files, sockets and crypto work with bytes, not JS strings.
- Convert: Buffer.from("hello", "utf8") and buf.toString("utf8"); other encodings include "base64" and "hex".
- Buffer.from("hi").length is 2 (bytes). The rupee sign is U+20B9, which takes 3 bytes in UTF-8, so its length is 3 even though the string length is 1.
- Prefer Buffer.alloc(size) (zero-filled) over Buffer.allocUnsafe(size), which may contain old memory.
`,
  ),
  q(
    "nodejs",
    "What is the difference between Promise.all, allSettled, race and any?",
    "Async Patterns",
    "MEDIUM",
    `
You need to call three independent services. Compare Promise.all, Promise.allSettled, Promise.race and Promise.any, and say when you would use each.
`,
    `
- Promise.all: resolves with all results in order; rejects as soon as any one rejects. Use when you need every result.
- Promise.allSettled: waits for all and returns objects with status "fulfilled" or "rejected". Use when partial failure is fine (e.g. sending notifications).
- Promise.race: settles with the first promise to settle, success or failure. Classic use: a timeout.
- Promise.any: resolves with the first success; rejects with an AggregateError only if all fail. Use for redundant mirrors.

Running independent calls with Promise.all is faster than awaiting them one after another: total time is roughly the slowest call, not the sum.
`,
  ),
  q(
    "nodejs",
    "How do you handle errors in async/await code in Node.js?",
    "Async Patterns",
    "MEDIUM",
    `
How do you handle errors with async/await? What happens to an unhandled promise rejection in modern Node.js, and what are process.on("uncaughtException") and process.on("unhandledRejection") for?
`,
    `
- Wrap awaits in try/catch, or let errors bubble up to a single central handler (e.g. Express error middleware).
- Always await or return promises; a forgotten await means the error escapes your try/catch.
- Since Node 15, an unhandled rejection crashes the process by default (--unhandled-rejections=throw).
- process.on("unhandledRejection") and process.on("uncaughtException") are last-resort hooks: log the error, then exit and let a process manager restart the app. Do not keep running, because the app may be in an unknown state.
- Distinguish operational errors (bad input, timeout: handle and respond) from programmer bugs (crash and fix).
`,
    { role: "Backend Developer" },
  ),
  q(
    "nodejs",
    "What is EventEmitter and how is it used?",
    "Event Loop",
    "MEDIUM",
    `
Explain the EventEmitter class from the events module. Are listeners called synchronously or asynchronously? Write a small example.
`,
    `
EventEmitter implements the observer pattern: objects emit named events and listeners react. Streams, HTTP servers and sockets all extend it.

\`\`\`js
const EventEmitter = require("events");
class Order extends EventEmitter {}
const order = new Order();
order.on("placed", (id) => console.log("send email for", id));
order.once("placed", () => console.log("first order only"));
order.emit("placed", 42);
\`\`\`

- Listeners run synchronously, in registration order, when emit() is called.
- Emitting "error" with no listener throws, so always add an error listener.
- More than 10 listeners for one event triggers a possible memory leak warning (setMaxListeners changes the limit).
`,
  ),
  q(
    "nodejs",
    "What is the difference between module.exports and exports?",
    "Modules",
    "MEDIUM",
    `
In CommonJS, what is the difference between module.exports and exports? What does a file that requires this module receive?

\`\`\`js
exports.a = 1;
exports = { b: 2 };
\`\`\`
`,
    `
- exports starts as a reference to module.exports; require() always returns module.exports.
- Adding properties (exports.a = 1) mutates the shared object, so it works.
- Reassigning exports = { b: 2 } only rebinds the local variable; module.exports is unchanged.
- So the requiring file receives { a: 1 }.
- To export a single function or class, assign module.exports = fn (not exports = fn).
`,
  ),
  q(
    "nodejs",
    "How do you handle CPU-intensive work in Node.js?",
    "Performance",
    "HARD",
    `
An API endpoint resizes images and computes a heavy report. Under load the whole server stops responding. Why, and what are your options: worker_threads, cluster and child_process? When would you use each?
`,
    `
CPU-heavy JS runs on the main thread and blocks the event loop, so no other request (not even a health check) gets served.

- worker_threads: run JS in parallel threads inside the same process; can share memory (SharedArrayBuffer). Best for CPU work like image processing or hashing; use a pool (e.g. piscina).
- cluster: forks one process per CPU core sharing the same port; scales request handling, but each request is still single-threaded.
- child_process: run separate programs or scripts (spawn, exec, fork); good for calling ffmpeg or Python.
- Other options: move work to a job queue (BullMQ) processed by separate workers, or split long loops into chunks with setImmediate.
- In production, many teams run one process per container and scale horizontally instead of using cluster.
`,
    { role: "Backend Developer" },
  ),
  q(
    "nodejs",
    "What is backpressure in Node.js streams?",
    "Streams",
    "HARD",
    `
What is backpressure? What goes wrong in the code below when the destination is slower than the source, and how do you fix it?

\`\`\`js
readable.on("data", (chunk) => {
  writable.write(chunk);
});
\`\`\`
`,
    `
Backpressure happens when a writable consumes data slower than a readable produces it.

- writable.write() returns false when its internal buffer passes highWaterMark. The code above ignores that, so chunks keep piling up in memory and can exhaust it.
- The correct manual pattern: if write() returns false, call readable.pause() and resume on the writable's "drain" event.
- Simpler and safer: use pipe() or stream.pipeline(), which handle backpressure automatically. pipeline also forwards errors and destroys all streams on failure.

\`\`\`js
const { pipeline } = require("stream/promises");
await pipeline(readable, writable);
\`\`\`
`,
  ),
  q(
    "nodejs",
    "What is the output order inside an I/O callback?",
    "Event Loop",
    "HARD",
    `
What does this CommonJS script print? Explain each step.

\`\`\`js
const fs = require("fs");
fs.readFile(__filename, () => {
  setTimeout(() => console.log("timeout"), 0);
  setImmediate(() => console.log("immediate"));
  process.nextTick(() => console.log("tick"));
  Promise.resolve().then(() => console.log("promise"));
});
\`\`\`
`,
    `
Output: tick, promise, immediate, timeout (always in this order).

- The readFile callback runs in the poll phase.
- When the callback finishes, Node drains the nextTick queue (tick), then the promise microtask queue (promise).
- After the poll phase comes the check phase, so the setImmediate callback runs (immediate).
- The timer is only checked in the timers phase of the next loop iteration (timeout).
- Unlike calling these from the main module, the order here is deterministic, because the check phase always follows poll.
`,
  ),
  q(
    "nodejs",
    "How would you find and fix a memory leak in a Node.js service?",
    "Performance",
    "HARD",
    `
Your Node.js API's memory grows steadily over a few days until the container is killed (OOM). How would you confirm it is a leak, find the cause, and fix it? Name common causes.
`,
    `
Confirm and locate:
- Track heapUsed over time (process.memoryUsage(), APM dashboards); a leak keeps rising even after GC.
- Take heap snapshots (node --inspect + Chrome DevTools, or v8.writeHeapSnapshot()) some minutes apart under load and compare them to see which objects keep growing and what retains them.
- Tools like clinic.js heapprofiler help.

Common causes:
- Global caches or Maps that grow without a limit (use an LRU with max size or TTL).
- Event listeners added per request and never removed.
- Closures capturing large objects; timers (setInterval) never cleared.
- Storing request data in module-level arrays.

Fix the root cause, add a regression check, and set --max-old-space-size to fit the container.
`,
    { role: "Backend Developer" },
  ),
  q(
    "nodejs",
    "What is libuv and which operations use its thread pool?",
    "Event Loop",
    "HARD",
    `
What role does libuv play in Node.js? Which operations go to the libuv thread pool, and why might many concurrent crypto.pbkdf2 calls make file reads slow?
`,
    `
- libuv is the C library that provides Node's event loop and cross-platform async I/O.
- Network I/O uses the OS's non-blocking mechanisms (epoll, kqueue, IOCP), not the thread pool.
- The thread pool (default 4 threads) handles work with no non-blocking OS API: file system calls (fs), dns.lookup, some crypto (pbkdf2, scrypt, randomBytes), and zlib.
- All these share the same 4 threads. If many slow pbkdf2 calls occupy them, fs reads queue behind them, adding latency.
- Fixes: increase UV_THREADPOOL_SIZE (set before the pool is first used; max 1024), limit concurrency, or move heavy hashing to worker threads or a separate service.
`,
  ),

  // ------------------------------------------------------------- expressjs
  q(
    "expressjs",
    "What is Express.js and why use it instead of the http module?",
    "Routing",
    "EASY",
    `
What is Express.js? What does it give you over writing a server with Node's built-in http module? Write a minimal Express server.
`,
    `
Express is a minimal, unopinionated web framework for Node.js.

Over raw http it adds:
- Routing by method and path, with route parameters.
- A middleware pipeline for logging, parsing, auth and errors.
- Helpers such as res.json(), res.status(), res.redirect() and req.query.
- A large ecosystem (cors, helmet, multer, morgan).

\`\`\`js
const express = require("express");
const app = express();
app.use(express.json());
app.get("/health", (req, res) => res.json({ ok: true }));
app.listen(3000, () => console.log("listening on 3000"));
\`\`\`
`,
  ),
  q(
    "expressjs",
    "What is middleware in Express?",
    "Middleware",
    "EASY",
    `
What is middleware in Express? What arguments does a middleware function take, and give examples of built-in and third-party middleware.
`,
    `
Middleware is a function that runs during the request-response cycle with the signature (req, res, next).

It can:
- Read or modify req and res (e.g. attach req.user).
- End the request by sending a response.
- Call next() to pass control to the next middleware, or next(err) to jump to error handlers.

Examples:
- Built-in: express.json(), express.urlencoded(), express.static().
- Third-party: cors, helmet, morgan (logging), cookie-parser.

\`\`\`js
app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});
\`\`\`
`,
  ),
  q(
    "expressjs",
    "What is the difference between app.use and app.get?",
    "Routing",
    "EASY",
    `
What is the difference between app.use("/api", fn) and app.get("/api", fn)? Which requests does each one match?
`,
    `
- app.use mounts middleware for all HTTP methods and matches the path as a prefix: app.use("/api", fn) runs for /api, /api/users, /api/users/5 and so on.
- Inside a mounted middleware, req.url has the mount path stripped (req.baseUrl holds "/api").
- app.get matches only GET (and HEAD) requests, and the path must match exactly (apart from route parameters).
- Use app.use for middleware and routers; use app.get / post / put / delete for endpoint handlers.
`,
  ),
  q(
    "expressjs",
    "What is the difference between req.params, req.query and req.body?",
    "Request Handling",
    "EASY",
    `
For the request below, what are req.params, req.query and req.body for the route app.put("/users/:id", ...)?

\`\`\`
PUT /users/42?notify=true
Content-Type: application/json

{ "name": "Asha" }
\`\`\`
`,
    `
- req.params comes from route parameters: { id: "42" }.
- req.query comes from the query string: { notify: "true" }.
- req.body comes from the request body: { name: "Asha" }, but only if body-parsing middleware such as express.json() is registered; otherwise it is undefined.
- Params and query values are always strings, so convert and validate them (Number(req.params.id)).
- Rule of thumb: params identify a resource, query filters or paginates, body carries data to create or update.
`,
  ),
  q(
    "expressjs",
    "How do you serve static files in Express?",
    "Middleware",
    "EASY",
    `
How do you serve static files such as images, CSS and a built React app from an Express server? How would you serve them under a /static prefix?
`,
    `
Use the built-in express.static middleware:

\`\`\`js
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));
app.use("/static", express.static(path.join(__dirname, "assets")));
\`\`\`

- A file at public/logo.png is served at /logo.png; assets/app.css at /static/app.css.
- Use an absolute path (path.join with __dirname) so it works from any working directory.
- Options like maxAge set caching headers.
- For a single-page app, add a catch-all route after the API routes that sends index.html.
- In production, a CDN or nginx usually serves static files more efficiently.
`,
    { role: "Full Stack Developer" },
  ),
  q(
    "expressjs",
    "What does next() do in Express middleware?",
    "Middleware",
    "EASY",
    `
What does calling next() do? What happens if a middleware neither calls next() nor sends a response? What is the difference between next() and next(err)?
`,
    `
- next() passes control to the next matching middleware or route handler.
- If a middleware neither calls next() nor sends a response, the request hangs until the client times out.
- next(err) skips all remaining normal middleware and goes to the error-handling middleware (functions with 4 arguments).
- next("route") skips the remaining handlers of the current route and moves to the next matching route.
- Do not call next() after sending a response, or a later handler may try to send again.
`,
  ),
  q(
    "expressjs",
    "What is the difference between res.send, res.json and res.end?",
    "Request Handling",
    "EASY",
    `
Compare res.send(), res.json() and res.end(). Which one would you use to return a list of users from an API?
`,
    `
- res.send(body): sends strings, Buffers or objects; sets Content-Type based on the type (text/html for strings) and adds ETag and Content-Length.
- res.json(obj): converts the value with JSON.stringify and sets Content-Type: application/json. Also works for null and numbers, so it is the clear choice for APIs.
- res.end(): Node's low-level method; ends the response with no extra headers. Use it when there is no body, e.g. res.status(204).end().
- For a list of users: res.status(200).json(users).
- Each request must get exactly one response.
`,
  ),
  q(
    "expressjs",
    "How do you write error-handling middleware in Express?",
    "Error Handling",
    "MEDIUM",
    `
How do you write a central error handler in Express? Where must it be registered, and how does Express recognise it? Show an example that returns JSON.
`,
    `
An error handler has four parameters (err, req, res, next); Express identifies it by the argument count. Register it after all routes.

\`\`\`js
class AppError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

app.use((err, req, res, next) => {
  const status = err.status ?? 500;
  if (status >= 500) console.error(err);
  res.status(status).json({
    error: status >= 500 ? "Internal server error" : err.message,
  });
});
\`\`\`

- Route handlers call next(err) or throw (in sync code).
- Do not leak stack traces to clients in production.
- Add a 404 handler (normal middleware) just before the error handler.
`,
    { role: "Backend Developer" },
  ),
  q(
    "expressjs",
    "How do you handle errors thrown in async route handlers?",
    "Error Handling",
    "MEDIUM",
    `
In Express 4, what happens if an async handler like this throws, and how do you fix it? What changed in Express 5?

\`\`\`js
app.get("/users/:id", async (req, res) => {
  const user = await User.findById(req.params.id); // may throw
  res.json(user);
});
\`\`\`
`,
    `
- In Express 4, a rejected promise from an async handler is not caught. The error handler never runs, the request hangs, and Node reports an unhandled rejection (which can crash the process).
- Fix 1: try/catch and call next(err).
- Fix 2: a wrapper that forwards rejections (or the express-async-errors package):

\`\`\`js
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

app.get("/users/:id", asyncHandler(async (req, res) => { /* ... */ }));
\`\`\`

- Express 5 handles this natively: rejected promises from handlers and middleware are passed to next(err) automatically.
`,
    { role: "Backend Developer" },
  ),
  q(
    "expressjs",
    "What is express.Router and why use it?",
    "Routing",
    "MEDIUM",
    `
What is express.Router()? Show how you would split user and order routes into separate files and mount them under /api/users and /api/orders.
`,
    `
A Router is a mini-app with its own middleware and routes, which you mount on a path. It keeps large apps modular.

\`\`\`js
// routes/users.js
const router = require("express").Router();
router.get("/", listUsers);        // GET /api/users
router.get("/:id", getUser);       // GET /api/users/:id
router.post("/", requireAuth, createUser);
module.exports = router;

// app.js
app.use("/api/users", require("./routes/users"));
app.use("/api/orders", require("./routes/orders"));
\`\`\`

- Middleware added with router.use only applies to that router.
- Use Router({ mergeParams: true }) to read parent route params in nested routers.
`,
  ),
  q(
    "expressjs",
    "Why does middleware order matter in Express?",
    "Middleware",
    "MEDIUM",
    `
A developer reports that req.body is undefined in a POST handler and that the auth check is not applied to some routes. The app looks like this. What is wrong?

\`\`\`js
app.post("/api/orders", createOrder);
app.use(express.json());
app.get("/api/public", publicInfo);
app.use(requireAuth);
app.get("/api/profile", profile);
\`\`\`
`,
    `
Express runs middleware and routes in the order they are registered.

- POST /api/orders is matched before express.json() is registered, so the body is never parsed and req.body is undefined. Move express.json() to the top.
- requireAuth only protects routes registered after it. Here /api/public is public (probably intended) and /api/profile is protected.
- Typical order: security headers and CORS, body parsers, logging, public routes, auth, protected routes, 404 handler, error handler.
- Tip: attach auth per router or per route (router.use(requireAuth)) to make protection explicit.
`,
  ),
  q(
    "expressjs",
    "How do you enable CORS in an Express API?",
    "Security",
    "MEDIUM",
    `
Your React app on http://localhost:5173 calls an Express API on http://localhost:3000 and the browser shows a CORS error. Why, and how do you configure CORS correctly, including cookies?
`,
    `
- The browser's same-origin policy blocks reading responses from a different origin (scheme, host or port). The API must opt in with CORS headers.
- Use the cors middleware with an explicit allow-list:

\`\`\`js
const cors = require("cors");
app.use(cors({
  origin: ["http://localhost:5173", "https://app.example.com"],
  credentials: true,
}));
\`\`\`

- With credentials (cookies), Access-Control-Allow-Origin cannot be "*"; it must echo a specific origin, and the frontend must send credentials: "include".
- Non-simple requests (e.g. JSON with PUT) trigger an OPTIONS preflight, which the middleware answers.
- CORS is enforced by browsers only; it is not an auth mechanism.
`,
    { role: "Full Stack Developer" },
  ),
  q(
    "expressjs",
    "How do you validate request bodies in Express?",
    "Request Handling",
    "MEDIUM",
    `
How would you validate the body of POST /api/users (name required, valid email, age 18-60) and return a clear 400 error? Why not trust the frontend's validation?
`,
    `
Never trust client input: anyone can call the API directly with curl or Postman.

Use a schema library (zod, Joi, express-validator) in a reusable middleware:

\`\`\`js
const { z } = require("zod");
const createUser = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().int().min(18).max(60),
});

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.issues });
  }
  req.body = result.data; // parsed, unknown keys stripped
  next();
};

app.post("/api/users", validate(createUser), handler);
\`\`\`
`,
    { role: "Backend Developer" },
  ),
  q(
    "expressjs",
    "How would you implement JWT authentication middleware in Express?",
    "Security",
    "MEDIUM",
    `
Write a middleware that protects routes using a JWT sent as "Authorization: Bearer <token>". What should it return when the token is missing, invalid or expired?
`,
    `
\`\`\`js
const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const header = req.headers.authorization ?? "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Missing token" });
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
\`\`\`

- Missing, invalid or expired token: 401. Valid token but not allowed (wrong role): 403.
- Keep the secret in env, pin the algorithm, keep access tokens short-lived and use refresh tokens.
`,
    { role: "Backend Developer" },
  ),
  q(
    "expressjs",
    "How do you add rate limiting and security headers to an Express app?",
    "Security",
    "MEDIUM",
    `
A login endpoint is being hit by brute-force attempts. How would you rate-limit it, and what other basic hardening would you add to an Express app?
`,
    `
Rate limiting with express-rate-limit:

\`\`\`js
const rateLimit = require("express-rate-limit");
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 5 });
app.post("/api/login", loginLimiter, login);
\`\`\`

- Exceeding the limit returns 429 Too Many Requests.
- With several instances, use a shared store (Redis) so limits apply across servers.
- Behind a proxy or load balancer, set app.set("trust proxy", 1) so the client IP is read correctly.

Other hardening:
- helmet() for security headers; app.disable("x-powered-by").
- Body size limits: express.json({ limit: "100kb" }).
- Input validation, HTTPS, hashed passwords (bcrypt), and parameterised queries.
`,
  ),
  q(
    "expressjs",
    "How would you structure a large Express application?",
    "Production",
    "HARD",
    `
Your Express project started as one 2,000-line app.js. How would you restructure it so a team of developers can work on it, and test it easily?
`,
    `
Split by layer and by feature (module):

- Routes / controllers: parse the request, call a service, send the response. No business logic.
- Services: business rules, independent of Express (easy to unit test).
- Data access (repositories or models): database queries only.
- Middleware: auth, validation, error handling, logging.
- Config: env loading and validation in one place.

\`\`\`
src/
  modules/users/  users.routes.js  users.controller.js  users.service.js  users.schema.js
  modules/orders/ ...
  middleware/  config/  app.js  server.js
\`\`\`

- app.js builds the app (exported for supertest); server.js calls listen.
- Central error handler, consistent response format, and dependency injection for testability.
`,
    { role: "Backend Developer" },
  ),
  q(
    "expressjs",
    "How do you gracefully shut down an Express server?",
    "Production",
    "HARD",
    `
During deployment, Kubernetes sends SIGTERM to your Express pod. In-flight requests are getting cut off and database connections are left open. How do you implement a graceful shutdown?
`,
    `
\`\`\`js
const server = app.listen(PORT);

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down");
  server.close(async () => {          // stop accepting, wait for in-flight
    await mongoose.connection.close();  // release DB, queues, caches
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref(); // force exit
});
\`\`\`

- server.close() stops new connections and calls back when existing ones finish.
- Keep-alive connections can hold it open; Node 18.2+ has server.closeIdleConnections().
- Fail the readiness probe first so the load balancer stops sending traffic.
- Keep the forced timeout below the platform's grace period (30 s by default in Kubernetes).
`,
    { role: "Backend Developer" },
  ),
  q(
    "expressjs",
    "How do you handle file uploads securely in Express?",
    "Security",
    "HARD",
    `
Users must upload a profile photo (JPEG/PNG, max 2 MB). How would you implement this in Express, and what security risks must you handle?
`,
    `
Use multer (multipart/form-data parsing):

\`\`\`js
const multer = require("multer");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    cb(null, ["image/jpeg", "image/png"].includes(file.mimetype)),
});
app.post("/api/me/avatar", requireAuth, upload.single("avatar"), saveAvatar);
\`\`\`

Risks and mitigations:
- Size limits to prevent disk or memory exhaustion.
- Mimetype and extension come from the client and can be faked; check the file's magic bytes or re-encode the image (e.g. with sharp).
- Never use the original filename on disk (path traversal); generate a random name.
- Store in object storage (S3) rather than the app server, serve from a separate domain, and scan for malware if needed.
`,
    { role: "Backend Developer" },
  ),
  q(
    "expressjs",
    "Why does 'Cannot set headers after they are sent' occur?",
    "Error Handling",
    "HARD",
    `
This handler sometimes crashes with "Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client". Find the bugs and explain the general rule.

\`\`\`js
app.get("/users/:id", async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) res.status(404).json({ error: "Not found" });
  res.json(user);
  next();
});
\`\`\`
`,
    `
The error means the code tried to send a second response (or set headers) after the first was sent.

Bugs:
- No return after the 404 response, so execution continues to res.json(user), a second response.
- next() after res.json passes control to later middleware (e.g. the 404 handler), which tries to respond again.
- No error handling: a rejected findById is not forwarded (in Express 4).

\`\`\`js
app.get("/users/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "Not found" });
    return res.json(user);
  } catch (err) {
    next(err);
  }
});
\`\`\`

Rule: exactly one response per request; return when you respond. res.headersSent can be checked in error handlers.
`,
  ),
  q(
    "expressjs",
    "How do you scale an Express app across cores and servers?",
    "Production",
    "HARD",
    `
Your Express API runs as one Node process on an 8-core machine and is struggling with traffic. How do you scale it vertically and horizontally, and what breaks when you add more instances?
`,
    `
Vertical (one machine):
- Run one process per core with the cluster module or PM2 (pm2 start app.js -i max).

Horizontal (many machines or containers):
- Run several instances behind a load balancer (nginx, cloud LB, Kubernetes service).

What breaks with multiple instances, and the fixes:
- In-memory sessions: users get logged out when they hit another instance. Use JWTs or a shared session store (Redis).
- In-memory caches and rate limits become per-instance. Move them to Redis.
- Uploaded files on local disk. Use object storage (S3).
- WebSockets need sticky sessions or a pub/sub adapter.
- Cron jobs run once per instance. Use a single scheduler or a job queue.

Keep the app stateless, add health checks, and also profile before scaling (slow queries are often the real bottleneck).
`,
    { role: "Backend Developer" },
  ),

  // ------------------------------------------------------------- rest-apis
  q(
    "rest-apis",
    "What is REST and what are its main constraints?",
    "REST Principles",
    "EASY",
    `
What does REST stand for? List its architectural constraints and explain what makes an API "RESTful".
`,
    `
REST (Representational State Transfer) is an architectural style for networked APIs, described by Roy Fielding.

Constraints:
- Client-server: UI and data storage are separated.
- Stateless: each request carries everything needed; the server keeps no client session between requests.
- Cacheable: responses say whether they can be cached.
- Uniform interface: resources identified by URLs, manipulated through representations (usually JSON) using standard HTTP methods.
- Layered system: proxies, gateways and load balancers can sit in between transparently.
- Code on demand (optional): the server can send executable code.

In practice a RESTful API models nouns as resources (/users/42), uses HTTP methods for actions, and returns proper status codes.
`,
  ),
  q(
    "rest-apis",
    "What is the difference between GET and POST?",
    "HTTP Methods",
    "EASY",
    `
Compare the HTTP GET and POST methods: purpose, where data goes, safety, idempotency and caching.
`,
    `
- GET retrieves data; POST submits data to create a resource or trigger processing.
- GET sends parameters in the URL query string; POST sends data in the request body.
- GET is safe (no side effects) and idempotent; POST is neither: repeating it may create duplicates.
- GET responses can be cached and bookmarked; POST responses usually are not.
- URLs have practical length limits and appear in logs and browser history, so never put passwords or tokens in a GET query string.
- Both are encrypted under HTTPS; POST is not "more secure" by itself.
`,
  ),
  q(
    "rest-apis",
    "What is the difference between PUT and PATCH?",
    "HTTP Methods",
    "EASY",
    `
A user resource is { "name": "Ravi", "email": "ravi@x.com", "city": "Pune" }. What happens if a client sends PUT /users/7 with { "city": "Delhi" } versus PATCH /users/7 with the same body?
`,
    `
- PUT replaces the whole resource with the request body. Strictly, PUT /users/7 with { "city": "Delhi" } leaves a user with only a city (name and email removed or set to defaults), so clients must send the full object.
- PATCH applies a partial update: only city changes; name and email stay the same.
- PUT is idempotent: sending the same request twice gives the same state.
- PATCH is not guaranteed idempotent (e.g. a patch like "increment count by 1"), though simple field updates usually are.
- PUT can also create a resource at a client-chosen URL.
`,
  ),
  q(
    "rest-apis",
    "What do the common HTTP status codes mean?",
    "Status Codes",
    "EASY",
    `
Explain the status code classes (1xx to 5xx) and when an API should return 200, 201, 204, 400, 404, 409 and 500.
`,
    `
Classes: 1xx informational, 2xx success, 3xx redirection, 4xx client error, 5xx server error.

- 200 OK: successful GET, or PUT/PATCH returning data.
- 201 Created: POST created a resource; include a Location header with its URL.
- 204 No Content: success with no body, e.g. DELETE.
- 400 Bad Request: malformed input or failed validation (some APIs use 422 for validation).
- 404 Not Found: the resource does not exist.
- 409 Conflict: the request conflicts with current state, e.g. email already registered.
- 500 Internal Server Error: an unexpected bug on the server.

Never return 200 with { "error": ... } in the body; the status code should tell the truth.
`,
  ),
  q(
    "rest-apis",
    "What does it mean that REST APIs are stateless?",
    "REST Principles",
    "EASY",
    `
What does "stateless" mean for a REST API? If the server does not remember the client, how does a logged-in user stay authenticated?
`,
    `
- Stateless means each request contains all information needed to process it; the server does not rely on stored context from previous requests.
- Authentication is sent with every request, e.g. a JWT in the Authorization header, or a session cookie looked up in a shared store.
- Pagination state goes in the request too (page or cursor parameters).
- Benefits: any server instance can handle any request, so horizontal scaling and load balancing are easy; failures are simpler to recover from.
- Note: the application still stores data (in a database); "stateless" is about conversation state between requests.
`,
  ),
  q(
    "rest-apis",
    "What is the difference between 401 and 403?",
    "Status Codes",
    "EASY",
    `
When should an API return 401 Unauthorized and when 403 Forbidden? Give an example of each.
`,
    `
- 401 Unauthorized actually means unauthenticated: the request has no valid credentials (missing, invalid or expired token). The client should log in or refresh the token. It is usually sent with a WWW-Authenticate header.
- 403 Forbidden: the user is authenticated, but is not allowed to do this. Logging in again will not help.
- Example 401: calling GET /api/orders without a token.
- Example 403: a normal user calling DELETE /api/admin/users/5.
- Some APIs return 404 instead of 403 to avoid revealing that a resource exists.
`,
  ),
  q(
    "rest-apis",
    "How should you name REST API endpoints?",
    "Design",
    "EASY",
    `
Review these endpoints and suggest better RESTful names:

\`\`\`
GET  /getAllUsers
POST /createUser
POST /deleteUser?id=5
GET  /user/5/getOrders
\`\`\`
`,
    `
Use nouns for resources and let the HTTP method express the action:

\`\`\`
GET    /users            list users
POST   /users            create a user
DELETE /users/5          delete user 5
GET    /users/5/orders   orders of user 5
\`\`\`

Guidelines:
- Plural nouns for collections (/users), an id for one item (/users/5).
- No verbs in paths; lowercase, hyphens for multi-word names (/order-items).
- Nest only for clear ownership and keep it shallow (one level).
- Filters, sorting and pagination go in the query string: /users?role=admin&sort=-createdAt&page=2.
`,
    { role: "Backend Developer" },
  ),
  q(
    "rest-apis",
    "What is idempotency and which HTTP methods are idempotent?",
    "HTTP Methods",
    "MEDIUM",
    `
What does idempotent mean for an HTTP method? Which methods are idempotent and which are safe? Why does it matter when a mobile client retries a request on a flaky network?
`,
    `
- Idempotent: making the same request once or many times leaves the server in the same state. The response may differ (e.g. a second DELETE returns 404).
- Safe: no side effects at all (read-only).
- Safe and idempotent: GET, HEAD, OPTIONS.
- Idempotent but not safe: PUT, DELETE.
- Neither: POST. PATCH is not guaranteed to be idempotent.
- Why it matters: if a response is lost, the client cannot know whether the request succeeded. Idempotent requests can be retried safely; retrying a POST could create two orders or charge twice, so POST needs an idempotency key or deduplication.
`,
    { role: "Backend Developer" },
  ),
  q(
    "rest-apis",
    "How do you implement pagination: offset versus cursor?",
    "Design",
    "MEDIUM",
    `
GET /posts returns millions of posts. Compare offset-based pagination (?page=3&limit=20) with cursor-based pagination (?after=<cursor>&limit=20). What are the trade-offs and what should the response look like?
`,
    `
Offset (LIMIT 20 OFFSET 40):
- Simple, supports jumping to page N and showing total pages.
- Gets slower for deep pages (the database still scans and skips the offset rows).
- Items shift if rows are inserted or deleted, causing duplicates or gaps.

Cursor (keyset): WHERE (created_at, id) < (cursor values) ORDER BY created_at DESC, id DESC LIMIT 20:
- Fast at any depth with an index; stable while data changes. Ideal for feeds and infinite scroll.
- Cannot jump to an arbitrary page; the cursor is usually an opaque encoded value of the last item's sort keys.

Example response:
\`\`\`json
{ "data": [], "nextCursor": "eyJpZCI6MTIzfQ", "hasMore": true }
\`\`\`
Always cap limit (e.g. max 100).
`,
    { role: "Backend Developer" },
  ),
  q(
    "rest-apis",
    "How do you version a REST API?",
    "Design",
    "MEDIUM",
    `
You need to make a breaking change to the response format of GET /users. How do you version the API so existing mobile apps keep working? Compare the common approaches.
`,
    `
Approaches:
- URL path: /api/v1/users, /api/v2/users. Most common, explicit, easy to route and cache.
- Query parameter: /users?version=2. Easy but clutters URLs.
- Header: Accept: application/vnd.example.v2+json or a custom header. Clean URLs, but harder to test in a browser and to cache.

Good practice:
- Only bump the major version for breaking changes (removing or renaming fields, changing types). Adding optional fields is non-breaking.
- Run old and new versions side by side, announce a deprecation timeline (Deprecation / Sunset headers), and monitor usage of the old version before removing it.
- Mobile apps update slowly, so support old versions for months.
`,
  ),
  q(
    "rest-apis",
    "What is the difference between REST and GraphQL?",
    "REST Principles",
    "MEDIUM",
    `
Compare REST and GraphQL. What problems does GraphQL solve, and when would you still choose REST?
`,
    `
- REST: many endpoints, one per resource; the server decides the response shape. GraphQL: usually one endpoint (/graphql); the client sends a query naming exactly the fields it wants.
- GraphQL solves over-fetching (getting fields you do not need) and under-fetching (many round trips, e.g. user, then posts, then comments).
- GraphQL has a strongly typed schema with introspection; REST often uses OpenAPI for this.
- REST benefits: simple HTTP caching (GET by URL), status codes, easier rate limiting and file uploads, and a smaller learning curve.
- GraphQL costs: N+1 query problems (solved with DataLoader), query complexity limits, caching is harder.
- Choose REST for simple CRUD and public APIs; GraphQL when many clients need different data shapes.
`,
    { role: "Full Stack Developer" },
  ),
  q(
    "rest-apis",
    "How does HTTP caching work with Cache-Control and ETag?",
    "Performance",
    "MEDIUM",
    `
Explain how an API can use Cache-Control, ETag and If-None-Match to reduce load. What happens step by step when a client requests GET /products/10 twice?
`,
    `
- Cache-Control controls who caches and for how long: max-age=60 (fresh for 60 s), private (browser only), public (CDNs too), no-store (never cache), no-cache (cache, but revalidate before use).
- ETag is a version identifier of the response (e.g. a hash of the body).

Flow:
1. First GET: server returns 200 with the body, ETag: "abc123" and Cache-Control: max-age=60.
2. Within 60 s, the client uses its cached copy without any request.
3. After that, the client sends If-None-Match: "abc123".
4. If unchanged, the server replies 304 Not Modified with no body (saves bandwidth); if changed, 200 with the new body and ETag.

Never cache user-specific data as public. Last-Modified / If-Modified-Since is the date-based alternative.
`,
  ),
  q(
    "rest-apis",
    "What is the difference between session-based and token-based authentication?",
    "Security",
    "MEDIUM",
    `
Compare session-based authentication (session id in a cookie) with token-based authentication (JWT) for a REST API. What are the pros and cons, and where should a web app store a JWT?
`,
    `
Sessions:
- Server stores session data (memory, Redis, DB); the client holds only a random session id in a cookie.
- Easy to revoke (delete the session); needs a shared store when scaled out.

JWT:
- A signed token (header.payload.signature) containing claims like user id and expiry; the server verifies the signature without a lookup.
- Stateless and good for multiple services or mobile clients, but hard to revoke before expiry, so keep access tokens short-lived (e.g. 15 min) with refresh tokens.
- The payload is only base64-encoded, not encrypted: never put secrets in it.

Storage in browsers: an httpOnly, Secure, SameSite cookie protects against XSS reading the token (add CSRF protection); localStorage is readable by any injected script.
`,
    { role: "Full Stack Developer" },
  ),
  q(
    "rest-apis",
    "What is CORS and what is a preflight request?",
    "Security",
    "MEDIUM",
    `
What is CORS? Which requests trigger a preflight, what does the preflight look like, and which response headers must the API send?
`,
    `
CORS (Cross-Origin Resource Sharing) lets a server tell browsers which other origins may read its responses; by default the same-origin policy blocks cross-origin reads.

Preflight: for non-simple requests (methods other than GET/HEAD/POST, custom headers such as Authorization, or Content-Type: application/json), the browser first sends:
\`\`\`
OPTIONS /api/orders
Origin: https://app.example.com
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: authorization, content-type
\`\`\`

The server answers with:
- Access-Control-Allow-Origin: https://app.example.com
- Access-Control-Allow-Methods and Access-Control-Allow-Headers
- Access-Control-Allow-Credentials: true (if cookies are used)
- Access-Control-Max-Age to cache the preflight.

CORS is a browser rule only; it does not protect the API from curl or servers.
`,
  ),
  q(
    "rest-apis",
    "How should a REST API format its error responses?",
    "Design",
    "MEDIUM",
    `
Design a consistent error response format for an API. Show examples for a validation error and for "email already exists". What should never appear in an error response?
`,
    `
Use the right status code plus a consistent JSON body (RFC 9457 "problem details" is a standard option):

\`\`\`json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Some fields are invalid",
    "details": [{ "field": "email", "message": "Must be a valid email" }],
    "requestId": "a1b2c3"
  }
}
\`\`\`

- Validation error: 400 (or 422) with field-level details.
- Email already exists: 409 with code "EMAIL_TAKEN".
- A stable machine-readable code lets the frontend react without parsing messages.
- A requestId lets support find the server logs.
- Never expose stack traces, SQL errors, internal hostnames or secrets; log them on the server instead.
`,
    { role: "Backend Developer" },
  ),
  q(
    "rest-apis",
    "How do you make a payment API safe to retry?",
    "Design",
    "HARD",
    `
A mobile app calls POST /payments. Sometimes the network drops after the server charged the card, the app retries, and the customer is charged twice. Design the API so retries are safe.
`,
    `
Use an idempotency key:
- The client generates a unique key (UUID) per logical payment and sends it in a header: Idempotency-Key: 3f2a... Retries reuse the same key.
- The server stores the key (scoped to the user) with the request hash, status and response, under a unique constraint.
- First request: insert the key as "in progress", process the payment, save the response.
- Repeat with the same key: return the saved response instead of charging again. If still in progress, return 409 (or wait). Same key with a different body: return 422.
- Expire keys after a period (e.g. 24 hours).

Also:
- Pass the same key to the payment gateway, which typically supports idempotency itself.
- Do the database writes in a transaction; use a unique order or payment reference as a second guard.
`,
    { role: "Backend Developer" },
  ),
  q(
    "rest-apis",
    "How would you implement rate limiting for a public API?",
    "Performance",
    "HARD",
    `
Your public API must allow each API key 100 requests per minute across 10 server instances. Which rate-limiting algorithms exist, how would you implement one, and what should clients see when limited?
`,
    `
Algorithms:
- Fixed window: count per key per minute. Simple, but allows bursts at window edges (up to 200 in 2 seconds around the boundary).
- Sliding window log or sliding window counter: smoother, more accurate.
- Token bucket: tokens refill at a steady rate up to a capacity; each request takes one. Allows controlled bursts and is widely used.
- Leaky bucket: processes requests at a constant rate.

Implementation across instances: keep counters in Redis, shared by all servers, and update atomically (INCR with EXPIRE, or a Lua script for a token bucket).

Client experience:
- Return 429 Too Many Requests with a Retry-After header.
- Send limit headers such as RateLimit-Limit, RateLimit-Remaining and RateLimit-Reset.
- Apply different limits per plan or endpoint (stricter on login), and also limit at the gateway or CDN.
`,
    { role: "Backend Developer" },
  ),
  q(
    "rest-apis",
    "Design the REST endpoints for an e-commerce orders module.",
    "Design",
    "HARD",
    `
Design the REST API for orders in an e-commerce app: customers place orders from their cart, view their orders, and cancel an order; admins update the shipping status. List endpoints, methods, status codes and how you model "cancel".
`,
    `
\`\`\`
POST   /orders                      create from cart       201 + Location
GET    /orders?status=SHIPPED&cursor=...  my orders (paginated)  200
GET    /orders/{id}                 order detail           200 / 404
POST   /orders/{id}/cancellation    cancel                 200 / 409
PATCH  /admin/orders/{id}           { "status": "SHIPPED" } 200 / 403
GET    /orders/{id}/items           line items             200
\`\`\`

Design points:
- "Cancel" is a state transition, not a delete: model it as a sub-resource (or PATCH status) and keep the order for history.
- Enforce valid transitions on the server (PLACED to CANCELLED allowed, DELIVERED to CANCELLED returns 409).
- Customers only see their own orders (check ownership: return 404 or 403 otherwise).
- POST /orders accepts an Idempotency-Key; prices are recalculated on the server, never trusted from the client.
- Prices in integer paise to avoid float errors.
`,
    { role: "Backend Developer" },
  ),
  q(
    "rest-apis",
    "How do you design an API for long-running operations?",
    "Performance",
    "HARD",
    `
POST /reports generates a report that takes about 3 minutes. Clients time out after 30 seconds. How do you design the API?
`,
    `
Make it asynchronous:
- POST /reports validates input, creates a job and returns 202 Accepted immediately, with a Location header pointing to the job: /reports/jobs/123.
- A background worker (queue such as BullMQ, RabbitMQ or SQS) generates the report.
- GET /reports/jobs/123 returns the status: { "status": "PENDING" | "RUNNING" | "DONE" | "FAILED", "progress": 40 }. When done, it links to the result, e.g. a download URL.

Notification options:
- Polling with a Retry-After hint (simplest).
- Webhooks to a client-registered URL (server-to-server), signed so the receiver can verify them.
- WebSockets or Server-Sent Events for live progress in a browser.

Also: make job creation idempotent, store results with an expiry, and retry failed jobs with backoff.
`,
  ),
  q(
    "rest-apis",
    "What are the most common REST API security vulnerabilities?",
    "Security",
    "HARD",
    `
GET /api/invoices/1043 returns invoice 1043 to any logged-in user who changes the number in the URL. What is this vulnerability called? Name other common API security issues and how to prevent them.
`,
    `
This is Broken Object Level Authorization (BOLA, also called IDOR), number one in the OWASP API Security Top 10. Fix: check on every request that the resource belongs to (or is shared with) the caller, e.g. WHERE id = ? AND user_id = ?. Random UUIDs reduce guessing but are not a fix on their own.

Other common issues:
- Broken authentication: weak tokens, no expiry, no brute-force protection.
- Mass assignment / excessive data exposure: binding the whole request body (a user sets "role": "admin"), or returning internal fields. Whitelist inputs and outputs.
- Broken function-level authorization: admin endpoints callable by normal users.
- No rate limiting: brute force and resource exhaustion.
- Injection (SQL, NoSQL): use parameterised queries and validation.
- Security misconfiguration: verbose errors, permissive CORS, missing HTTPS.
`,
    { role: "Backend Developer" },
  ),

  // --------------------------------------------------------------- mongodb
  q(
    "mongodb",
    "What is MongoDB and how is it different from a SQL database?",
    "Basics",
    "EASY",
    `
What is MongoDB? Compare it with a relational database such as MySQL: data model, schema, relationships and scaling. Map the terms table, row and column to MongoDB.
`,
    `
MongoDB is a document-oriented NoSQL database that stores JSON-like documents (BSON).

- Terms: table = collection, row = document, column = field, primary key = _id.
- Schema: flexible; documents in one collection can have different fields (validation is optional). SQL enforces a fixed schema.
- Relationships: data often embedded in one document; joins are possible with $lookup but used less than in SQL.
- Scaling: built-in replication (replica sets) and horizontal scaling (sharding).
- Transactions: single-document operations are atomic; multi-document ACID transactions are supported since 4.0.
- Good for rapidly changing schemas, nested data and high write volume; SQL is often better for complex joins and strongly relational data.
`,
  ),
  q(
    "mongodb",
    "What is BSON and why does MongoDB use it?",
    "Basics",
    "EASY",
    `
MongoDB documents look like JSON but are stored as BSON. What is BSON, and what advantages does it have over plain JSON?
`,
    `
- BSON (Binary JSON) is a binary-encoded serialisation of JSON-like documents.
- Extra types: ObjectId, Date, 32/64-bit integers, Decimal128, binary data, and more. JSON only has string, number, boolean, null, array and object.
- Faster to traverse: lengths are stored with fields, so the database can skip over parts without parsing everything.
- Supports precise types, e.g. Decimal128 for money and real Date objects for range queries.
- The maximum BSON document size is 16 MB; larger files go in GridFS or object storage.
`,
  ),
  q(
    "mongodb",
    "What is _id and what does an ObjectId contain?",
    "Basics",
    "EASY",
    `
Every MongoDB document has an _id field. What are its rules, and what information is inside a default ObjectId?
`,
    `
- _id is the primary key: required, unique within the collection, immutable, and automatically indexed.
- If you do not supply one, the driver generates an ObjectId.
- An ObjectId is 12 bytes (24 hex characters): a 4-byte timestamp (seconds since the Unix epoch), a 5-byte random value unique to the machine and process, and a 3-byte incrementing counter.
- So ObjectIds are roughly ordered by creation time, and you can get the creation time with ObjectId.getTimestamp().
- _id can be any type except an array, e.g. a string or a compound object, if you have a natural key.
`,
  ),
  q(
    "mongodb",
    "How do you query documents with comparison operators?",
    "Queries",
    "EASY",
    `
A students collection has documents like { name, branch, cgpa, skills: [] }. Write queries to find:
1. CSE students with cgpa greater than 8.
2. Students from CSE or ECE.
3. Students who know "nodejs".
`,
    `
\`\`\`js
// 1. AND is implicit when fields are listed together
db.students.find({ branch: "CSE", cgpa: { $gt: 8 } });

// 2. $in matches any value in the list
db.students.find({ branch: { $in: ["CSE", "ECE"] } });

// 3. Querying an array field matches if any element equals the value
db.students.find({ skills: "nodejs" });
\`\`\`

- Other operators: $gte, $lt, $lte, $ne, $nin, $or, $and, $exists, $regex.
- For "knows both nodejs and react", use { skills: { $all: ["nodejs", "react"] } }.
- Add .sort({ cgpa: -1 }).limit(10) for the top 10.
`,
  ),
  q(
    "mongodb",
    "How do you update documents with $set, $inc and $push?",
    "Queries",
    "EASY",
    `
For a document { _id: 1, name: "Asha", points: 10, badges: [] }, write update statements to change the name, add 5 points, and add the badge "streak-7". What happens if you call updateOne with a plain object instead of operators?
`,
    `
\`\`\`js
db.users.updateOne(
  { _id: 1 },
  {
    $set: { name: "Asha K" },
    $inc: { points: 5 },
    $push: { badges: "streak-7" },
  }
);
\`\`\`

- $set changes or adds fields; $unset removes them; $inc adds atomically (no read-modify-write race).
- $push appends to an array; $addToSet appends only if not already present; $pull removes matching elements.
- updateOne requires update operators (or a pipeline); a plain object throws an error. replaceOne replaces the whole document (except _id).
- updateMany updates all matches; { upsert: true } inserts if none match.
`,
  ),
  q(
    "mongodb",
    "What is Mongoose and why use it with MongoDB?",
    "Basics",
    "EASY",
    `
What is Mongoose? What does it add on top of the official MongoDB Node.js driver? Show a simple schema and model.
`,
    `
Mongoose is an ODM (Object Data Modelling) library for MongoDB in Node.js.

It adds:
- Schemas with types, defaults and validation (required, min, enum, unique index).
- Models with query helpers, plus middleware (pre/post hooks such as hashing a password before save).
- populate() for references, virtuals, and timestamps.

\`\`\`js
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    role: { type: String, enum: ["student", "admin"], default: "student" },
  },
  { timestamps: true }
);
const User = mongoose.model("User", userSchema);
\`\`\`

Note: unique creates an index; it is not a validator.
`,
  ),
  q(
    "mongodb",
    "What is a projection in MongoDB?",
    "Queries",
    "EASY",
    `
What is a projection? Write a query that returns only name and email of active users, without _id. Can you mix inclusion and exclusion in one projection?
`,
    `
A projection chooses which fields are returned, reducing network transfer and memory.

\`\`\`js
db.users.find({ active: true }, { name: 1, email: 1, _id: 0 });
\`\`\`

- 1 includes a field, 0 excludes it. _id is included by default unless you set _id: 0.
- You cannot mix inclusion and exclusion in one projection, except for _id.
- Exclusion example: { password: 0 } returns everything except password.
- In Mongoose: User.find({ active: true }).select("name email -_id").
- If the index contains all filtered and projected fields, the query can be "covered" and answered from the index alone.
`,
  ),
  q(
    "mongodb",
    "How do indexes work in MongoDB and what is a compound index?",
    "Indexing",
    "MEDIUM",
    `
What is an index? For the frequent query below, which index would you create and why does field order matter?

\`\`\`js
db.orders.find({ userId: 7, status: "PAID" }).sort({ createdAt: -1 });
\`\`\`
`,
    `
- An index is a B-tree of field values pointing to documents; without one, MongoDB does a collection scan (COLLSCAN) of every document.
- A compound index covers several fields; order matters because it can be used for any prefix of the fields.
- Follow the ESR rule: Equality fields first, then Sort fields, then Range fields.

\`\`\`js
db.orders.createIndex({ userId: 1, status: 1, createdAt: -1 });
\`\`\`

- This serves the filter and returns results already sorted, avoiding an in-memory sort.
- It also supports queries on userId alone, or userId + status.
- Trade-offs: each index uses memory and slows writes; do not index every field.
`,
    { role: "Backend Developer" },
  ),
  q(
    "mongodb",
    "Explain the MongoDB aggregation pipeline.",
    "Aggregation",
    "MEDIUM",
    `
What is the aggregation pipeline? Using an orders collection { customerId, amount, status }, write a pipeline to find total amount and order count per customer for PAID orders, sorted by total descending.
`,
    `
The pipeline passes documents through stages, each transforming the stream (like a Unix pipe).

\`\`\`js
db.orders.aggregate([
  { $match: { status: "PAID" } },
  { $group: { _id: "$customerId", total: { $sum: "$amount" }, orders: { $sum: 1 } } },
  { $sort: { total: -1 } },
]);
\`\`\`

- $match filters (put it first so it can use indexes and reduces documents early).
- $group groups by _id with accumulators ($sum, $avg, $min, $max, $push).
- Other stages: $project, $lookup, $unwind, $limit, $skip, $addFields, $facet.
- Each stage has a 100 MB memory limit unless allowDiskUse is enabled.
`,
    { role: "Backend Developer" },
  ),
  q(
    "mongodb",
    "When should you embed documents and when should you reference them?",
    "Schema Design",
    "MEDIUM",
    `
For a blog app with users, posts and comments, how do you decide between embedding related data in one document and referencing it by id? Give the rules you would follow.
`,
    `
Embed when:
- Data is read together and belongs to the parent (one-to-one or one-to-few), e.g. a user's address, an order's line items.
- The embedded data is bounded in size.
- Benefit: one read, atomic single-document updates.

Reference when:
- The relationship is one-to-many with large or unbounded growth (a post with thousands of comments), or many-to-many.
- The child is accessed independently or updated often.
- Data is shared by many parents and duplication would be hard to keep consistent.

Blog example: embed the author's name and id in a post (denormalised for display), store comments in their own collection with postId, and index postId.

Remember the 16 MB document limit, and design around the application's query patterns.
`,
    { role: "Backend Developer" },
  ),
  q(
    "mongodb",
    "How do you join collections with $lookup?",
    "Aggregation",
    "MEDIUM",
    `
You have orders { _id, userId, amount } and users { _id, name }. Write an aggregation that returns each order with the user's name. What does $unwind do here?
`,
    `
\`\`\`js
db.orders.aggregate([
  {
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      as: "user",
    },
  },
  { $unwind: "$user" },
  { $project: { amount: 1, userName: "$user.name" } },
]);
\`\`\`

- $lookup performs a left outer join and always puts the matches into an array (user: [ {...} ]).
- $unwind turns that array into a single object, producing one document per element. Orders with no user are dropped unless you use preserveNullAndEmptyArrays: true.
- Make sure foreignField is indexed (_id is). Heavy use of $lookup can signal that the schema should embed more.
`,
  ),
  q(
    "mongodb",
    "How do you use explain() to analyse a slow query?",
    "Indexing",
    "MEDIUM",
    `
A query on a 5-million-document collection takes 4 seconds. How do you use explain() to find out why, and which fields of the output do you check?
`,
    `
\`\`\`js
db.orders.find({ status: "PAID", city: "Pune" }).explain("executionStats");
\`\`\`

Check:
- winningPlan stage: COLLSCAN means no index was used; IXSCAN followed by FETCH means an index was used.
- totalDocsExamined and totalKeysExamined versus nReturned: ideally close. Examining 5,000,000 documents to return 20 means a missing or poor index.
- A SORT stage means an in-memory sort; an index in sort order avoids it.
- executionTimeMillis.

Then add a suitable index (e.g. { status: 1, city: 1 }), re-run explain, and compare. The database profiler and Atlas Performance Advisor can find slow queries in production.
`,
    { role: "Backend Developer" },
  ),
  q(
    "mongodb",
    "What is a replica set in MongoDB?",
    "Scaling",
    "MEDIUM",
    `
What is a replica set? How does failover work, and can you read from secondaries?
`,
    `
- A replica set is a group of mongod processes holding the same data: one primary and one or more secondaries (minimum recommended: 3 members).
- All writes go to the primary, which records them in the oplog; secondaries copy and apply the oplog asynchronously.
- Failover: if the primary is unreachable (no heartbeat for about 10 s by default), the remaining members hold an election and a secondary with a majority vote becomes primary. Drivers reconnect automatically.
- An odd number of voting members avoids ties (an arbiter can vote but holds no data).
- Reads go to the primary by default; with readPreference "secondary" or "nearest" you can read from secondaries, but data may be slightly stale.
- Replication gives high availability, not horizontal write scaling (that is sharding).
`,
  ),
  q(
    "mongodb",
    "How does populate() work in Mongoose?",
    "Queries",
    "MEDIUM",
    `
In Mongoose, a Post has author: { type: ObjectId, ref: "User" }. How does populate() work, what queries does it run, and what are its performance pitfalls?
`,
    `
\`\`\`js
const posts = await Post.find({ published: true })
  .populate("author", "name avatar")
  .limit(20);
\`\`\`

- populate replaces the ObjectId with the referenced document.
- It is not a database join: Mongoose runs the first query, collects the ids, then runs a second query (User.find({ _id: { $in: ids } })) and merges the results in Node.
- So one populate means one extra query per populated path (not one per document), but nested or many populates add round trips.
- Pitfalls: populating large arrays, deep nesting, and pulling every field. Select only needed fields, and use lean() for read-only results.
- For complex reports, an aggregation with $lookup runs in the database in one round trip.
`,
    { role: "Full Stack Developer" },
  ),
  q(
    "mongodb",
    "Write an aggregation to find the top 3 products by revenue.",
    "Aggregation",
    "MEDIUM",
    `
Orders look like this. Write an aggregation that returns the top 3 products by total revenue (qty * price) across all orders.

\`\`\`json
{ "_id": 1, "items": [
  { "product": "Pen", "qty": 10, "price": 5 },
  { "product": "Book", "qty": 2, "price": 120 }
] }
\`\`\`
`,
    `
\`\`\`js
db.orders.aggregate([
  { $unwind: "$items" },
  {
    $group: {
      _id: "$items.product",
      revenue: { $sum: { $multiply: ["$items.qty", "$items.price"] } },
      unitsSold: { $sum: "$items.qty" },
    },
  },
  { $sort: { revenue: -1 } },
  { $limit: 3 },
]);
\`\`\`

- $unwind creates one document per order item, so each line can be grouped by product.
- $multiply computes line revenue inside $sum.
- For the single order shown: Pen = 50, Book = 240.
- In real use, add a $match first (e.g. a date range and status PAID) to reduce work.
`,
    { role: "Data Analyst" },
  ),
  q(
    "mongodb",
    "What is sharding and how do you choose a shard key?",
    "Scaling",
    "HARD",
    `
Your collection has grown to several terabytes and writes exceed one server's capacity. Explain how MongoDB sharding works and how you would choose a shard key for an orders collection.
`,
    `
How it works:
- Data is split across shards (each a replica set) by a shard key into ranges called chunks.
- mongos routers send each query to the right shards; config servers store the metadata. The balancer moves chunks to keep shards even.

A good shard key has:
- High cardinality (many distinct values) and low frequency (no single value dominates).
- Non-monotonic growth: a key like createdAt or ObjectId sends all new inserts to one shard (a hot shard). Hashed sharding spreads them but makes range queries scatter.
- Match with common queries, so they target one shard instead of broadcasting to all.

For orders, a compound key like { customerId: 1, createdAt: 1 } (or hashed customerId) spreads writes and keeps "orders of a customer" on one shard.

Since 5.0 you can reshard, but changing the key is expensive, so choose carefully.
`,
    { role: "Backend Developer" },
  ),
  q(
    "mongodb",
    "How do multi-document transactions work in MongoDB?",
    "Scaling",
    "HARD",
    `
A wallet app must move 500 rupees from user A to user B: debit A, credit B, and insert a transfer record. How do you make this atomic in MongoDB, and what are the limitations? Could you avoid a transaction?
`,
    `
Single-document writes are always atomic. For several documents, use a transaction (replica set or sharded cluster required):

\`\`\`js
const session = await mongoose.startSession();
await session.withTransaction(async () => {
  const debit = await Wallet.updateOne(
    { userId: a, balance: { $gte: 500 } },
    { $inc: { balance: -500 } },
    { session }
  );
  if (debit.modifiedCount !== 1) throw new Error("Insufficient balance");
  await Wallet.updateOne({ userId: b }, { $inc: { balance: 500 } }, { session });
  await Transfer.create([{ from: a, to: b, amount: 500 }], { session });
});
session.endSession();
\`\`\`

- withTransaction retries on transient errors and commits or aborts as a whole.
- Limits: 60 s default lifetime; more overhead and lock contention than single-document writes.
- Alternative: model it so one document changes atomically (e.g. a ledger of entries), with idempotency keys.
`,
    { role: "Backend Developer" },
  ),
  q(
    "mongodb",
    "How do you model data that grows without limit, like chat messages?",
    "Schema Design",
    "HARD",
    `
A developer stores every chat message inside its conversation document as an array: conversations: { _id, members, messages: [ ... ] }. Some conversations have 200,000 messages. What goes wrong, and how would you redesign it?
`,
    `
Problems with an unbounded array:
- Documents hit the 16 MB BSON limit, and writes then fail.
- Every read loads the whole array; updates rewrite large documents; indexes on array fields grow huge.
- Paginating inside an array is awkward.

Redesign options:
- Separate collection: messages { conversationId, senderId, text, createdAt } with index { conversationId: 1, createdAt: -1 }. Paginate with a range on createdAt (or _id), not skip.
- Bucket pattern: one document per conversation per time window or per N messages (e.g. 100), with a count field; reduces document and index count.
- Keep a small denormalised summary in the conversation (lastMessage, unread counts) for the chat list screen.

Rule: avoid arrays that can grow without bound; embed only bounded "few" relationships.
`,
    { role: "Backend Developer" },
  ),
  q(
    "mongodb",
    "What are read concern and write concern in MongoDB?",
    "Scaling",
    "HARD",
    `
Explain write concern (w: 1, w: "majority", j: true) and read concern (local, majority, linearizable). After a failover, a user's just-saved profile change disappears. Which settings explain this and how do you prevent it?
`,
    `
Write concern: how many members must acknowledge a write before it returns.
- w: 1: only the primary. Fast, but if the primary fails before secondaries replicate it, the write can be rolled back.
- w: "majority": a majority of voting members have it, so it survives failover (the default since MongoDB 5.0 in most setups).
- j: true: wait until the write is in the on-disk journal.

Read concern: what data a read may return.
- local: the node's latest data, which may later be rolled back.
- majority: only data acknowledged by a majority (cannot be rolled back).
- linearizable: reflects all majority writes completed before the read (slowest, primary only).

The lost update fits w: 1 plus a failover rollback. Use w: "majority" for important writes, read concern majority where needed, and causally consistent sessions for read-your-own-writes on secondaries.
`,
  ),
  q(
    "mongodb",
    "Why is skip() slow for deep pagination and what should you use?",
    "Indexing",
    "HARD",
    `
An admin page lists 10 million log entries with find().sort({ createdAt: -1 }).skip(page * 50).limit(50). Page 1 is fast but page 100,000 takes seconds. Why, and how would you fix it?
`,
    `
- skip(n) still walks through n index entries (or documents) before returning results, so the cost grows linearly with the page number. Page 100,000 skips about 5,000,000 entries.

Fix with range-based (keyset) pagination on an indexed, unique ordering:

\`\`\`js
// index: { createdAt: -1, _id: -1 }
db.logs.find({
  $or: [
    { createdAt: { $lt: lastCreatedAt } },
    { createdAt: lastCreatedAt, _id: { $lt: lastId } },
  ],
})
  .sort({ createdAt: -1, _id: -1 })
  .limit(50);
\`\`\`

- The client sends the last item's createdAt and _id as the cursor; each page is an index seek, so it is equally fast at any depth.
- _id breaks ties between equal timestamps.
- Trade-off: no jumping to arbitrary page numbers; avoid exact total counts on huge collections (use estimatedDocumentCount).
`,
    { role: "Backend Developer" },
  ),
];
