import { c, task, type CatalogueTask } from "./helpers.js";

/** More practical tasks for this topic group (see helpers.ts for the format). */
export const APTITUDE_TASKS: CatalogueTask[] = [
  // Quantitative aptitude
  task(
    "quantitative-aptitude",
    "Averages, percentages and ratios",
    "EASY",
    `
Solve these and show your working:

- The average of 5 numbers is 24. When one number is removed, the average of the rest is 22. Which number was removed?
- The price of petrol rises by 25%. By what percent must a family cut its consumption so that its spending stays the same?
- The ages of A and B are in the ratio 3 : 5 and add up to 48. What will the ratio of their ages be after 6 years?
`,
    [
      c("average", "32 (120 - 88), with working", 3),
      c("percent", "20% reduction (25/125), with working", 4),
      c("ratio", "Ages 18 and 30 now; 24 : 36 = 2 : 3 after 6 years, with working", 3),
    ],
    `
Q1 Answer:
Working:

Q2 Answer:
Working:

Q3 Answer:
Working:
`,
  ),
  task(
    "quantitative-aptitude",
    "Simple and compound interest",
    "EASY",
    `
Solve these and show your working (interest compounded yearly where it applies):

- Simple interest on ₹8,000 at 6% per year for 3 years.
- Compound interest on ₹10,000 at 10% per year for 2 years.
- The difference between compound and simple interest on ₹5,000 at 8% per year for 2 years.
- A sum doubles itself in 8 years at simple interest. What is the rate per year?
`,
    [
      c("si", "₹1,440, with working", 3),
      c("ci", "₹2,100 (amount ₹12,100), with working", 3),
      c("difference", "₹32 (P × r² for 2 years), with working", 2),
      c("rate", "12.5% per year, with working", 2),
    ],
  ),
  task(
    "quantitative-aptitude",
    "Speed, boats and pipes",
    "MEDIUM",
    `
Solve these and show your working:

- A boat's speed in still water is 15 km/h and the stream flows at 3 km/h. How long does it take to go 36 km downstream and come back?
- Pipe A fills a tank in 20 minutes and pipe B in 30 minutes. Pipe C empties the full tank in 15 minutes. If all three are opened together on an empty tank, how long until it is full?
- Two trains, 120 m and 180 m long, run in opposite directions at 50 km/h and 40 km/h. How long do they take to cross each other?
- A car goes from A to B at 40 km/h and returns at 60 km/h. What is its average speed for the round trip?
`,
    [
      c("boat", "5 hours (2 h down at 18 km/h + 3 h up at 12 km/h), with working", 3),
      c("pipes", "60 minutes (net 1/60 of the tank per minute), with working", 3),
      c("trains", "12 seconds (300 m at 25 m/s), with working", 2),
      c("average-speed", "48 km/h (2 × 40 × 60 / 100), not 50, with working", 2),
    ],
  ),
  task(
    "quantitative-aptitude",
    "Mixed advanced problem set",
    "HARD",
    `
Solve all five and show your working for each:

- In how many ways can the letters of the word PLACED be arranged so that the vowels always come together?
- Two fair dice are thrown. What is the probability that the sum is 8?
- A bag has 5 red and 4 blue balls. Two balls are drawn at random without replacement. What is the probability that both are red?
- 60 litres of a mixture has milk and water in the ratio 7 : 3. How much water must be added to make the ratio 7 : 5?
- What is the remainder when 2^50 is divided by 7?
`,
    [
      c("arrangements", "240 (treat AE as one unit: 5! × 2!), with working", 2),
      c("dice", "5/36 (2-6, 3-5, 4-4, 5-3, 6-2), with working", 2),
      c("balls", "5/18 (5C2 / 9C2 = 10/36), with working", 2),
      c("mixture", "12 litres (milk 42, water must go from 18 to 30), with working", 2),
      c(
        "remainder",
        "4 (2^3 leaves remainder 1, so 2^48 leaves 1 and 2^50 leaves 4), with working",
        2,
      ),
    ],
  ),

  // Logical reasoning
  task(
    "logical-reasoning",
    "Number and letter series",
    "EASY",
    `
Find the next term in each series and state the rule you found:

- 2, 6, 12, 20, 30, ?
- 5, 11, 23, 47, ?
- B, E, H, K, ?
- AZ, BY, CX, ?
`,
    [
      c("series-1", "42 (n × (n + 1), or differences 4, 6, 8, 10, 12)", 2),
      c("series-2", "95 (each term × 2 + 1)", 2),
      c("series-3", "N (each letter moves 3 places forward)", 2),
      c("series-4", "DW (first letter moves forward, second moves backward)", 2),
      c("rules", "A clear rule is stated for every series", 2),
    ],
  ),
  task(
    "logical-reasoning",
    "Blood relations and directions",
    "EASY",
    `
Answer each and explain how you got there:

- Pointing to a man, Riya says: "He is the son of my grandfather's only son." How is the man related to Riya?
- A is B's sister. C is B's mother. D is C's father. E is D's mother. How is A related to D?
- Ravi walks 10 m north, turns right and walks 6 m, turns right again and walks 18 m. How far is he from his starting point, and in which direction?
- A girl faces north. She turns 90° clockwise, then 180° anticlockwise, then 45° clockwise. Which direction does she face now?
`,
    [
      c("relation-1", "Brother (grandfather's only son is Riya's father)", 2),
      c("relation-2", "Granddaughter", 2),
      c("distance", "10 m to the south-east (6 m east, 8 m south)", 2),
      c("facing", "North-west", 2),
      c("working", "Explains each step, e.g. a family tree or a direction sketch", 2),
    ],
  ),
  task(
    "logical-reasoning",
    "Coding-decoding and syllogisms",
    "MEDIUM",
    `
Coding-decoding:

- If MANGO is written as NBOHP, how is APPLE written in that code?
- If CAT = 24 and BAT = 23, what is DOG?

Syllogisms – say which conclusions follow (only I, only II, both, or neither) and explain:

- Statements: All engineers are graduates. Some graduates are coders. Conclusions: I. Some engineers are coders. II. Some coders are graduates.
- Statements: No cat is a dog. All dogs are animals. Conclusions: I. Some animals are not cats. II. No animal is a cat.
`,
    [
      c("code-1", "BQQMF (each letter shifted one place forward)", 2),
      c("code-2", "26 (sum of letter positions: 4 + 15 + 7)", 2),
      c("syllogism-1", "Only II follows, with a reason or Venn diagram", 3),
      c("syllogism-2", "Only I follows, with a reason or Venn diagram", 3),
    ],
  ),
  task(
    "logical-reasoning",
    "Floor and language puzzle",
    "HARD",
    `
Six people – P, Q, R, S, T and U – live on floors 1 to 6 of a building (floor 1 is the bottom), one per floor. Each likes a different language: Java, Python, C, Go, Rust and Kotlin.

- R lives on the top floor.
- Exactly two people live between S and P.
- Q lives on an even-numbered floor, below U.
- T lives directly above P.
- The Java fan lives directly above the Rust fan.
- S likes Go.
- The Python fan lives on floor 2.
- The C fan lives above the Java fan, but not on the top floor.

Give the full table (floor, person, language) and answer: who lives on floor 3, what language T likes, and who likes Kotlin. Explain your reasoning step by step.
`,
    [
      c("table", "Correct table: 1 S Go, 2 Q Python, 3 U Rust, 4 P Java, 5 T C, 6 R Kotlin", 4),
      c("questions", "U on floor 3, T likes C, R likes Kotlin", 2),
      c("steps", "Clues applied in a sensible order, with cases ruled out explicitly", 3),
      c("check", "Verifies the final arrangement against every clue", 1),
    ],
    `
Floor | Person | Language
6     |        |
5     |        |
4     |        |
3     |        |
2     |        |
1     |        |

Reasoning:
`,
  ),

  // Verbal ability
  task(
    "verbal-ability",
    "Synonyms, antonyms and one-word substitutes",
    "EASY",
    `
Part A – give one synonym (S) or antonym (A) as asked:

- Candid (S)
- Frugal (A)
- Meticulous (S)
- Obsolete (A)

Part B – give one word for each:

- A person who speaks many languages
- An abnormal fear of heights
- A person who cannot be corrected or reformed
- The story of a person's life written by that person

Part C – use any two of your Part B words in sentences of your own.
`,
    [
      c("part-a", "e.g. frank; extravagant/lavish; careful/thorough; modern/current", 4),
      c("part-b", "Polyglot, acrophobia, incorrigible, autobiography", 4),
      c("part-c", "Two correct, natural sentences that show the meaning", 2),
    ],
  ),
  task(
    "verbal-ability",
    "Reading comprehension",
    "MEDIUM",
    `
Read the passage and answer the questions in your own words.

"Many companies now hire for skills rather than degrees. Recruiters say a well-documented project often tells them more than a transcript, because it shows how a candidate breaks down a problem, handles setbacks and finishes the work. Yet this shift is not as simple as it sounds. Students from colleges with weak placement cells often do not know which skills employers value, and they spend months on certificates that carry little weight. The real advantage, then, goes not to those who learn the most, but to those who learn what matters and can prove it."

- What is the main idea of the passage?
- Why do recruiters value projects, according to the passage?
- What does "carry little weight" mean here?
- What can you infer about students from colleges with weak placement cells?
- Suggest a suitable title for the passage.
`,
    [
      c("main-idea", "Skills-based hiring rewards learning relevant skills and proving them", 3),
      c("projects", "They show problem-solving, handling setbacks and finishing work", 2),
      c("vocab", "Are not given much importance / have little value", 1),
      c("inference", "They are at a disadvantage because they lack guidance on what to learn", 2),
      c("title", "A short, fitting title, e.g. 'Skills Over Degrees'", 2),
    ],
  ),
  task(
    "verbal-ability",
    "Para jumbles and fill in the blanks",
    "MEDIUM",
    `
Para jumble 1 – arrange into a logical paragraph:

- A. As a result, many students spend their final year chasing every company that visits the campus.
- B. Campus placements are often seen as the single most important outcome of an engineering degree.
- C. A better approach is to shortlist roles that match one's skills and prepare deeply for them.
- D. This scattered effort leaves them underprepared for the roles they actually want.

Para jumble 2:

- P. Then she checked the logs and found the database connection was timing out.
- Q. Riya's API started returning errors a few minutes after deployment.
- R. Increasing the connection pool size fixed the problem.
- S. At first, she suspected a bug in the new code.

Fill in the blanks:

- She is good ___ solving puzzles.
- The match was called ___ because of the rain.
- The new policy will ___ (affect / effect) all employees.
- Neither the manager nor the employees ___ (was / were) aware of the change.

Briefly say how you found each order.
`,
    [
      c(
        "jumble-1",
        "BADC, with the linking clues explained (As a result, This, A better approach)",
        3,
      ),
      c("jumble-2", "QSPR, with the time-order clues explained (At first, Then)", 3),
      c("blanks", "at, off, affect, were (1 point each)", 4),
    ],
  ),
  task(
    "verbal-ability",
    "Critical reasoning on arguments",
    "HARD",
    `
For each argument, answer the question asked in 2-4 sentences.

- 1. "Our college's placement rate rose from 60% to 80% after we made mock interviews compulsory. So mock interviews improve students' chances of getting placed." What assumption does this make, and what one fact would weaken it?
- 2. "Ananya scored the highest in the aptitude test, so she will be the best performer in the job." What is the flaw in this reasoning?
- 3. "Umbrella sales went up in July. Raincoat sales also went up. So umbrella sales drive raincoat sales." What is the flaw?

Finally, write a 5-6 sentence paragraph arguing for or against "Attendance should not be compulsory in college". Include a clear claim, a reason, an example or evidence, and one counter-argument that you answer.
`,
    [
      c(
        "argument-1",
        "Assumes nothing else changed; weakened by e.g. more companies visiting or a better job market that year",
        3,
      ),
      c(
        "argument-2",
        "One test score is taken as enough to predict all-round job performance (hasty generalisation)",
        2,
      ),
      c("argument-3", "Correlation is not causation – both are caused by the monsoon", 2),
      c("paragraph", "Clear claim, reason, evidence and an answered counter-argument", 3),
    ],
  ),

  // Data interpretation
  task(
    "data-interpretation",
    "Marks table basics",
    "EASY",
    `
A student's marks (out of 100) in five subjects:

\`\`\`
Subject     Marks
Maths         84
Physics       72
Chemistry     66
English       78
CS            90
\`\`\`

- What is the total, and the overall percentage?
- Which subjects are strictly above the student's average?
- What is the ratio of the highest to the lowest mark, in simplest form?

Show your working.
`,
    [
      c("total", "Total 390 out of 500, i.e. 78%", 4),
      c("above-average", "Maths and CS (English equals the average, so it is not above)", 3),
      c("ratio", "90 : 66 = 15 : 11", 3),
    ],
  ),
  task(
    "data-interpretation",
    "Monthly budget pie chart",
    "EASY",
    `
A family spends ₹60,000 a month. A pie chart splits it as follows:

\`\`\`
Head        Share
Rent         25%
Food         20%
Education    15%
Transport    10%
Savings      18%
Other        12%
\`\`\`

- How much is spent on rent?
- How much more is spent on food than on transport?
- What is the central angle of the Education slice?
- How much does the family save each month?

Show your working.
`,
    [
      c("rent", "₹15,000", 3),
      c("food-vs-transport", "₹6,000 (10% of ₹60,000)", 3),
      c("angle", "54° (15% of 360°)", 2),
      c("savings", "₹10,800", 2),
    ],
  ),
  task(
    "data-interpretation",
    "Compare plants in a production table",
    "MEDIUM",
    `
Car production (in thousands) at three plants:

\`\`\`
Year   Pune   Chennai   Sanand
2022    40      50        30
2023    45      55        40
2024    50      60        40
2025    60      66        54
\`\`\`

- What was the percentage increase in total production from 2022 to 2025?
- Which plant had the highest percentage growth from 2022 to 2025, and by how much?
- What share of total production in 2024 came from Chennai?
- What was the average yearly production at Pune over the four years?

Show your working.
`,
    [
      c("total-growth", "50% (120 to 180 thousand)", 3),
      c("plant-growth", "Sanand, at 80% (Pune 50%, Chennai 32%)", 3),
      c("share", "40% (60 of 150)", 2),
      c("average", "48.75 thousand (195 / 4)", 2),
    ],
  ),
  task(
    "data-interpretation",
    "Workforce caselet",
    "HARD",
    `
Read the caselet and answer the questions, showing your working.

A company has 800 employees in four departments. Engineering has 40% of the staff, Sales 25%, Operations 20% and HR the rest. Women make up 30% of Engineering, half of Sales, 25% of Operations and 70% of HR.

- How many women work at the company, and what percentage of the workforce is that?
- What is the ratio of men in Engineering to men in Sales, in simplest form?
- Next year Engineering hires 200 new people, 65% of them women; nobody leaves. What percentage of the company will then be women?
- Which department has the highest proportion of women today?

Present the department-wise numbers as a small table first.
`,
    [
      c("women", "320 women (96 + 100 + 40 + 84), i.e. 40%", 2),
      c("ratio", "224 : 100 = 56 : 25", 2),
      c("hiring", "45% (450 women out of 1,000)", 3),
      c("highest", "HR (70%)", 1),
      c("table", "Clear department table (staff, women, men) used for the working", 2),
    ],
    `
Dept         Staff   Women   Men
Engineering
Sales
Operations
HR
Total

Answers and working:
`,
  ),
];
