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
      c("average", "Q1: the number removed, with working", 3, "32 (120 - 88), with working"),
      c(
        "percent",
        "Q2: the cut in consumption, with working",
        4,
        "20% reduction (25/125), with working",
      ),
      c(
        "ratio",
        "Q3: the ratio of ages after 6 years, with working",
        3,
        "Ages 18 and 30 now; 24 : 36 = 2 : 3 after 6 years, with working",
      ),
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
      c("si", "Simple interest, with working", 3, "₹1,440, with working"),
      c("ci", "Compound interest, with working", 3, "₹2,100 (amount ₹12,100), with working"),
      c(
        "difference",
        "Difference between compound and simple interest, with working",
        2,
        "₹32 (P × r² for 2 years), with working",
      ),
      c("rate", "Rate at which the sum doubles, with working", 2, "12.5% per year, with working"),
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
      c(
        "boat",
        "Boat: time for the round trip, with working",
        3,
        "5 hours (2 h down at 18 km/h + 3 h up at 12 km/h), with working",
      ),
      c(
        "pipes",
        "Pipes: time to fill the tank, with working",
        3,
        "60 minutes (net 1/60 of the tank per minute), with working",
      ),
      c(
        "trains",
        "Trains: time to cross each other, with working",
        2,
        "12 seconds (300 m at 25 m/s), with working",
      ),
      c(
        "average-speed",
        "Average speed for the round trip, with working",
        2,
        "48 km/h (2 × 40 × 60 / 100), not 50, with working",
      ),
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
      c(
        "arrangements",
        "PLACED arrangements with the vowels together, with working",
        2,
        "240 (treat AE as one unit: 5! × 2!), with working",
      ),
      c(
        "dice",
        "Probability that the dice sum to 8, with working",
        2,
        "5/36 (2-6, 3-5, 4-4, 5-3, 6-2), with working",
      ),
      c(
        "balls",
        "Probability that both balls are red, with working",
        2,
        "5/18 (5C2 / 9C2 = 10/36), with working",
      ),
      c(
        "mixture",
        "Water to add to the mixture, with working",
        2,
        "12 litres (milk 42, water must go from 18 to 30), with working",
      ),
      c(
        "remainder",
        "Remainder when 2^50 is divided by 7, with working",
        2,
        "4 (2^3 leaves remainder 1, so 2^48 leaves 1 and 2^50 leaves 4), with working",
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
      c(
        "series-1",
        "Series 1: correct next term",
        2,
        "42 (n × (n + 1), or differences 4, 6, 8, 10, 12)",
      ),
      c("series-2", "Series 2: correct next term", 2, "95 (each term × 2 + 1)"),
      c("series-3", "Series 3: correct next term", 2, "N (each letter moves 3 places forward)"),
      c(
        "series-4",
        "Series 4: correct next term",
        2,
        "DW (first letter moves forward, second moves backward)",
      ),
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
      c(
        "relation-1",
        "Q1: how the man is related to Riya",
        2,
        "Brother (grandfather's only son is Riya's father)",
      ),
      c("relation-2", "Q2: how A is related to D", 2, "Granddaughter"),
      c(
        "distance",
        "Q3: distance and direction from the start",
        2,
        "10 m to the south-east (6 m east, 8 m south)",
      ),
      c("facing", "Q4: the direction she finally faces", 2, "North-west"),
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
      c(
        "code-1",
        "APPLE written in the MANGO code",
        2,
        "BQQMF (each letter shifted one place forward)",
      ),
      c("code-2", "The value of DOG", 2, "26 (sum of letter positions: 4 + 15 + 7)"),
      c(
        "syllogism-1",
        "Syllogism 1: which conclusions follow, with a reason or Venn diagram",
        3,
        "Only II follows, with a reason or Venn diagram",
      ),
      c(
        "syllogism-2",
        "Syllogism 2: which conclusions follow, with a reason or Venn diagram",
        3,
        "Only I follows, with a reason or Venn diagram",
      ),
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
      c(
        "table",
        "Correct full table of floor, person and language",
        4,
        "Correct table: 1 S Go, 2 Q Python, 3 U Rust, 4 P Java, 5 T C, 6 R Kotlin",
      ),
      c(
        "questions",
        "Answers: who is on floor 3, what T likes, who likes Kotlin",
        2,
        "U on floor 3, T likes C, R likes Kotlin",
      ),
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
      c(
        "part-a",
        "Part A: a fitting synonym or antonym for each word",
        4,
        "e.g. frank; extravagant/lavish; careful/thorough; modern/current",
      ),
      c(
        "part-b",
        "Part B: the correct one-word substitute for each",
        4,
        "Polyglot, acrophobia, incorrigible, autobiography",
      ),
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
      c(
        "main-idea",
        "The main idea of the passage",
        3,
        "Skills-based hiring rewards learning relevant skills and proving them",
      ),
      c(
        "projects",
        "Why recruiters value projects",
        2,
        "They show problem-solving, handling setbacks and finishing work",
      ),
      c(
        "vocab",
        "Meaning of 'carry little weight'",
        1,
        "Are not given much importance / have little value",
      ),
      c(
        "inference",
        "Inference about students from colleges with weak placement cells",
        2,
        "They are at a disadvantage because they lack guidance on what to learn",
      ),
      c("title", "A short, fitting title", 2, "A short, fitting title, e.g. 'Skills Over Degrees'"),
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
        "Para jumble 1: correct order, with the linking clues explained",
        3,
        "BADC, with the linking clues explained (As a result, This, A better approach)",
      ),
      c(
        "jumble-2",
        "Para jumble 2: correct order, with the time-order clues explained",
        3,
        "QSPR, with the time-order clues explained (At first, Then)",
      ),
      c(
        "blanks",
        "Fill in the blanks: the right word in each (1 point each)",
        4,
        "at, off, affect, were (1 point each)",
      ),
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
        "Argument 1: the assumption and a fact that would weaken it",
        3,
        "Assumes nothing else changed; weakened by e.g. more companies visiting or a better job market that year",
      ),
      c(
        "argument-2",
        "Argument 2: the flaw in the reasoning",
        2,
        "One test score is taken as enough to predict all-round job performance (hasty generalisation)",
      ),
      c(
        "argument-3",
        "Argument 3: the flaw in the reasoning",
        2,
        "Correlation is not causation – both are caused by the monsoon",
      ),
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
      c("total", "Total and overall percentage, with working", 4, "Total 390 out of 500, i.e. 78%"),
      c(
        "above-average",
        "Subjects strictly above the average, with working",
        3,
        "Maths and CS (English equals the average, so it is not above)",
      ),
      c(
        "ratio",
        "Ratio of the highest to the lowest mark, in simplest form",
        3,
        "90 : 66 = 15 : 11",
      ),
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
      c("rent", "Amount spent on rent, with working", 3, "₹15,000"),
      c(
        "food-vs-transport",
        "How much more is spent on food than on transport, with working",
        3,
        "₹6,000 (10% of ₹60,000)",
      ),
      c("angle", "Central angle of the Education slice, with working", 2, "54° (15% of 360°)"),
      c("savings", "Monthly savings, with working", 2, "₹10,800"),
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
      c(
        "total-growth",
        "Percentage increase in total production, with working",
        3,
        "50% (120 to 180 thousand)",
      ),
      c(
        "plant-growth",
        "Plant with the highest growth, and by how much, with working",
        3,
        "Sanand, at 80% (Pune 50%, Chennai 32%)",
      ),
      c("share", "Chennai's share of 2024 production, with working", 2, "40% (60 of 150)"),
      c("average", "Pune's average yearly production, with working", 2, "48.75 thousand (195 / 4)"),
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
      c(
        "women",
        "Number and percentage of women, with working",
        2,
        "320 women (96 + 100 + 40 + 84), i.e. 40%",
      ),
      c(
        "ratio",
        "Men in Engineering to men in Sales, in simplest form, with working",
        2,
        "224 : 100 = 56 : 25",
      ),
      c(
        "hiring",
        "Percentage of women after the new hires, with working",
        3,
        "45% (450 women out of 1,000)",
      ),
      c("highest", "Department with the highest proportion of women", 1, "HR (70%)"),
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
