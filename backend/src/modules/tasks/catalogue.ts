import type { Difficulty } from "../../generated/prisma/client.js";
import type { RubricCriterion } from "./tasks.logic.js";

/**
 * Practical tasks, seeded into `practical_tasks` by prisma/seed.ts (matched by
 * skill + title, so re-seeding is safe). One small hands-on task per skill:
 * the student writes code or a short answer, and the AI scores it against
 * the rubric (tasks.logic.ts). Rubric points are integers and should total 10.
 * Descriptions use the same light formatting as hosted notes: blank line =
 * new paragraph, "- " = list item, ``` fences = code.
 */
export interface CatalogueTask {
  skill: string;
  title: string;
  difficulty: Difficulty;
  description: string;
  rubric: RubricCriterion[];
}

const task = (
  skill: string,
  title: string,
  difficulty: Difficulty,
  description: string,
  rubric: RubricCriterion[],
): CatalogueTask => ({ skill, title, difficulty, description: description.trim(), rubric });

const c = (id: string, description: string, points: number): RubricCriterion => ({
  id,
  description,
  points,
});

export const TASK_CATALOGUE: CatalogueTask[] = [
  // Web development
  task(
    "html",
    "Build an accessible signup form",
    "EASY",
    `
Write the HTML (no CSS needed) for a signup form with: full name, email, password, a "year of study" dropdown (1–4), a checkbox to accept the terms, and a submit button.

- Every input needs a proper label.
- Use the right input types and built-in validation attributes.
- Group the form semantically.
`,
    [
      c("labels", "Every control has an associated <label> (for/id or wrapping)", 3),
      c("types", "Correct input types (email, password) and a <select> for the year", 3),
      c("validation", "Uses built-in validation such as required, minlength", 2),
      c(
        "semantics",
        "Valid, semantic structure (form, button type=submit, fieldset/legend or similar)",
        2,
      ),
    ],
  ),
  task(
    "css",
    "Centre a card and make a responsive grid",
    "MEDIUM",
    `
Write the CSS for:

- A .card that is centred horizontally and vertically on the page, with a max width of 400px.
- A .grid that shows items in 3 columns on wide screens, 2 under 900px and 1 under 600px, with a 16px gap.

Use flexbox and/or grid. Show the HTML class names you assume.
`,
    [
      c("centre", "The card is centred both ways with flexbox or grid", 3),
      c("grid", "The grid uses CSS grid or flexbox with a gap", 3),
      c(
        "responsive",
        "Media queries (or auto-fit/minmax) give 3 → 2 → 1 columns at the right widths",
        3,
      ),
      c("clean", "Readable CSS without unnecessary hacks", 1),
    ],
  ),
  task(
    "javascript",
    "Debounce a search box",
    "MEDIUM",
    `
Write a function debounce(fn, delay) that returns a new function. Calling the new function repeatedly should only run fn once, delay milliseconds after the last call, with the latest arguments.

Then show how you'd use it on an input's "input" event so a search runs 300ms after the user stops typing.
`,
    [
      c("timer", "Clears the previous timer and sets a new one on every call", 4),
      c("args", "Passes the latest arguments (and this) to fn", 2),
      c("usage", "Correct usage with addEventListener on an input", 2),
      c("explain", "Brief explanation of why debouncing helps", 2),
    ],
  ),
  task(
    "typescript",
    "Type an API response",
    "MEDIUM",
    `
An API returns either { status: "ok", data: User[] } or { status: "error", message: string }. A User has an id (number), name (string) and an optional email.

- Write the types.
- Write a function getNames(res) that returns the users' names, or throws an Error with the message when the status is "error".

No any.
`,
    [
      c(
        "types",
        "A User type with an optional email, and a discriminated union for the response",
        4,
      ),
      c("narrowing", "Narrows on status so data/message are only used when they exist", 3),
      c("function", "getNames is correctly typed and returns string[]", 2),
      c("noany", "No any or unnecessary type assertions", 1),
    ],
  ),
  task(
    "react",
    "A todo list component",
    "MEDIUM",
    `
Write a React function component TodoList that lets the user add a todo from a text input, mark todos done (strike-through), and delete them. Keep the state in the component.
`,
    [
      c("state", "Uses useState and updates state immutably", 3),
      c("keys", "Renders the list with stable, unique keys (not the array index)", 2),
      c("events", "Controlled input; add, toggle and delete all work", 3),
      c("edge", "Ignores empty todos and clears the input after adding", 2),
    ],
  ),
  task(
    "nodejs",
    "Count words in a file",
    "EASY",
    `
Write a Node.js script that reads a text file (path from the command line), counts how many times each word appears (case-insensitive), and prints the 5 most common words with their counts.

Handle a missing file with a clear error message.
`,
    [
      c("read", "Reads the file with the fs module, using the path from process.argv", 2),
      c("count", "Normalises case, splits into words and counts them in an object or Map", 3),
      c("top", "Sorts by count and prints the top 5", 3),
      c("errors", "Handles a missing file or argument with a clear message", 2),
    ],
  ),
  task(
    "expressjs",
    "A small notes API",
    "MEDIUM",
    `
Using Express, write an in-memory notes API:

- GET /notes — list notes
- POST /notes — create a note from { title, body }; reject a missing title
- DELETE /notes/:id — delete a note; 404 if it doesn't exist

Use proper status codes.
`,
    [
      c("routes", "All three routes defined with the right methods and paths", 3),
      c("json", "Parses JSON bodies (express.json) and returns JSON", 2),
      c("validation", "Rejects a missing title with 400", 2),
      c(
        "status",
        "Correct status codes: 201 on create, 404 for an unknown id, 204 or 200 on delete",
        3,
      ),
    ],
  ),
  task(
    "rest-apis",
    "Design a REST API for a library",
    "MEDIUM",
    `
Design the endpoints for a library app where users can browse books, borrow a book and return it. For each endpoint give the method, path, a short description, and the success and error status codes.

Explain one design choice you made.
`,
    [
      c("resources", "Resource-oriented paths (nouns, plural), not verbs in URLs", 3),
      c("methods", "Correct HTTP methods for reading, creating and updating", 3),
      c(
        "status",
        "Sensible status codes, including errors (404, 409 for an already-borrowed book, etc.)",
        3,
      ),
      c("reasoning", "Explains a design choice clearly", 1),
    ],
  ),

  // Programming languages
  task(
    "python",
    "Group anagrams",
    "MEDIUM",
    `
Write a Python function group_anagrams(words) that groups words that are anagrams of each other.

Example: ["eat", "tea", "tan", "ate", "nat", "bat"] → [["eat", "tea", "ate"], ["tan", "nat"], ["bat"]] (order doesn't matter).

State the time complexity.
`,
    [
      c("approach", "Uses a dict keyed by sorted letters or letter counts", 4),
      c("correct", "Returns the right groups for the example", 3),
      c("pythonic", "Idiomatic Python (defaultdict, comprehensions where sensible)", 1),
      c("complexity", "States the time complexity correctly", 2),
    ],
  ),
  task(
    "java",
    "A bank account class",
    "EASY",
    `
Write a Java class BankAccount with a private balance, a constructor, deposit(amount) and withdraw(amount) methods, and getBalance().

- Reject non-positive amounts.
- Don't allow withdrawing more than the balance — throw an exception.
`,
    [
      c("encapsulation", "Private field with public methods; no public setter for balance", 3),
      c("validation", "Rejects zero or negative amounts", 2),
      c("exception", "Throws a suitable exception on overdraw", 3),
      c("style", "Compiles and follows Java naming conventions", 2),
    ],
  ),
  task(
    "c",
    "Reverse a string in place",
    "EASY",
    `
Write a C function void reverse(char *s) that reverses a null-terminated string in place, without using another array or library reverse functions. Include a small main() that tests it.
`,
    [
      c("pointers", "Uses two indices or pointers swapping from both ends", 4),
      c("bounds", "Handles the null terminator and empty strings correctly", 3),
      c("test", "A main() that calls it and prints the result", 2),
      c("compiles", "Valid C", 1),
    ],
  ),
  task(
    "cpp",
    "Frequency of elements with STL",
    "EASY",
    `
Write a C++ program that reads n integers and prints each distinct value with how many times it appears, in increasing order of value. Use the STL.
`,
    [
      c("container", "Uses std::map (or sort + count) appropriately", 4),
      c("io", "Reads n and the values correctly", 2),
      c("order", "Output is in increasing order of value", 2),
      c("modern", "Clean, modern C++ (range-for, no memory leaks)", 2),
    ],
  ),

  // CS fundamentals
  task(
    "dsa",
    "Two sum, faster than O(n²)",
    "MEDIUM",
    `
Given an array of integers and a target, return the indices of the two numbers that add up to the target. Assume exactly one answer exists.

Write the code in any language, then explain the time and space complexity of your approach and why it beats checking every pair.
`,
    [
      c(
        "approach",
        "Uses a hash map (value → index) in a single pass, or sorting with two pointers",
        4,
      ),
      c("correct", "Returns correct indices and doesn't use the same element twice", 3),
      c("complexity", "Correct time and space complexity", 2),
      c("explain", "Explains why it beats O(n²)", 1),
    ],
  ),
  task(
    "oop",
    "Model a parking lot",
    "MEDIUM",
    `
Sketch the classes for a parking lot that has spots for bikes, cars and buses. A vehicle can park in a spot of its size or larger. Show the classes, their key fields and methods, and how a vehicle gets parked.

Code or a clear class outline both work.
`,
    [
      c("classes", "Sensible classes (Vehicle subtypes, Spot, Level/Lot)", 3),
      c("pillars", "Uses inheritance or interfaces and encapsulation appropriately", 3),
      c("logic", "Parking logic finds a fitting free spot", 3),
      c("clarity", "Clear and easy to follow", 1),
    ],
  ),
  task(
    "operating-systems",
    "Explain a deadlock",
    "MEDIUM",
    `
In your own words:

- What is a deadlock? Give a concrete example with two processes and two resources.
- List the four conditions that must all hold for a deadlock.
- Describe one way to prevent it and one way to recover from it.
`,
    [
      c("definition", "Correct definition with a concrete two-process example", 3),
      c("conditions", "All four Coffman conditions named and explained", 4),
      c("handling", "A valid prevention method and a valid recovery method", 3),
    ],
  ),
  task(
    "computer-networks",
    "What happens when you open a URL",
    "MEDIUM",
    `
Explain, step by step, what happens between typing https://example.com into a browser and seeing the page. Cover DNS, the connection, TLS, the HTTP request and response, and rendering.
`,
    [
      c("dns", "DNS resolution (cache, resolver, IP address)", 2),
      c("tcp", "TCP connection (handshake) to port 443", 2),
      c("tls", "TLS handshake and why it matters", 2),
      c("http", "HTTP request and response with status code", 2),
      c("render", "Browser parses HTML and fetches further resources", 2),
    ],
  ),
  task(
    "dbms",
    "Normalise a table",
    "MEDIUM",
    `
A college stores everything in one table:

Enrolment(student_id, student_name, course_id, course_name, teacher_name, teacher_phone, grade)

- Name the problems (anomalies) this design causes.
- Split it into tables in 3NF. Give each table's columns and primary key.
`,
    [
      c("anomalies", "Identifies update, insert and delete anomalies", 2),
      c("tables", "Separate Student, Course, Teacher and Enrolment tables (or equivalent)", 4),
      c("keys", "Correct primary keys and foreign keys", 2),
      c("3nf", "No transitive dependencies remain (e.g. teacher_phone not in Course)", 2),
    ],
  ),
  task(
    "sql",
    "Top earners per department",
    "MEDIUM",
    `
Given tables employees(id, name, salary, department_id) and departments(id, name), write SQL queries for:

- The average salary per department name, highest first.
- The highest-paid employee in each department (name, department, salary).
`,
    [
      c("join", "Correct JOIN between employees and departments", 2),
      c("group", "GROUP BY with AVG and ORDER BY for the first query", 3),
      c("top", "Correct top-per-group query (window function or correlated subquery)", 4),
      c("syntax", "Valid SQL", 1),
    ],
  ),
  task(
    "mongodb",
    "Query and aggregate orders",
    "MEDIUM",
    `
An orders collection has documents like { customer: "asha", items: [{ name, price, qty }], status: "delivered", createdAt }.

Write MongoDB queries to:

- Find all delivered orders from the last 30 days.
- Compute total revenue (price × qty) per customer, highest first, using an aggregation pipeline.
`,
    [
      c("find", "Correct find filter on status and date", 3),
      c("unwind", "Uses $unwind (or $reduce) to work with items", 2),
      c("group", "$group by customer with a correct revenue sum", 3),
      c("sort", "Sorts revenue descending", 2),
    ],
  ),
  task(
    "system-design",
    "Design a URL shortener",
    "HARD",
    `
Design a URL shortener like bit.ly. Cover:

- The API (create a short link, redirect).
- How you generate short codes and avoid collisions.
- The data model and the database you'd pick.
- How you'd handle lots of redirects (caching) and roughly how much storage a year of links needs.
`,
    [
      c("api", "Clear API for create and redirect (301/302)", 2),
      c(
        "codes",
        "A sound code-generation scheme (base62 counter, hashing with collision handling)",
        3,
      ),
      c("data", "Reasonable data model and storage choice with a justification", 2),
      c("scale", "Caching for reads and a rough capacity estimate", 3),
    ],
  ),

  // Tools
  task(
    "git",
    "Fix a messy branch",
    "MEDIUM",
    `
You committed two features to main by mistake, and your teammate has pushed new commits to the remote main since. Write the git commands (with a one-line explanation each) to:

- Move your two commits onto a new branch feature/login.
- Bring main back in line with the remote.
- Update feature/login with the latest main and push it for a pull request.
`,
    [
      c("branch", "Creates the feature branch from the current commit before resetting main", 3),
      c("reset", "Resets main to origin/main safely (fetch first)", 3),
      c("update", "Rebases or merges main into the feature branch", 2),
      c("push", "Pushes the branch with upstream set", 2),
    ],
  ),
  task(
    "linux",
    "Find the biggest log files",
    "EASY",
    `
Write shell commands to:

- Find all .log files under /var/log larger than 10 MB.
- Show the 5 largest files in the current directory tree, with human-readable sizes.
- Count how many lines in app.log contain "ERROR".
`,
    [
      c("find", "Correct find with -name and -size", 4),
      c("largest", "du/ls/sort/head pipeline that lists the top 5 with readable sizes", 3),
      c("grep", "grep -c (or grep | wc -l) for the error count", 3),
    ],
  ),

  // Data
  task(
    "excel",
    "Sales summary formulas",
    "EASY",
    `
A sheet has columns A: Date, B: Region, C: Product, D: Units, E: Price. Write the formulas for:

- Revenue for each row (in column F).
- Total revenue for the "North" region.
- The price of a product looked up by its name in another sheet called Prices (name in A, price in B).

Say which cells the formulas go in.
`,
    [
      c("row", "Row revenue formula with relative references", 2),
      c("sumif", "SUMIF/SUMIFS for the region total", 4),
      c("lookup", "XLOOKUP, VLOOKUP or INDEX/MATCH with an exact match", 4),
    ],
  ),
  task(
    "data-analysis-python",
    "Clean and summarise a CSV",
    "MEDIUM",
    `
Using pandas, write code that loads sales.csv (columns: date, city, amount), drops rows with a missing amount, converts date to a datetime, and prints:

- Total amount per city, highest first.
- Total amount per month.
`,
    [
      c("load", "Reads the CSV and handles missing values", 2),
      c("dates", "Converts the date column with pd.to_datetime", 2),
      c("groupby", "groupby city with sum and sort_values descending", 3),
      c("monthly", "Monthly totals via resample, dt.to_period or Grouper", 3),
    ],
  ),
  task(
    "machine-learning",
    "Train and evaluate a classifier",
    "MEDIUM",
    `
With scikit-learn, write code that trains a classifier on the built-in iris dataset:

- Split into train and test sets.
- Train a model of your choice.
- Report accuracy on the test set.

Then explain in two or three sentences why you must evaluate on data the model didn't train on.
`,
    [
      c("split", "Uses train_test_split with a held-out test set", 3),
      c("train", "Fits a reasonable model correctly", 3),
      c("metric", "Computes test accuracy", 2),
      c("overfit", "Explains overfitting/generalisation correctly", 2),
    ],
  ),
  task(
    "cloud-basics",
    "Pick the right cloud services",
    "EASY",
    `
A student team wants to host a web app: a React frontend, a Node.js API and a PostgreSQL database, on a near-zero budget.

- Suggest where each part could run (any provider), and say whether each choice is IaaS, PaaS or SaaS.
- Explain one advantage of the cloud over running a server in the college lab.
`,
    [
      c("choices", "Sensible hosting choices for all three parts", 4),
      c("models", "Correctly classifies each as IaaS, PaaS or SaaS", 4),
      c("advantage", "A valid advantage (scaling, availability, no hardware upkeep)", 2),
    ],
  ),

  // Aptitude
  task(
    "quantitative-aptitude",
    "Three word problems, with working",
    "MEDIUM",
    `
Solve these and show your working:

- A and B can finish a job in 12 and 18 days. How long do they take working together?
- A shopkeeper marks an item 40% above cost and gives a 25% discount. What is the profit or loss percent?
- A train 150 m long passes a pole in 10 seconds. How long does it take to cross a 250 m platform?
`,
    [
      c("work", "7.2 days, with correct working", 3),
      c("profit", "5% profit, with correct working", 4),
      c("train", "About 26.7 seconds (400 m at 15 m/s), with correct working", 3),
    ],
  ),
  task(
    "logical-reasoning",
    "Seating arrangement",
    "MEDIUM",
    `
Five friends — A, B, C, D and E — sit in a row facing north.

- C sits in the middle.
- A sits to the immediate left of C.
- B sits at the right end.
- D is not at an end.

Work out the order from left to right and explain each step of your reasoning.
`,
    [
      c("answer", "Correct order: E A C D B", 5),
      c("steps", "Each clue is applied in a logical order", 3),
      c("check", "Verifies the final arrangement against every clue", 2),
    ],
  ),
  task(
    "verbal-ability",
    "Fix the sentences",
    "EASY",
    `
Correct each sentence and say what the error was:

- "Each of the students have submitted their assignment."
- "I am working in this company since 2024."
- "He is more smarter than his brother."
- "Please revert back to me with the details."
`,
    [
      c("agreement", "Each … has submitted (subject–verb agreement)", 3),
      c("tense", "I have been working … since 2024 (present perfect continuous)", 3),
      c("comparative", "smarter, not more smarter (double comparative)", 2),
      c(
        "redundancy",
        "Please reply to me / get back to me (revert back is redundant/incorrect)",
        2,
      ),
    ],
  ),
  task(
    "data-interpretation",
    "Read a sales table",
    "MEDIUM",
    `
A company's sales (in ₹ lakh) were: 2022 — 120, 2023 — 150, 2024 — 135, 2025 — 180.

- What was the percentage growth from 2022 to 2025?
- In which year was the year-on-year growth highest, and what was it?
- What was the average sales over the four years?

Show your working.
`,
    [
      c("growth", "50% growth from 2022 to 2025", 3),
      c("yoy", "2025, at about 33.3%", 4),
      c("average", "Average of 146.25", 3),
    ],
  ),

  // Soft skills
  task(
    "communication",
    "Write your 'tell me about yourself'",
    "EASY",
    `
Write the answer you'd give to "Tell me about yourself" in a placement interview for your target role. Keep it to about 150 words — roughly one minute spoken.
`,
    [
      c(
        "structure",
        "Clear order: present (studies), past (projects/experience), future (why this role)",
        4,
      ),
      c("specific", "Mentions concrete skills or projects, not just adjectives", 3),
      c("relevance", "Connected to the role they're applying for", 2),
      c("length", "Concise — about a minute spoken", 1),
    ],
  ),
  task(
    "teamwork",
    "A team conflict, STAR style",
    "EASY",
    `
Describe a time you disagreed with a teammate on a project (college, hackathon, club or internship) and how it was resolved. Use the STAR format: Situation, Task, Action, Result.
`,
    [
      c("star", "Follows the STAR structure", 3),
      c("action", "Focuses on what they personally did to resolve it", 4),
      c("respect", "Shows listening and respect for the other person's view", 2),
      c("result", "Clear outcome or lesson", 1),
    ],
  ),
  task(
    "problem-solving",
    "Think through a vague problem",
    "MEDIUM",
    `
Your college's online fee-payment page is "slow", according to students. You've been asked to find out why. Describe how you'd approach it step by step: what you'd ask, what you'd measure, the likely causes you'd check, and how you'd confirm the fix worked.
`,
    [
      c("clarify", "Clarifies the problem first (who, when, how slow)", 3),
      c("measure", "Measures before guessing (timings, logs, browser dev tools)", 3),
      c(
        "causes",
        "Considers several plausible causes (server, database, network, payment gateway)",
        2,
      ),
      c("verify", "Confirms the fix with the same measurement", 2),
    ],
  ),
  task(
    "time-management",
    "Plan a crowded week",
    "EASY",
    `
This week you have: two mid-semester exams (Wednesday and Friday), a group project demo on Thursday, and you want to keep up 30 minutes of DSA practice a day. Write your plan for Monday to Saturday and explain how you prioritised.
`,
    [
      c("priorities", "Prioritises by deadline and importance with a clear reason", 4),
      c("realistic", "Realistic time blocks, including rest", 3),
      c("buffer", "Leaves buffer time and handles the overlap around Thursday", 3),
    ],
  ),
  task(
    "leadership",
    "Taking ownership",
    "EASY",
    `
Describe a time you took the lead on something without being asked — in a project, club, event or class. What did you do, how did you get others on board, and what was the result? Use the STAR format.
`,
    [
      c("initiative", "Shows them stepping up without being asked", 3),
      c("people", "Explains how they got others to cooperate", 3),
      c("star", "Clear STAR structure with a result", 3),
      c("reflection", "Reflects on what they learned", 1),
    ],
  ),
  task(
    "workplace-etiquette",
    "Write a professional email",
    "EASY",
    `
You have an interview at 11 am tomorrow, but your college has just scheduled a compulsory exam at the same time. Write the email to the recruiter asking to reschedule.
`,
    [
      c("subject", "Clear subject line", 2),
      c("tone", "Polite, professional tone and a proper greeting and sign-off", 3),
      c("content", "Explains the reason briefly and offers alternative times", 3),
      c("concise", "Short and free of errors", 2),
    ],
  ),
];
