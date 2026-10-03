import { c, task, type CatalogueTask } from "./helpers.js";

/** More practical tasks for this topic group (see helpers.ts for the format). */
export const BACKEND_TASKS: CatalogueTask[] = [
  // Node.js (existing: "Count words in a file", EASY)
  task(
    "nodejs",
    "Turn a callback function into a Promise",
    "EASY",
    `
A legacy module gives you getUser(id, callback), where callback is called as callback(err, user) after a delay.

- Write getUserAsync(id) that wraps it and returns a Promise (do it by hand, then show the one-line version with util.promisify).
- Use it with async/await to fetch users 1, 2 and 3 in parallel and print their names.
- Catch and print an error if any lookup fails.
`,
    [
      c("wrap", "Manual Promise wrapper resolves with user and rejects with err", 4),
      c("promisify", "Correct util.promisify version", 2),
      c("parallel", "Uses Promise.all with async/await to fetch in parallel", 2),
      c("errors", "try/catch (or .catch) handles a failed lookup", 2),
    ],
    `
const util = require("util");

// Legacy API: do not change
function getUser(id, callback) {
  setTimeout(() => {
    if (id <= 0) return callback(new Error("Invalid id"));
    callback(null, { id, name: "User " + id });
  }, 100);
}

function getUserAsync(id) {
  // your code here
}

async function main() {
  // fetch users 1, 2, 3 in parallel and print their names
}

main();
`,
  ),
  task(
    "nodejs",
    "Build a tiny HTTP server without Express",
    "MEDIUM",
    `
Using only the built-in http module (no Express), write a server on port 3000 that handles:

- GET /health → 200 with JSON { "status": "ok" }
- GET /time → 200 with JSON { "now": "<ISO timestamp>" }
- POST /echo → reads the JSON request body and sends it back with 200; invalid JSON → 400 with an error message
- Anything else → 404 JSON { "error": "Not found" }

Set the Content-Type header on every response.
`,
    [
      c("routing", "Routes on req.method and req.url correctly, including the 404 fallback", 3),
      c("body", "Collects the request body from data/end events before parsing", 3),
      c("json", "Sends JSON with the right Content-Type header and status codes", 2),
      c("invalid", "Handles invalid JSON with a 400 instead of crashing", 2),
    ],
    `
const http = require("http");

const server = http.createServer((req, res) => {
  // your code here
});

server.listen(3000, () => console.log("Listening on 3000"));
`,
  ),
  task(
    "nodejs",
    "Stream a large CSV and summarise it",
    "MEDIUM",
    `
A file sales.csv (about 2 GB) has a header row and lines like:

\`\`\`
date,city,amount
2025-01-03,Pune,1250
2025-01-03,Delhi,980
\`\`\`

Write a Node.js script that prints the total amount per city, highest first. The file is too big to load with fs.readFile, so read it as a stream (fs.createReadStream with readline, or a stream pipeline).

In 1–2 lines, explain why streaming keeps memory usage low.
`,
    [
      c("stream", "Reads line by line with createReadStream + readline (not readFile)", 4),
      c("parse", "Skips the header and parses city and amount as a number", 2),
      c("aggregate", "Totals per city in a Map/object and sorts descending at the end", 2),
      c("explain", "Explains that only a chunk is in memory at a time", 2),
    ],
    `
const fs = require("fs");
const readline = require("readline");

async function summarise(path) {
  // your code here
}

summarise("sales.csv");
`,
  ),
  task(
    "nodejs",
    "Run async jobs with a concurrency limit",
    "HARD",
    `
You must download 100 URLs, but the server allows at most 5 requests at a time.

Write runWithLimit(tasks, limit), where tasks is an array of functions that each return a Promise. It must:

- Never run more than limit tasks at once, starting a new one as soon as one finishes.
- Resolve with all results in the original order.
- If a task rejects, record { error: message } for it and keep going (do not stop the others).

Do not use any npm package. Then explain how the event loop lets Node do this on a single thread.
`,
    [
      c("limit", "Never more than limit tasks in flight; starts the next as one finishes", 4),
      c("order", "Results come back in the original order", 2),
      c("errors", "A failed task is recorded and the rest keep running", 2),
      c("event-loop", "Clear explanation of non-blocking I/O and the event loop", 2),
    ],
    `
async function runWithLimit(tasks, limit) {
  // your code here
}

// Example: 10 fake jobs that take random time
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const tasks = Array.from({ length: 10 }, (_, i) => async () => {
  await sleep(Math.random() * 500);
  if (i === 7) throw new Error("job 7 failed");
  return i * 10;
});

runWithLimit(tasks, 3).then(console.log);
// [0, 10, 20, 30, 40, 50, 60, { error: "job 7 failed" }, 80, 90]
`,
  ),

  // Express.js (existing: "A small notes API", MEDIUM)
  task(
    "expressjs",
    "Write a request logger middleware",
    "EASY",
    `
Write an Express middleware logger that, for every request, prints one line after the response finishes:

\`\`\`
GET /users 200 12ms
\`\`\`

(method, URL, status code, time taken in ms). Register it for all routes and add one GET / route to show it works.

Explain in one line what happens if a middleware forgets to call next().
`,
    [
      c("signature", "Correct (req, res, next) middleware that calls next()", 3),
      c("timing", "Measures time and logs on the response finish event", 3),
      c("register", "Registered with app.use before the routes", 2),
      c("next", "Explains that the request hangs if next() is not called", 2),
    ],
    `
const express = require("express");
const app = express();

function logger(req, res, next) {
  // your code here
}

// register the middleware and add a GET / route

app.listen(3000);
`,
  ),
  task(
    "expressjs",
    "Use route and query parameters",
    "EASY",
    `
An in-memory array of products is given in the starter. Add two routes:

- GET /products — supports optional query parameters ?category=books and ?maxPrice=500 (both can be combined). Returns the matching products.
- GET /products/:id — returns one product, or 404 with { error: "Product not found" }.

Remember that route and query parameters arrive as strings.
`,
    [
      c("params", "Reads req.params.id and converts it to a number", 2),
      c("query", "Filters by category and maxPrice from req.query, each optional", 3),
      c("convert", "Compares maxPrice numerically, not as a string", 2),
      c("notfound", "Returns 404 with a JSON error for an unknown id", 3),
    ],
    `
const express = require("express");
const app = express();

const products = [
  { id: 1, name: "DSA Book", category: "books", price: 450 },
  { id: 2, name: "Headphones", category: "electronics", price: 1200 },
  { id: 3, name: "Notebook", category: "stationery", price: 60 },
  { id: 4, name: "System Design Book", category: "books", price: 780 },
];

// your routes here

app.listen(3000);
`,
  ),
  task(
    "expressjs",
    "Centralised error handling and validation",
    "MEDIUM",
    `
Add proper error handling to an Express app:

- Create an AppError class with a message and statusCode.
- POST /register takes { email, password }. Throw AppError 400 if email has no "@" or password is under 8 characters; throw AppError 409 if the email is already in the in-memory users list. Otherwise respond 201.
- Write one error-handling middleware (4 arguments) at the end that sends { error: message } with the right status, and a generic 500 message for unexpected errors (do not leak the stack).
- Add a 404 handler for unknown routes.
- Show how errors from an async route reach the handler.
`,
    [
      c("apperror", "AppError class with statusCode, thrown for validation and duplicates", 2),
      c("handler", "Error middleware has 4 args, is registered last and uses the status", 3),
      c("async", "Async errors are forwarded with next(err) or a wrapper", 2),
      c("safe", "Unknown errors give a generic 500 without exposing the stack", 2),
      c("404", "A 404 handler for unknown routes", 1),
    ],
    `
const express = require("express");
const app = express();
app.use(express.json());

const users = [{ email: "asha@example.com" }];

class AppError extends Error {
  // your code here
}

app.post("/register", async (req, res, next) => {
  // your code here
});

// 404 handler and error handler here

app.listen(3000);
`,
  ),
  task(
    "expressjs",
    "Protect routes with JWT authentication",
    "HARD",
    `
Build auth for an Express API using bcrypt and jsonwebtoken (users kept in an in-memory array):

- POST /signup — { email, password }: hash the password with bcrypt and store the user; 409 if the email exists.
- POST /login — check the password with bcrypt.compare; on success return a JWT (payload: user id and role, expires in 1h); wrong credentials → 401.
- An auth middleware that reads "Authorization: Bearer <token>", verifies it and sets req.user; missing or invalid token → 401.
- A requireRole("admin") middleware; GET /admin/stats returns 403 for non-admins.
- GET /me returns the logged-in user without the password hash.

Read the JWT secret from process.env.
`,
    [
      c("hash", "Passwords hashed with bcrypt on signup and checked with compare", 2),
      c("token", "Signs a JWT with id/role and an expiry, secret from env", 2),
      c("middleware", "Auth middleware parses the Bearer header, verifies, sets req.user", 3),
      c("roles", "requireRole returns 403 for the wrong role; 401 vs 403 used correctly", 2),
      c("leak", "Never returns the password hash in responses", 1),
    ],
    `
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

const users = []; // { id, email, passwordHash, role }
const SECRET = process.env.JWT_SECRET;

function auth(req, res, next) {
  // your code here
}

function requireRole(role) {
  // your code here
}

// routes: /signup, /login, /me, /admin/stats

app.listen(3000);
`,
  ),

  // REST APIs (existing: "Design a REST API for a library", MEDIUM)
  task(
    "rest-apis",
    "Pick the right HTTP status codes",
    "EASY",
    `
For each situation, give the best HTTP status code and a one-line reason:

1. A new user account was created successfully.
2. The client sent JSON with a missing required field.
3. The request has no login token at all.
4. A logged-in student tries to open an admin-only page.
5. GET /orders/999 but order 999 does not exist.
6. Signing up with an email that is already registered.
7. The client sent too many requests in a minute.
8. A DELETE succeeded and there is nothing to return.
9. The server crashed because of a bug.
10. The upstream payment service is down and timed out.
`,
    [
      c("2xx", "Correct codes for 1 and 8 (201, 204)", 2),
      c("4xx-auth", "Correct 401 vs 403 for 3 and 4", 2),
      c("4xx-other", "Correct codes for 2, 5, 6, 7 (400/422, 404, 409, 429)", 4),
      c("5xx", "Correct codes for 9 and 10 (500, 502/503/504) with reasons", 2),
    ],
    `
1.
2.
3.
4.
5.
6.
7.
8.
9.
10.
`,
  ),
  task(
    "rest-apis",
    "Explain idempotency and safe methods",
    "EASY",
    `
Answer briefly:

- What does it mean for an HTTP method to be safe? To be idempotent?
- Classify GET, POST, PUT, PATCH and DELETE as safe and/or idempotent.
- What is the difference between PUT and PATCH? Give an example request body for updating only a user's phone number with each.
- A user taps "Pay" twice on a slow network. How can an API stop the payment from being charged twice? (Hint: an idempotency key.)
`,
    [
      c("definitions", "Correct definitions of safe and idempotent", 2),
      c("classify", "Correctly classifies all five methods", 3),
      c("put-patch", "Explains PUT (full replace) vs PATCH (partial) with examples", 3),
      c("double-pay", "Describes an idempotency key the server stores and checks", 2),
    ],
  ),
  task(
    "rest-apis",
    "Add pagination, filtering and sorting",
    "MEDIUM",
    `
An e-commerce API has GET /products returning 50,000 products in one response, which is slow.

Design the improved endpoint:

- Query parameters for pagination, filtering (category, price range, in stock) and sorting (price or rating, ascending or descending). Show 2 example URLs.
- The JSON response shape, including pagination metadata.
- Compare offset pagination (page/limit) with cursor pagination: which would you use for an infinite-scroll feed and why?
- What should the API do with ?limit=10000 or an unknown sort field?
`,
    [
      c("params", "Clear, consistent query parameter design with example URLs", 3),
      c("response", "Response shape includes data plus metadata (total/next cursor, etc.)", 2),
      c("cursor", "Correct offset vs cursor trade-off with a justified choice", 3),
      c("limits", "Caps limit and returns 400 (or a default) for invalid input", 2),
    ],
  ),
  task(
    "rest-apis",
    "Design a versioned, rate-limited public API",
    "HARD",
    `
You are designing a public API for a food delivery platform used by restaurants and third-party apps. Cover:

- Endpoints for restaurants, menus, orders and order status (method, path, key status codes). Include a nested resource and an action that does not map neatly to CRUD (e.g. cancelling an order) and explain how you model it.
- Authentication for third-party apps (API keys vs OAuth 2.0) and why.
- Versioning: how you will ship a breaking change without breaking existing clients.
- Rate limiting: the algorithm, the limits per client, and the response headers and status code clients see.
- A consistent error response format (show an example JSON).
- How clients learn about order status changes without polling every second (webhooks).
`,
    [
      c("endpoints", "Clean resource design incl. nesting and a sensible non-CRUD action", 3),
      c("auth", "Reasoned choice between API keys and OAuth", 2),
      c("versioning", "Concrete versioning strategy (URL or header) with deprecation plan", 1),
      c("ratelimit", "Named algorithm, limits, 429 and rate-limit headers", 2),
      c("errors-webhooks", "Consistent error JSON and a webhook design (signing, retries)", 2),
    ],
    `
Endpoints:

Auth:

Versioning:

Rate limiting:

Error format:

Webhooks:
`,
  ),

  // MongoDB (existing: "Query and aggregate orders", MEDIUM)
  task(
    "mongodb",
    "Basic CRUD on a students collection",
    "EASY",
    `
A students collection has documents like:

\`\`\`
{ name: "Riya", branch: "CSE", cgpa: 8.4, skills: ["java", "sql"], placed: false }
\`\`\`

Write mongosh commands to:

1. Insert two new students in one command.
2. Find CSE students with cgpa of at least 8, showing only name and cgpa (no _id).
3. Find students who have "react" in their skills.
4. Mark Riya as placed and add "dsa" to her skills (without duplicates).
5. Delete all students with cgpa below 5.
`,
    [
      c("insert", "Correct insertMany", 2),
      c("find", "Correct filter with $gte and a projection excluding _id", 3),
      c("array", "Matches an array element for skills", 1),
      c("update", "updateOne with $set and $addToSet", 2),
      c("delete", "deleteMany with $lt", 2),
    ],
  ),
  task(
    "mongodb",
    "Embed or reference? Model a blog",
    "EASY",
    `
Design MongoDB collections for a blog with users, posts, comments and tags. A post can have thousands of comments; each post has up to 5 tags; the home page shows the latest posts with author name and comment count.

- Show a sample document for each collection you choose.
- For each relationship, say whether you embed or reference and why.
- Name one downside of embedding all comments inside the post document.
`,
    [
      c("documents", "Sensible sample documents for each collection", 3),
      c("decisions", "Embed vs reference decisions match the access patterns", 4),
      c("downside", "Mentions the 16 MB document limit or unbounded growth", 3),
    ],
  ),
  task(
    "mongodb",
    "Speed up a slow query with indexes",
    "MEDIUM",
    `
An orders collection has 5 million documents. This query takes 4 seconds:

\`\`\`
db.orders.find({ customerId: 42, status: "shipped" }).sort({ createdAt: -1 }).limit(20)
\`\`\`

- How would you confirm why it is slow? What would you look for in explain("executionStats") (e.g. COLLSCAN vs IXSCAN, docs examined vs returned)?
- Create the best compound index for this query and explain the field order (equality, sort, range).
- Would your index also help find({ customerId: 42 })? And find({ status: "shipped" })? Why?
- Give one cost of adding too many indexes.
`,
    [
      c("explain", "Uses explain and reads COLLSCAN, totalDocsExamined vs nReturned", 2),
      c("index", "Creates { customerId: 1, status: 1, createdAt: -1 } or equivalent", 3),
      c("order", "Explains the equality-sort-range rule", 2),
      c("prefix", "Correctly answers the prefix question for both queries", 2),
      c("cost", "Names a cost such as slower writes or extra memory", 1),
    ],
  ),
  task(
    "mongodb",
    "Build a placement analytics pipeline",
    "HARD",
    `
Two collections:

\`\`\`
students: { _id, name, branch: "CSE", batch: 2026 }
offers:   { studentId, company: "Infosys", ctcLpa: 6.5, offeredAt: ISODate("2025-11-02") }
\`\`\`

A student can have several offers. Write one aggregation pipeline on students for batch 2026 that outputs, per branch:

- totalStudents, placedStudents (at least one offer) and placementPercent (rounded to 1 decimal).
- highestCtc and averageCtc, using each placed student's best offer only.
- topCompany: the company that made the most offers to that branch.

Sort branches by placementPercent descending. Use $lookup, and explain what each stage does and which indexes would help.
`,
    [
      c("lookup", "Correct $lookup from students to offers on studentId", 2),
      c("best", "Takes each student's best offer ($max) before averaging", 2),
      c("group", "Correct per-branch counts, percentage, highest and average", 3),
      c("topcompany", "Correctly finds the most frequent company per branch", 2),
      c("explain", "Explains the stages and suggests an index on offers.studentId", 1),
    ],
    `
db.students.aggregate([
  { $match: { batch: 2026 } },
  // your stages here
]);
`,
  ),
];
