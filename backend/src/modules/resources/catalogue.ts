import type { ResourceType } from "../../generated/prisma/client.js";

/**
 * Curated learning resources, seeded into `learning_resources` by
 * prisma/seed.ts (matched by skill + title, so re-seeding is safe). Served for
 * any skill a student scores below the pass mark on (PRD-01 §3.5), so a gap
 * always comes with material to fix it. Each entry has either a `url` (an
 * outside site — stick to official docs and long-lived tutorial sites) or
 * `content` (short notes hosted by us; blank line = new paragraph, "- " = list).
 * Admins can add and edit resources from the admin panel; this file is the
 * starting set.
 */
export interface CatalogueResource {
  skill: string;
  title: string;
  type: ResourceType;
  source: string;
  url?: string;
  content?: string;
}

const link = (
  skill: string,
  title: string,
  type: ResourceType,
  source: string,
  url: string,
): CatalogueResource => ({ skill, title, type, source, url });

const note = (skill: string, title: string, content: string): CatalogueResource => ({
  skill,
  title,
  type: "REFERENCE",
  source: "PrepSuccess",
  content: content.trim(),
});

export const RESOURCE_CATALOGUE: CatalogueResource[] = [
  // Web development
  link(
    "html",
    "HTML reference and guides",
    "REFERENCE",
    "MDN",
    "https://developer.mozilla.org/en-US/docs/Web/HTML",
  ),
  link(
    "html",
    "HTML tutorial with try-it examples",
    "EXAMPLE",
    "W3Schools",
    "https://www.w3schools.com/html/",
  ),
  link(
    "css",
    "CSS reference and guides",
    "REFERENCE",
    "MDN",
    "https://developer.mozilla.org/en-US/docs/Web/CSS",
  ),
  link(
    "css",
    "CSS tutorial with try-it examples",
    "EXAMPLE",
    "W3Schools",
    "https://www.w3schools.com/css/",
  ),
  link(
    "css",
    "A complete guide to flexbox",
    "REFERENCE",
    "CSS-Tricks",
    "https://css-tricks.com/snippets/css/a-guide-to-flexbox/",
  ),
  link(
    "javascript",
    "The Modern JavaScript Tutorial",
    "LECTURE",
    "javascript.info",
    "https://javascript.info/",
  ),
  link(
    "javascript",
    "JavaScript guide",
    "REFERENCE",
    "MDN",
    "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
  ),
  link(
    "javascript",
    "JavaScript tutorial with try-it examples",
    "EXAMPLE",
    "W3Schools",
    "https://www.w3schools.com/js/",
  ),
  link(
    "typescript",
    "The TypeScript handbook",
    "REFERENCE",
    "typescriptlang.org",
    "https://www.typescriptlang.org/docs/handbook/intro.html",
  ),
  link(
    "typescript",
    "TypeScript tutorial with exercises",
    "PRACTICE",
    "W3Schools",
    "https://www.w3schools.com/typescript/",
  ),
  link("react", "Learn React (official)", "LECTURE", "react.dev", "https://react.dev/learn"),
  link(
    "react",
    "React tutorial with examples",
    "EXAMPLE",
    "W3Schools",
    "https://www.w3schools.com/react/",
  ),
  link(
    "nodejs",
    "Introduction to Node.js (official)",
    "LECTURE",
    "nodejs.org",
    "https://nodejs.org/en/learn/getting-started/introduction-to-nodejs",
  ),
  link(
    "nodejs",
    "Node.js tutorial with examples",
    "EXAMPLE",
    "W3Schools",
    "https://www.w3schools.com/nodejs/",
  ),
  link(
    "expressjs",
    "Express routing guide (official)",
    "REFERENCE",
    "expressjs.com",
    "https://expressjs.com/en/guide/routing.html",
  ),
  link(
    "expressjs",
    "Writing and using middleware",
    "REFERENCE",
    "expressjs.com",
    "https://expressjs.com/en/guide/using-middleware.html",
  ),
  link(
    "rest-apis",
    "An overview of HTTP",
    "REFERENCE",
    "MDN",
    "https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview",
  ),
  link(
    "rest-apis",
    "HTTP request methods",
    "REFERENCE",
    "MDN",
    "https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods",
  ),
  link(
    "rest-apis",
    "HTTP response status codes",
    "REFERENCE",
    "MDN",
    "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status",
  ),

  // Programming languages
  link(
    "python",
    "The Python tutorial (official)",
    "LECTURE",
    "python.org",
    "https://docs.python.org/3/tutorial/",
  ),
  link(
    "python",
    "Python tutorial with exercises",
    "PRACTICE",
    "W3Schools",
    "https://www.w3schools.com/python/",
  ),
  link("java", "Learn Java (official)", "LECTURE", "dev.java", "https://dev.java/learn/"),
  link(
    "java",
    "Java tutorial with exercises",
    "PRACTICE",
    "W3Schools",
    "https://www.w3schools.com/java/",
  ),
  link("c", "C tutorial with exercises", "PRACTICE", "W3Schools", "https://www.w3schools.com/c/"),
  link("c", "Interactive C tutorial", "PRACTICE", "learn-c.org", "https://www.learn-c.org/"),
  link(
    "cpp",
    "Learn C++, chapter by chapter",
    "LECTURE",
    "learncpp.com",
    "https://www.learncpp.com/",
  ),
  link(
    "cpp",
    "C++ tutorial with exercises",
    "PRACTICE",
    "W3Schools",
    "https://www.w3schools.com/cpp/",
  ),

  // CS fundamentals
  link(
    "dsa",
    "DSA tutorial with visual examples",
    "EXAMPLE",
    "W3Schools",
    "https://www.w3schools.com/dsa/",
  ),
  link(
    "dsa",
    "Visualise data structures and algorithms",
    "EXAMPLE",
    "VisuAlgo",
    "https://visualgo.net/en",
  ),
  link("dsa", "Problem roadmap by topic", "PRACTICE", "NeetCode", "https://neetcode.io/roadmap"),
  link(
    "oop",
    "Classes (Python tutorial)",
    "REFERENCE",
    "python.org",
    "https://docs.python.org/3/tutorial/classes.html",
  ),
  link(
    "oop",
    "Java OOP: classes, inheritance, polymorphism",
    "EXAMPLE",
    "W3Schools",
    "https://www.w3schools.com/java/java_oop.asp",
  ),
  note(
    "oop",
    "The four pillars, in one page",
    `
Interviewers ask about OOP to see whether you can design code, not just define words. Know each pillar with a one-line definition and an example from your own projects.

- Encapsulation: keep an object's data private and expose methods to change it safely. Example: a BankAccount with a private balance and deposit()/withdraw() methods that validate amounts.
- Abstraction: show what an object does, hide how. Example: a PaymentGateway interface with pay(); callers don't care whether it's UPI or card.
- Inheritance: a class reuses and extends another. Example: SavingsAccount extends BankAccount and adds interest. Prefer composition when "is-a" doesn't really hold.
- Polymorphism: one call, different behaviour depending on the object. Example: shape.area() works for Circle and Rectangle. Know overloading (compile time) vs overriding (run time).

Common follow-ups: abstract class vs interface, why multiple inheritance is restricted in Java, and what SOLID's single-responsibility principle means in practice.
`,
  ),
  link(
    "operating-systems",
    "Operating Systems: Three Easy Pieces (free book)",
    "LECTURE",
    "OSTEP",
    "https://pages.cs.wisc.edu/~remzi/OSTEP/",
  ),
  link(
    "operating-systems",
    "The Missing Semester of your CS education",
    "LECTURE",
    "MIT",
    "https://missing.csail.mit.edu/",
  ),
  link(
    "computer-networks",
    "What is DNS?",
    "REFERENCE",
    "Cloudflare Learning",
    "https://www.cloudflare.com/learning/dns/what-is-dns/",
  ),
  link(
    "computer-networks",
    "What is the network layer?",
    "REFERENCE",
    "Cloudflare Learning",
    "https://www.cloudflare.com/learning/network-layer/what-is-the-network-layer/",
  ),
  link(
    "computer-networks",
    "An overview of HTTP",
    "REFERENCE",
    "MDN",
    "https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview",
  ),
  link(
    "dbms",
    "PostgreSQL tutorial: concepts and transactions",
    "LECTURE",
    "postgresql.org",
    "https://www.postgresql.org/docs/current/tutorial.html",
  ),
  link(
    "dbms",
    "Database systems course (lectures and notes)",
    "LECTURE",
    "CMU 15-445",
    "https://15445.courses.cs.cmu.edu/",
  ),
  note(
    "dbms",
    "Normalisation and ACID, quickly",
    `
Two topics come up in almost every DBMS interview round.

Normal forms (each builds on the last):
- 1NF: every column holds one value; no repeating groups.
- 2NF: 1NF, and every non-key column depends on the whole primary key (matters with composite keys).
- 3NF: 2NF, and non-key columns depend only on the key, not on other non-key columns.
- BCNF: every determinant is a candidate key.

ACID (what a transaction guarantees):
- Atomicity: all of it happens or none of it does.
- Consistency: constraints hold before and after.
- Isolation: concurrent transactions don't see each other's half-done work.
- Durability: once committed, it survives a crash.

Practise by taking a messy table (for example student, course, teacher, teacher_phone in one row) and splitting it to 3NF yourself.
`,
  ),
  link("sql", "Interactive SQL lessons", "PRACTICE", "SQLBolt", "https://sqlbolt.com/"),
  link(
    "sql",
    "SQL tutorial with try-it examples",
    "EXAMPLE",
    "W3Schools",
    "https://www.w3schools.com/sql/",
  ),
  link(
    "mongodb",
    "MongoDB manual",
    "REFERENCE",
    "mongodb.com",
    "https://www.mongodb.com/docs/manual/",
  ),
  link(
    "mongodb",
    "MongoDB tutorial with examples",
    "EXAMPLE",
    "W3Schools",
    "https://www.w3schools.com/mongodb/",
  ),
  link(
    "system-design",
    "The System Design Primer",
    "LECTURE",
    "GitHub",
    "https://github.com/donnemartin/system-design-primer",
  ),

  // Tools
  link("git", "Pro Git (free book)", "LECTURE", "git-scm.com", "https://git-scm.com/book/en/v2"),
  link(
    "git",
    "Learn Git branching, interactively",
    "PRACTICE",
    "learngitbranching",
    "https://learngitbranching.js.org/",
  ),
  link(
    "git",
    "Getting started with GitHub",
    "REFERENCE",
    "GitHub Docs",
    "https://docs.github.com/en/get-started",
  ),
  link("linux", "Shell tools and scripting", "LECTURE", "MIT", "https://missing.csail.mit.edu/"),
  link(
    "linux",
    "Bandit: learn the shell by playing",
    "PRACTICE",
    "OverTheWire",
    "https://overthewire.org/wargames/bandit/",
  ),

  // Data
  link(
    "excel",
    "Excel help and learning",
    "REFERENCE",
    "Microsoft",
    "https://support.microsoft.com/en-us/excel",
  ),
  link(
    "excel",
    "Excel tutorial with exercises",
    "PRACTICE",
    "W3Schools",
    "https://www.w3schools.com/excel/",
  ),
  link(
    "data-analysis-python",
    "10 minutes to pandas",
    "REFERENCE",
    "pandas.pydata.org",
    "https://pandas.pydata.org/docs/user_guide/10min.html",
  ),
  link(
    "data-analysis-python",
    "Pandas micro-course",
    "PRACTICE",
    "Kaggle Learn",
    "https://www.kaggle.com/learn/pandas",
  ),
  link(
    "machine-learning",
    "Machine Learning Crash Course",
    "LECTURE",
    "Google",
    "https://developers.google.com/machine-learning/crash-course",
  ),
  link(
    "machine-learning",
    "Intro to Machine Learning",
    "PRACTICE",
    "Kaggle Learn",
    "https://www.kaggle.com/learn/intro-to-machine-learning",
  ),
  link(
    "machine-learning",
    "Getting started with scikit-learn",
    "EXAMPLE",
    "scikit-learn",
    "https://scikit-learn.org/stable/getting_started.html",
  ),
  link(
    "cloud-basics",
    "What is cloud computing?",
    "REFERENCE",
    "AWS",
    "https://aws.amazon.com/what-is-cloud-computing/",
  ),
  link(
    "cloud-basics",
    "Cloud computing explained",
    "REFERENCE",
    "Google Cloud",
    "https://cloud.google.com/learn/what-is-cloud-computing",
  ),

  // Aptitude
  link(
    "quantitative-aptitude",
    "Aptitude questions with solutions",
    "PRACTICE",
    "IndiaBix",
    "https://www.indiabix.com/aptitude/questions-and-answers/",
  ),
  link(
    "quantitative-aptitude",
    "Arithmetic refresher",
    "LECTURE",
    "Khan Academy",
    "https://www.khanacademy.org/math/arithmetic",
  ),
  note(
    "quantitative-aptitude",
    "Speed tricks for the topics that repeat",
    `
Placement quant rounds reuse the same handful of topics. Learn one shortcut for each and practise against a timer (aim for about one minute a question).

- Percentages: x% of y = y% of x (8% of 50 = 50% of 8 = 4). Successive changes a% and b%: a + b + ab/100.
- Profit and loss: work from cost price = 100. A 20% profit then a 20% loss is a net 4% loss.
- Time and work: if A finishes in a days and B in b days, together they take ab / (a + b) days.
- Time, speed and distance: average speed for equal distances at u and v is 2uv / (u + v), not (u + v) / 2.
- Ratios: turn every ratio into parts first, then find what one part is worth.
- Simple vs compound interest: for 2 years, the difference is P(r/100)².

When stuck, try the answer options: substituting is often faster than solving.
`,
  ),
  link(
    "logical-reasoning",
    "Logical reasoning questions with solutions",
    "PRACTICE",
    "IndiaBix",
    "https://www.indiabix.com/logical-reasoning/questions-and-answers/",
  ),
  link(
    "logical-reasoning",
    "Verbal reasoning questions with solutions",
    "PRACTICE",
    "IndiaBix",
    "https://www.indiabix.com/verbal-reasoning/questions-and-answers/",
  ),
  link(
    "verbal-ability",
    "Verbal ability questions with solutions",
    "PRACTICE",
    "IndiaBix",
    "https://www.indiabix.com/verbal-ability/questions-and-answers/",
  ),
  link(
    "verbal-ability",
    "Grammar guides",
    "REFERENCE",
    "Purdue OWL",
    "https://owl.purdue.edu/owl/general_writing/grammar/index.html",
  ),
  link(
    "data-interpretation",
    "Data interpretation questions with solutions",
    "PRACTICE",
    "IndiaBix",
    "https://www.indiabix.com/data-interpretation/questions-and-answers/",
  ),
  link(
    "data-interpretation",
    "Statistics and probability",
    "LECTURE",
    "Khan Academy",
    "https://www.khanacademy.org/math/statistics-probability",
  ),

  // Soft skills
  note(
    "communication",
    "Explain your project in two minutes",
    `
"Tell me about your project" is the most common interview question after "tell me about yourself". Prepare it so it lands in about two minutes.

- The problem (one sentence): who had it and why it mattered.
- What you built (two sentences): the main features, in plain words.
- Your part: say "I", not "we". Name the pieces you personally designed or wrote.
- One hard thing: a bug, a design choice or a trade-off, and how you solved it.
- The result: a number if you have one (users, time saved, accuracy), or what you learned.

Practise out loud and record yourself once. Cut filler words, and stop when you've finished — let the interviewer ask the next question.
`,
  ),
  note(
    "communication",
    "Emails that get answered",
    `
Recruiters and seniors are busy. Short, specific emails get replies.

- Subject line says what it is: "Application: SDE Intern — Asha Verma, B.Tech CSE 2027".
- First line says why you're writing. No long introductions.
- One ask per email, and make it easy to say yes to.
- Attach files as PDFs with clear names (Asha_Verma_Resume.pdf).
- Sign off with your full name, college and phone number.
- Proofread once for names and dates. A wrong company name is worse than a typo.
`,
  ),
  note(
    "teamwork",
    "Answering teamwork questions with STAR",
    `
"Tell me about a time you worked in a team" is a behavioural question. Answer it with STAR so it stays concrete:

- Situation: the project and the team, in one or two sentences.
- Task: what you were responsible for.
- Action: what you did — especially how you handled a disagreement, a missed deadline or uneven workload. This should be most of your answer.
- Result: what happened, and what you'd do the same or differently.

Prepare three stories from college projects, hackathons, clubs or internships: one where things went well, one with a conflict, and one where you helped a teammate. Most teamwork questions fit one of the three.
`,
  ),
  note(
    "problem-solving",
    "Thinking out loud in a coding round",
    `
In technical interviews, how you reach an answer counts as much as the answer.

- Restate the problem in your own words and confirm the inputs, outputs and limits.
- Work through a small example by hand before coding.
- Say the brute-force idea first, with its time complexity, then improve it.
- Name the pattern if you see one: two pointers, sliding window, hashing, BFS/DFS, binary search, DP.
- Write the code while explaining it, then test it on your example and one edge case (empty input, one element, duplicates).

If you get stuck, say what you're trying and why. Interviewers often give a hint when they can see your thinking.
`,
  ),
  note(
    "time-management",
    "A weekly placement-prep routine",
    `
Consistency beats long weekend sessions. A routine that fits around classes:

- Weekdays: 45–60 minutes. Alternate a DSA/core-subject topic with a timed aptitude set.
- One skill check a week on PrepSuccess, so you can see whether the revision is working.
- Saturday: one longer practice block — a mock test, a practical task, or building a project feature.
- Sunday: 20 minutes to review the week's mistakes and plan the next week's topics.

Plan the week around your weakest skill first. Use a simple to-do list, and stop each session by writing down what you'll start with next time.
`,
  ),
  note(
    "leadership",
    "Leadership examples when you haven't led a team",
    `
Leadership questions don't need a formal title. Interviewers look for ownership.

Good examples from college life:
- You organised a club event, a fest stall or a hackathon team.
- You noticed a problem in a group project (no plan, a missed deadline) and fixed it.
- You taught or mentored juniors, or ran a study group.
- You took responsibility for something that went wrong and put it right.

Tell it with STAR (Situation, Task, Action, Result), keep the focus on your decisions, and finish with what you learned about working with people.
`,
  ),
  note(
    "workplace-etiquette",
    "Interview and workplace etiquette basics",
    `
Small habits make a strong first impression.

- Online interviews: test your camera, mic and internet 15 minutes early; sit in a quiet, well-lit place; join two minutes early.
- In person: arrive 15 minutes early with printed copies of your resume.
- Listen to the whole question before answering. It's fine to take a few seconds to think.
- Be honest when you don't know something, then say how you'd find out.
- Prepare two questions to ask at the end (about the team, the work, or how success is measured).
- Send a short thank-you email within a day.
`,
  ),
];
