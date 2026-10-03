import { c, task, type CatalogueTask } from "./helpers.js";

/** More practical tasks for this topic group (see helpers.ts for the format). */
export const WEB_TASKS: CatalogueTask[] = [
  // ---------------------------------------------------------------- html
  task(
    "html",
    "Mark up a blog article semantically",
    "EASY",
    `
Turn this plain content into a semantic HTML page (no CSS needed):

- Site name "CodeCampus" with a nav of 3 links: Home, Blog, Contact.
- An article titled "5 Tips to Crack Your First Campus Interview", with author "Priya Sharma" and the date 12 March 2026.
- Two sections inside the article, each with a sub-heading and a paragraph.
- A sidebar with "Related posts" (a list of 2 links).
- A footer with a copyright line.

Use the right elements instead of plain divs.
`,
    [
      c("landmarks", "Uses header, nav, main, article, aside and footer correctly", 4),
      c("headings", "Logical heading order (one h1, h2 for sections, no skipped levels)", 2),
      c("time", "Marks the date with <time datetime> and the author clearly", 2),
      c("valid", "Valid document with lists for nav/related links and no needless divs", 2),
    ],
    `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>CodeCampus Blog</title>
  </head>
  <body>
    <!-- your markup here -->
  </body>
</html>
`,
  ),
  task(
    "html",
    "Build an accessible class timetable table",
    "MEDIUM",
    `
Build an HTML table for this weekly timetable:

- Columns: Day, 9:00–10:00, 10:00–11:00, 11:00–12:00
- Monday: DBMS, Operating Systems, Maths
- Tuesday: Computer Networks, Lab (spans 10:00–12:00, two columns)
- Wednesday: Aptitude, DBMS, Soft Skills

Requirements:

- A caption describing the table.
- thead and tbody, with th cells and the correct scope (col for the time headers, row for the days).
- Use colspan for Tuesday's lab.
`,
    [
      c("structure", "Uses caption, thead and tbody correctly", 3),
      c("headers", "th cells with scope=col for times and scope=row for days", 3),
      c("colspan", "Tuesday's lab uses colspan=2 and every row has the right cell count", 2),
      c("data", "All the timetable data is present and correct", 2),
    ],
    `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Timetable</title>
    <style>
      table { border-collapse: collapse; }
      th, td { border: 1px solid #999; padding: 6px 10px; }
    </style>
  </head>
  <body>
    <!-- your table here -->
  </body>
</html>
`,
  ),
  task(
    "html",
    "Add responsive images and a captioned video",
    "MEDIUM",
    `
On a "Campus Tour" page, add:

- A hero image that loads hero-480.jpg on small screens, hero-960.jpg on medium and hero-1600.jpg on large ones (use srcset + sizes, or <picture>).
- Three gallery photos, each inside a figure with a figcaption and a meaningful alt text. One of them is purely decorative – handle its alt correctly.
- A video tour (tour.mp4, fallback tour.webm) with controls, a poster image, and an English captions track (tour-en.vtt).

Lazy-load the gallery images.
`,
    [
      c("responsive", "Correct srcset/sizes or <picture> for the hero image", 3),
      c("figures", 'figure/figcaption with meaningful alt; decorative image uses alt=""', 3),
      c("video", "video with controls, poster, two sources and a captions <track>", 3),
      c("lazy", 'Gallery images use loading="lazy" and have width/height', 1),
    ],
    `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Campus Tour</title>
  </head>
  <body>
    <main>
      <h1>Campus Tour</h1>
      <!-- hero image, gallery and video here -->
    </main>
  </body>
</html>
`,
  ),
  task(
    "html",
    "Build an accessible college fest landing page",
    "HARD",
    `
Build the full HTML for a landing page for "TechFest 2026" (minimal CSS is fine):

- A "Skip to main content" link as the first focusable element.
- Header with a logo and a nav (Events, Schedule, FAQ, Register); mark the current page with aria-current.
- An events section with 3 event cards (title, date, short text, "Know more" link with descriptive text for screen readers).
- An FAQ with 3 questions using details/summary.
- A registration form: name, email, phone (10 digits, use pattern), event (radio group in a fieldset with legend), and a submit button. Add helper text linked with aria-describedby.
- A footer with contact info in an address element.

Keep the heading outline logical and the page keyboard-usable.
`,
    [
      c("skip", "Working skip link targeting the main element's id", 1),
      c("landmarks", "Correct landmarks, nav with aria-current and a logical heading outline", 2),
      c("cards", "Event cards are semantic with descriptive link text (not just 'Know more')", 2),
      c("faq", "FAQ uses details/summary correctly", 1),
      c(
        "form",
        "Labelled form with fieldset/legend radios, pattern for phone, aria-describedby helper text",
        4,
      ),
    ],
    `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>TechFest 2026</title>
  </head>
  <body>
    <!-- skip link, header, main, footer -->
  </body>
</html>
`,
  ),

  // ----------------------------------------------------------------- css
  task(
    "css",
    "Style buttons with hover and focus states",
    "EASY",
    `
Style the three buttons in the starter:

- .btn: padding 10px 20px, rounded corners, no default border, pointer cursor, a smooth transition.
- .btn-primary: blue background, white text; darker blue on hover.
- .btn-outline: transparent background with a 2px blue border; filled blue with white text on hover.
- .btn:disabled: faded (opacity) with a not-allowed cursor and no hover change.
- A clearly visible :focus-visible outline for keyboard users.
`,
    [
      c("base", "Base .btn styles: padding, radius, border reset, cursor, transition", 3),
      c("variants", "Primary and outline variants with correct hover states", 3),
      c("disabled", "Disabled state is styled and does not react to hover", 2),
      c("focus", "Visible :focus-visible outline (not removed)", 2),
    ],
    `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <style>
      body { font-family: sans-serif; padding: 40px; display: flex; gap: 12px; }
      /* your CSS here */
    </style>
  </head>
  <body>
    <button class="btn btn-primary">Apply now</button>
    <button class="btn btn-outline">Save for later</button>
    <button class="btn btn-primary" disabled>Closed</button>
  </body>
</html>
`,
  ),
  task(
    "css",
    "Fix a profile card using the box model",
    "EASY",
    `
The .profile card in the starter should be exactly 300px wide in total (including padding and border), but it overflows its 300px container.

- Fix the sizing so padding and border stay inside 300px.
- Give the card 20px padding, a 1px light grey border, 12px rounded corners and a soft box-shadow.
- Make the avatar a 80px circle, centred horizontally.
- Add 8px space between the name and role, and remove the default margins that cause extra gaps.

Add a short CSS comment explaining what box-sizing changed.
`,
    [
      c("boxsizing", "Uses box-sizing: border-box so the card is exactly 300px", 3),
      c("card", "Correct padding, border, radius and shadow", 2),
      c("avatar", "Avatar is an 80px circle (border-radius: 50%) and centred", 3),
      c("spacing", "Controls margins for name/role and explains box-sizing", 2),
    ],
    `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <style>
      body { font-family: sans-serif; }
      .container { width: 300px; background: #eef; }
      .profile { width: 300px; padding: 20px; border: 1px solid #ccc; }
      /* your CSS here */
    </style>
  </head>
  <body>
    <div class="container">
      <div class="profile">
        <img class="avatar" src="https://picsum.photos/200" alt="Ravi Kumar" />
        <h2 class="name">Ravi Kumar</h2>
        <p class="role">Final-year CSE student</p>
      </div>
    </div>
  </body>
</html>
`,
  ),
  task(
    "css",
    "Build a sticky header with a flexbox navbar",
    "MEDIUM",
    `
Style the page in the starter:

- The header sticks to the top while scrolling, with a white background and a bottom shadow, above the content.
- Inside the header, use flexbox: logo on the left, nav links on the right, vertically centred.
- Nav links: no underline, 24px gap; the active link (.active) has a coloured underline made with border-bottom or a pseudo-element.
- Under 600px wide, the nav links wrap below the logo and are centred.

Don't change the HTML.
`,
    [
      c(
        "sticky",
        "position: sticky with top: 0, background and z-index so content scrolls under",
        3,
      ),
      c("flex", "Flexbox with space-between and align-items: center", 3),
      c("links", "Styled links with gap and a distinct active state", 2),
      c("responsive", "A media query stacks/centres the nav on small screens", 2),
    ],
    `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { margin: 0; font-family: sans-serif; }
      section { height: 600px; padding: 20px; }
      /* your CSS here */
    </style>
  </head>
  <body>
    <header class="site-header">
      <a class="logo" href="#">PrepHub</a>
      <nav class="nav">
        <a href="#" class="active">Home</a>
        <a href="#">Courses</a>
        <a href="#">Mock tests</a>
        <a href="#">Contact</a>
      </nav>
    </header>
    <section>Scroll down...</section>
    <section>More content</section>
  </body>
</html>
`,
  ),
  task(
    "css",
    "Build a themeable dashboard with grid areas",
    "HARD",
    `
Lay out the dashboard in the starter with CSS only:

- Use CSS grid with grid-template-areas: header across the top, sidebar (220px) on the left, main content and a stats panel side by side, footer at the bottom. The page fills at least the full viewport height.
- Inside .stats, show the 4 .stat cards in a grid that auto-fits columns of at least 150px.
- Define colours and spacing as custom properties on :root, and add a dark theme that switches when the body has class "dark" (only the variables change).
- Under 768px: single column, order header, main, stats, sidebar, footer.
- The main area must not overflow when it contains long content (hint: min-width).
`,
    [
      c("areas", "grid-template-areas layout with correct column/row sizes and full height", 3),
      c("autofit", "Stat cards use repeat(auto-fit, minmax(150px, 1fr))", 2),
      c("variables", "Custom properties with a dark theme that only overrides variables", 2),
      c("responsive", "Media query re-orders areas into one column in the required order", 2),
      c("overflow", "Prevents grid blowout (min-width: 0 or minmax(0, 1fr))", 1),
    ],
    `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { margin: 0; font-family: sans-serif; }
      /* your CSS here */
    </style>
  </head>
  <body>
    <div class="layout">
      <header class="header">Placement Dashboard</header>
      <aside class="sidebar">Menu</aside>
      <main class="main">Applications list goes here</main>
      <section class="stats">
        <div class="stat">Applied: 12</div>
        <div class="stat">Shortlisted: 4</div>
        <div class="stat">Interviews: 3</div>
        <div class="stat">Offers: 1</div>
      </section>
      <footer class="footer">2026 PrepHub</footer>
    </div>
  </body>
</html>
`,
  ),

  // ---------------------------------------------------------- javascript
  task(
    "javascript",
    "Find the second largest number",
    "EASY",
    `
Write secondLargest(nums) that returns the second largest DISTINCT number in an array, in a single pass (no sorting).

- Return null if there is no second distinct value (e.g. [5, 5] or [7]).
- Works with negative numbers.
`,
    [
      c("correct", "Returns the right answer for all the sample calls", 4),
      c("onepass", "Single pass tracking largest and second largest, no sort", 3),
      c(
        "edge",
        "Handles duplicates, single-element and negative arrays (returns null when needed)",
        3,
      ),
    ],
    `
function secondLargest(nums) {
  // your code here
}

console.log(secondLargest([12, 35, 1, 10, 34, 1])); // 34
console.log(secondLargest([10, 10, 10])); // null
console.log(secondLargest([-3, -1, -7])); // -3
console.log(secondLargest([5, 9, 9, 2])); // 5
`,
  ),
  task(
    "javascript",
    "Group students by branch with reduce",
    "EASY",
    `
You have an array of students like { name: "Asha", branch: "CSE", cgpa: 8.4 }.

- Write groupBy(items, key) that returns an object mapping each value of key to an array of items, using reduce.
- Write avgCgpaByBranch(students) that returns { CSE: 8.2, ECE: 7.5, ... } rounded to 1 decimal place, using groupBy.

Don't mutate the input array.
`,
    [
      c("groupby", "groupBy uses reduce and works for any key", 4),
      c("average", "Averages are correct and rounded to 1 decimal", 3),
      c("pure", "Does not mutate the input; clean, readable code", 3),
    ],
    `
const students = [
  { name: "Asha", branch: "CSE", cgpa: 8.4 },
  { name: "Rohit", branch: "ECE", cgpa: 7.2 },
  { name: "Neha", branch: "CSE", cgpa: 8.0 },
  { name: "Vikram", branch: "ECE", cgpa: 7.8 },
  { name: "Sana", branch: "ME", cgpa: 6.9 },
];

function groupBy(items, key) {
  // your code here
}

function avgCgpaByBranch(students) {
  // your code here
}

console.log(Object.keys(groupBy(students, "branch"))); // ["CSE", "ECE", "ME"]
console.log(avgCgpaByBranch(students)); // { CSE: 8.2, ECE: 7.5, ME: 6.9 }
`,
  ),
  task(
    "javascript",
    "Flatten a nested object into dot paths",
    "MEDIUM",
    `
Write flattenObject(obj) that turns a nested object into a flat one whose keys are dot-separated paths.

- Arrays use the index as a path part (e.g. "skills.0").
- Empty nested objects should be kept as {} values.
- Do not use any library. Recursion is fine.

Then write unflatten(flat) that reverses it for plain objects (you may ignore arrays in unflatten).
`,
    [
      c("flatten", "flattenObject produces the expected keys for nested objects", 4),
      c("arrays", "Arrays and empty objects are handled as specified", 2),
      c("unflatten", "unflatten rebuilds the nested object from dot paths", 3),
      c("pure", "Inputs are not mutated", 1),
    ],
    `
function flattenObject(obj) {
  // your code here
}

function unflatten(flat) {
  // your code here
}

const user = { name: "Kiran", address: { city: "Pune", pin: 411001 }, skills: ["js", "sql"], meta: {} };
console.log(flattenObject(user));
// { name: "Kiran", "address.city": "Pune", "address.pin": 411001, "skills.0": "js", "skills.1": "sql", meta: {} }
console.log(unflatten({ "a.b.c": 1, "a.d": 2, e: 3 }));
// { a: { b: { c: 1 }, d: 2 }, e: 3 }
`,
  ),
  task(
    "javascript",
    "Implement an LRU cache class",
    "HARD",
    `
Implement a class LRUCache with a fixed capacity:

- get(key): returns the value, or -1 if missing. A get marks the key as most recently used.
- put(key, value): inserts or updates the key. If this goes over capacity, evict the least recently used key.
- Both operations must be O(1) on average.

You may use a Map (it keeps insertion order) or build a doubly linked list + hash map. Add a short comment explaining why your approach is O(1).
`,
    [
      c("get", "get returns correct values and refreshes recency", 3),
      c("put", "put updates existing keys and evicts the least recently used key", 3),
      c("complexity", "Both operations are O(1) average, explained in a comment", 2),
      c("tests", "All sample calls print the expected output", 2),
    ],
    `
class LRUCache {
  constructor(capacity) {
    // your code here
  }

  get(key) {
    // your code here
  }

  put(key, value) {
    // your code here
  }
}

const cache = new LRUCache(2);
cache.put(1, "one");
cache.put(2, "two");
console.log(cache.get(1)); // "one"
cache.put(3, "three"); // evicts key 2
console.log(cache.get(2)); // -1
cache.put(1, "ONE"); // update, 1 is most recent
cache.put(4, "four"); // evicts key 3
console.log(cache.get(3), cache.get(1), cache.get(4)); // -1 "ONE" "four"
`,
  ),

  // ---------------------------------------------------------- typescript
  task(
    "typescript",
    "Model a student record with interfaces",
    "EASY",
    `
Write TypeScript types for a placement portal student:

- id (number, read-only), name, email, branch (only "CSE", "ECE", "ME" or "CIVIL"), cgpa (number), an optional linkedIn URL, and skills (array of strings).
- A function describe(student) that returns a string like "Asha (CSE) – 8.4 CGPA, 3 skills".
- A function isEligible(student, minCgpa) that returns a boolean.

Show one valid student object, and one line (commented out) that would fail to compile and why.
`,
    [
      c("interface", "Interface/type with readonly id, optional linkedIn and string array", 4),
      c("union", "Branch is a string literal union (or enum), not plain string", 2),
      c("functions", "Both functions have typed parameters and return types", 2),
      c("example", "Valid example plus a commented compile error with a reason", 2),
    ],
    `
// Branch type here

interface Student {
  // your fields here
}

function describe(student: Student): string {
  // your code here
}

function isEligible(student: Student, minCgpa: number): boolean {
  // your code here
}
`,
  ),
  task(
    "typescript",
    "Write generic utility functions",
    "EASY",
    `
Write these generic functions with no any:

- first<T>(arr: T[]): returns the first element, or undefined for an empty array.
- pluck(items, key): returns an array of the values of key from each item. The key must be a real key of the item type, and the return type must follow from it (e.g. pluck(users, "age") is number[]).
- toMap(items, key): builds a Map from the value of key to the item.

Show calls that prove the inferred types (e.g. in comments).
`,
    [
      c("first", "first<T> correctly typed with T | undefined return", 2),
      c("pluck", "pluck uses K extends keyof T and returns T[K][]", 4),
      c("tomap", "toMap returns Map<T[K], T>", 2),
      c("noany", "No any; example calls show the inferred types", 2),
    ],
    `
interface User {
  id: number;
  name: string;
  age: number;
}

const users: User[] = [
  { id: 1, name: "Asha", age: 21 },
  { id: 2, name: "Rohit", age: 22 },
];

// first, pluck and toMap here
`,
  ),
  task(
    "typescript",
    "Use utility types for a job posting model",
    "MEDIUM",
    `
Start from the JobPosting interface in the starter. Using built-in utility types (no copy-pasting fields), define:

- NewJob: what a recruiter sends to create a job – everything except id and createdAt.
- JobUpdate: id is required, every other field except createdAt is optional.
- JobSummary: only id, title and company.
- JobsByStatus: an object with a key for every status, each holding JobPosting[].
- A function applyUpdate(job: JobPosting, update: JobUpdate): JobPosting that returns a new object.

Add one comment per type saying which utility types you used and why.
`,
    [
      c("omit", "NewJob uses Omit correctly", 2),
      c("update", "JobUpdate combines Pick/Partial/Omit so only id is required", 3),
      c("pick-record", "JobSummary uses Pick; JobsByStatus uses Record over the status union", 3),
      c("function", "applyUpdate is typed and returns a new object without mutating", 2),
    ],
    `
type JobStatus = "open" | "closed" | "draft";

interface JobPosting {
  id: string;
  title: string;
  company: string;
  ctcLpa: number;
  status: JobStatus;
  createdAt: Date;
}

// your types here

function applyUpdate(job: JobPosting, update: JobUpdate): JobPosting {
  // your code here
}
`,
  ),
  task(
    "typescript",
    "Build a type-safe event emitter",
    "HARD",
    `
Write a generic class TypedEmitter<Events> where Events maps event names to payload types, for example:

- "login": { userId: string }
- "logout": undefined
- "score": { test: string; marks: number }

It needs on(event, handler), off(event, handler) and emit(event, payload). The compiler must reject a wrong event name, a wrong payload type, or a handler expecting the wrong payload. on should return a function that unsubscribes.

Show 3 correct calls and 2 commented-out calls that should fail to compile. No any.
`,
    [
      c("generic", "Class is generic over an event map with K extends keyof Events", 3),
      c("handlers", "Handlers are typed as (payload: Events[K]) => void and stored safely", 3),
      c("methods", "on/off/emit work at runtime and on returns an unsubscribe function", 2),
      c("proof", "Correct calls plus commented compile errors; no any", 2),
    ],
    `
type AppEvents = {
  login: { userId: string };
  logout: undefined;
  score: { test: string; marks: number };
};

class TypedEmitter<Events> {
  // your code here
}

const emitter = new TypedEmitter<AppEvents>();
`,
  ),

  // --------------------------------------------------------------- react
  task(
    "react",
    "Build a counter with a step input",
    "EASY",
    `
Write a React function component Counter that shows:

- The current count (starting at 0) with + and – buttons.
- A number input "Step" (default 1) that controls how much each click adds or subtracts.
- A Reset button that sets the count back to 0.
- The – button is disabled when the count would go below 0.

Use the functional form of the state setter when updating from the previous value.
`,
    [
      c("state", "useState for count and step; functional updates for count", 3),
      c("input", "Controlled step input, converted to a number", 3),
      c("buttons", "+, – and Reset work as described", 2),
      c("disabled", "– is disabled when count - step < 0", 2),
    ],
    `
import { useState } from "react";

export default function Counter() {
  // your code here
  return (
    <div>
      {/* your UI here */}
    </div>
  );
}
`,
  ),
  task(
    "react",
    "Render a searchable job list from props",
    "EASY",
    `
Write a component JobList that receives a jobs prop: an array of { id, title, company, ctcLpa }.

- Render each job as a card using a separate JobCard component that receives props.
- Add a search input that filters jobs by title or company (case-insensitive).
- Show "No jobs found" when nothing matches.
- Highlight jobs with ctcLpa of 10 or more with a "High package" badge.
`,
    [
      c("components", "Separate JobCard component receiving props", 2),
      c("list", "Maps the array with key={job.id}", 2),
      c("filter", "Controlled search input; filtering is derived, not stored in extra state", 3),
      c("conditional", "Empty state message and the conditional badge", 3),
    ],
    `
import { useState } from "react";

function JobCard({ job }) {
  // your code here
}

export default function JobList({ jobs }) {
  // your code here
}
`,
  ),
  task(
    "react",
    "Fetch users with loading and error states",
    "MEDIUM",
    `
Write a component UserDirectory that fetches users from https://jsonplaceholder.typicode.com/users when it mounts and shows their name and email.

- Show "Loading..." while fetching, and an error message with a Retry button if the request fails (including non-2xx responses).
- Add a select to sort by name A–Z or Z–A.
- Avoid setting state after the component unmounts (use AbortController in the effect cleanup).
- Don't put derived data (the sorted list) in state.
`,
    [
      c("effect", "useEffect with the right dependencies fetches the data", 3),
      c("states", "Loading, error (checks response.ok) and Retry all handled", 3),
      c("cleanup", "AbortController cleanup prevents updates after unmount", 2),
      c("derived", "Sorting is derived during render without mutating state", 2),
    ],
    `
import { useEffect, useState } from "react";

export default function UserDirectory() {
  // your code here
}
`,
  ),
  task(
    "react",
    "Build a shopping cart with useReducer and context",
    "HARD",
    `
Build a small course-store cart:

- A cartReducer handling ADD_ITEM (increments quantity if the item exists), REMOVE_ITEM, CHANGE_QTY (removes the item at 0) and CLEAR.
- A CartContext + CartProvider that exposes the state and action helpers, and a useCart() hook that throws if used outside the provider.
- A CourseList component with 3 hard-coded courses and "Add to cart" buttons.
- A Cart component showing items, quantity +/- buttons, the total price (computed, not stored) and a Clear button.
- An App that wires it together.

The reducer must be pure (no mutation).
`,
    [
      c("reducer", "Pure reducer handling all 4 actions correctly", 3),
      c("context", "Provider plus a useCart hook that guards against a missing provider", 3),
      c("ui", "CourseList and Cart components work with quantities and keys", 2),
      c("derived", "Total is derived from state; no duplicated state", 2),
    ],
    `
import { createContext, useContext, useReducer } from "react";

const CartContext = createContext(null);

function cartReducer(state, action) {
  // your code here
}

export function CartProvider({ children }) {
  // your code here
}

export function useCart() {
  // your code here
}

// CourseList, Cart and App here
`,
  ),
];
