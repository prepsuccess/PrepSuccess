import { q, type CatalogueQuestion } from "./helpers.js";

/** Interview questions for this topic group (see helpers.ts for the format). */
export const APTITUDE_QUESTIONS: CatalogueQuestion[] = [
  // ---------------------------------------------------------------- Quantitative aptitude
  q(
    "quantitative-aptitude",
    "A price rises by 20% and then falls by 20%. What is the net change?",
    "Percentages",
    "EASY",
    `
The price of a phone is first increased by 20% and then the new price is decreased by 20%.

Is the final price the same as the original? If not, what is the net percentage change?
`,
    `
Not the same. The second change applies to a bigger base.

- Multiplier: 1.20 x 0.80 = 0.96
- So the final price is 96% of the original: a net decrease of 4%.

Shortcut for +x% then -x%: net change = -(x^2/100)% = -(400/100)% = -4%.
`,
    { company: "TCS" },
  ),
  q(
    "quantitative-aptitude",
    "An article bought for Rs 800 is sold for Rs 1000. What is the profit percentage?",
    "Profit & Loss",
    "EASY",
    `
A shopkeeper buys an article for Rs 800 and sells it for Rs 1000. Find the profit percentage.
`,
    `
- Profit = SP - CP = 1000 - 800 = Rs 200
- Profit % is always on cost price: 200 / 800 x 100 = 25%

Common mistake: dividing by the selling price (200/1000 = 20%) is wrong.
`,
  ),
  q(
    "quantitative-aptitude",
    "A finishes a job in 10 days and B in 15 days. How long do they take together?",
    "Time & Work",
    "EASY",
    `
A can complete a piece of work in 10 days and B can complete it in 15 days. If they work together, in how many days will the work be finished?
`,
    `
Add the work rates (fraction of the job per day).

- A: 1/10 per day, B: 1/15 per day
- Together: 1/10 + 1/15 = 3/30 + 2/30 = 5/30 = 1/6 per day
- Time = 6 days

LCM method: total work = 30 units, A does 3/day, B does 2/day, together 5/day, so 30/5 = 6 days.
`,
    { company: "TCS" },
  ),
  q(
    "quantitative-aptitude",
    "How long does a 200 m train at 72 km/h take to cross a pole?",
    "Speed & Distance",
    "EASY",
    `
A train 200 m long is running at 72 km/h. How many seconds will it take to cross a telegraph pole?
`,
    `
- Convert speed: 72 x 5/18 = 20 m/s
- To cross a pole the train covers its own length: 200 m
- Time = 200 / 20 = 10 seconds

Remember: km/h to m/s multiply by 5/18; m/s to km/h multiply by 18/5.
`,
  ),
  q(
    "quantitative-aptitude",
    "What is the simple interest on Rs 5000 at 8% per annum for 3 years?",
    "Interest",
    "EASY",
    `
Find the simple interest and the total amount when Rs 5000 is invested at 8% per annum simple interest for 3 years.
`,
    `
- SI = P x R x T / 100 = 5000 x 8 x 3 / 100 = Rs 1200
- Amount = P + SI = 5000 + 1200 = Rs 6200
`,
  ),
  q(
    "quantitative-aptitude",
    "What is the unit digit of 7^95?",
    "Number System",
    "EASY",
    `
Find the unit (last) digit of 7 raised to the power 95.
`,
    `
Unit digits of powers of 7 repeat in a cycle of 4: 7, 9, 3, 1.

- 95 divided by 4 leaves remainder 3
- So the unit digit is the 3rd in the cycle: 3

If the remainder were 0, take the 4th value (1).
`,
  ),
  q(
    "quantitative-aptitude",
    "The average of 5 numbers is 20; removing one makes it 18. Which number was removed?",
    "Averages",
    "EASY",
    `
The average of five numbers is 20. When one number is removed, the average of the remaining four numbers becomes 18. Find the number that was removed.
`,
    `
- Sum of 5 numbers = 5 x 20 = 100
- Sum of remaining 4 = 4 x 18 = 72
- Removed number = 100 - 72 = 28
`,
  ),
  q(
    "quantitative-aptitude",
    "What is the difference between CI and SI on Rs 10,000 at 10% for 2 years?",
    "Interest",
    "MEDIUM",
    `
Find the difference between compound interest (compounded annually) and simple interest on Rs 10,000 at 10% per annum for 2 years.
`,
    `
- SI = 10000 x 10 x 2 / 100 = Rs 2000
- CI amount = 10000 x 1.1 x 1.1 = Rs 12,100, so CI = Rs 2100
- Difference = Rs 100

Shortcut for 2 years: difference = P x (R/100)^2 = 10000 x 0.01 = Rs 100.
`,
  ),
  q(
    "quantitative-aptitude",
    "Two pipes fill a tank in 12 h and 15 h and a third empties it in 20 h. All open?",
    "Pipes & Cisterns",
    "MEDIUM",
    `
Pipe A fills a tank in 12 hours and pipe B fills it in 15 hours. Pipe C can empty the full tank in 20 hours. If all three pipes are opened together on an empty tank, how long will it take to fill?
`,
    `
Filling pipes add, the emptying pipe subtracts.

- Net rate = 1/12 + 1/15 - 1/20
- LCM 60: 5/60 + 4/60 - 3/60 = 6/60 = 1/10 per hour
- Time = 10 hours
`,
  ),
  q(
    "quantitative-aptitude",
    "How long do two trains of 150 m and 100 m take to cross each other?",
    "Speed & Distance",
    "MEDIUM",
    `
Two trains 150 m and 100 m long run at 54 km/h and 36 km/h on parallel tracks.

How long do they take to cross each other if they move (a) in opposite directions, (b) in the same direction?
`,
    `
Distance to cover = sum of lengths = 250 m.

- (a) Opposite: relative speed = 54 + 36 = 90 km/h = 25 m/s, time = 250/25 = 10 s
- (b) Same direction: relative speed = 54 - 36 = 18 km/h = 5 m/s, time = 250/5 = 50 s
`,
    { company: "TCS" },
  ),
  q(
    "quantitative-aptitude",
    "A boat goes 18 km/h downstream and 12 km/h upstream. Find boat and stream speed.",
    "Speed & Distance",
    "MEDIUM",
    `
A boat's speed downstream is 18 km/h and upstream is 12 km/h. Find the speed of the boat in still water and the speed of the stream.
`,
    `
Let boat speed = b and stream speed = s.

- Downstream: b + s = 18
- Upstream: b - s = 12
- Boat speed b = (18 + 12)/2 = 15 km/h
- Stream speed s = (18 - 12)/2 = 3 km/h
`,
  ),
  q(
    "quantitative-aptitude",
    "How much water must be added to 60 L of 2:1 milk-water to make it 1:2?",
    "Ratio & Mixtures",
    "MEDIUM",
    `
A 60 litre mixture contains milk and water in the ratio 2 : 1. How much water must be added so that the ratio of milk to water becomes 1 : 2?
`,
    `
Milk does not change, so work from the milk quantity.

- Milk = 2/3 x 60 = 40 L, water = 20 L
- For 1 : 2, water must be 2 x 40 = 80 L
- Water to add = 80 - 20 = 60 L
`,
  ),
  q(
    "quantitative-aptitude",
    "Goods are marked 25% above cost and sold at a 10% discount. What is the profit %?",
    "Profit & Loss",
    "MEDIUM",
    `
A trader marks his goods 25% above the cost price and then allows a discount of 10% on the marked price. Find his profit percentage.
`,
    `
Take CP = 100.

- Marked price = 125
- Selling price = 125 x 0.90 = 112.5
- Profit = 12.5 on 100, so 12.5%

Multiplier view: 1.25 x 0.9 = 1.125, a 12.5% gain.
`,
  ),
  q(
    "quantitative-aptitude",
    "The ages of A and B are in the ratio 4:5; after 5 years it is 5:6. Find their ages.",
    "Ages",
    "MEDIUM",
    `
The present ages of A and B are in the ratio 4 : 5. After 5 years the ratio will be 5 : 6. Find their present ages.
`,
    `
Let ages be 4x and 5x.

- (4x + 5) / (5x + 5) = 5/6
- 6(4x + 5) = 5(5x + 5), so 24x + 30 = 25x + 25, giving x = 5
- A = 20 years, B = 25 years

Check: in 5 years 25 : 30 = 5 : 6.
`,
  ),
  q(
    "quantitative-aptitude",
    "In how many ways can the letters of BANANA be arranged?",
    "Permutations",
    "MEDIUM",
    `
How many distinct arrangements can be made from all the letters of the word BANANA?
`,
    `
BANANA has 6 letters: A appears 3 times, N 2 times, B once.

- Arrangements = 6! / (3! x 2!) = 720 / (6 x 2) = 60

Divide by the factorial of each repeat count because swapping identical letters gives the same word.
`,
  ),
  q(
    "quantitative-aptitude",
    "What is the probability of getting at least one six in four throws of a die?",
    "Probability",
    "HARD",
    `
A fair die is thrown four times. What is the probability of getting at least one six?
`,
    `
"At least one" is easiest through the complement (no six at all).

- P(no six in one throw) = 5/6
- P(no six in four throws) = (5/6)^4 = 625/1296
- P(at least one six) = 1 - 625/1296 = 671/1296, about 0.518
`,
  ),
  q(
    "quantitative-aptitude",
    "What is the remainder when 2^100 is divided by 7?",
    "Number System",
    "HARD",
    `
Find the remainder when 2 raised to the power 100 is divided by 7.
`,
    `
Look for a power of 2 that leaves remainder 1.

- 2^3 = 8 leaves remainder 1 when divided by 7
- 100 = 3 x 33 + 1, so 2^100 = (2^3)^33 x 2
- Remainder = 1^33 x 2 = 2
`,
  ),
  q(
    "quantitative-aptitude",
    "What is the angle between the hands of a clock at 3:40?",
    "Clocks",
    "HARD",
    `
Find the angle between the hour hand and the minute hand of a clock when the time is 3:40.
`,
    `
Formula: angle = |30H - 5.5M| degrees.

- Minute hand moves 6 deg per minute; hour hand moves 0.5 deg per minute
- 30 x 3 - 5.5 x 40 = 90 - 220 = -130
- Angle = 130 degrees (the reflex angle is 230)

Explain the 5.5: relative speed of minute over hour hand is 6 - 0.5 = 5.5 deg/min.
`,
  ),
  q(
    "quantitative-aptitude",
    "A+B take 12 days, B+C 15 days, A+C 20 days. How long does A take alone?",
    "Time & Work",
    "HARD",
    `
A and B together finish a work in 12 days, B and C together in 15 days, and A and C together in 20 days. In how many days can A alone finish it? How long would all three take together?
`,
    `
Adding the three pairs counts everyone twice.

- 2(A + B + C) = 1/12 + 1/15 + 1/20 = (5 + 4 + 3)/60 = 1/5
- A + B + C = 1/10 per day, so all three take 10 days
- A = (A + B + C) - (B + C) = 1/10 - 1/15 = 1/30
- A alone takes 30 days
`,
  ),
  q(
    "quantitative-aptitude",
    "How many 5-member committees from 6 men and 4 women have at least 2 women?",
    "Permutations",
    "HARD",
    `
A committee of 5 is to be formed from 6 men and 4 women. In how many ways can it be done so that the committee has at least 2 women?
`,
    `
Count the cases directly:

- 2 women, 3 men: C(4,2) x C(6,3) = 6 x 20 = 120
- 3 women, 2 men: C(4,3) x C(6,2) = 4 x 15 = 60
- 4 women, 1 man: C(4,4) x C(6,1) = 1 x 6 = 6
- Total = 186

Check with the complement: C(10,5) = 252; minus 0 women (6) and 1 woman (4 x 15 = 60) gives 252 - 66 = 186.
`,
  ),

  // ---------------------------------------------------------------- Logical reasoning
  q(
    "logical-reasoning",
    "Find the next number: 2, 6, 12, 20, 30, ?",
    "Series",
    "EASY",
    `
Find the next term in the series: 2, 6, 12, 20, 30, ?
`,
    `
- Differences: 4, 6, 8, 10, so the next difference is 12: 30 + 12 = 42
- Another view: the terms are n(n + 1): 1x2, 2x3, 3x4, 4x5, 5x6, so next is 6x7 = 42

Answer: 42
`,
  ),
  q(
    "logical-reasoning",
    "Find the next number: 3, 5, 9, 17, 33, ?",
    "Series",
    "EASY",
    `
Find the next term in the series: 3, 5, 9, 17, 33, ?
`,
    `
Each term is double the previous one minus 1.

- 3 x 2 - 1 = 5, 5 x 2 - 1 = 9, 9 x 2 - 1 = 17, 17 x 2 - 1 = 33
- Next: 33 x 2 - 1 = 65

The differences (2, 4, 8, 16, 32) also double, which confirms it.
`,
  ),
  q(
    "logical-reasoning",
    "If CAT is coded as DBU, how is DOG coded?",
    "Coding-Decoding",
    "EASY",
    `
In a certain code language CAT is written as DBU. How is DOG written in that code?
`,
    `
Each letter moves one place forward in the alphabet: C to D, A to B, T to U.

- D to E, O to P, G to H
- Answer: EPH
`,
  ),
  q(
    "logical-reasoning",
    "He is the son of my grandfather's only son. How is the man related to Riya?",
    "Blood Relations",
    "EASY",
    `
Pointing to a man, Riya says: "He is the son of my grandfather's only son." How is the man related to Riya?
`,
    `
- Riya's grandfather's only son must be Riya's father
- The son of Riya's father is Riya's brother

Answer: brother. Draw a small family tree for these questions instead of solving in your head.
`,
  ),
  q(
    "logical-reasoning",
    "Walk 5 km north, 3 km right, 9 km right. How far and which way from the start?",
    "Directions",
    "EASY",
    `
Amit walks 5 km north, turns right and walks 3 km, then turns right again and walks 9 km. How far is he from his starting point, and in which direction?
`,
    `
- North 5 km, then right (east) 3 km, then right (south) 9 km
- Net north-south: 5 - 9 = 4 km south; net east-west: 3 km east
- Distance = sqrt(4^2 + 3^2) = 5 km, towards the south-east
`,
  ),
  q(
    "logical-reasoning",
    "Find the odd one out: 8, 27, 64, 100, 125",
    "Classification",
    "EASY",
    `
Which number does not belong in the group: 8, 27, 64, 100, 125?
`,
    `
- 8 = 2^3, 27 = 3^3, 64 = 4^3, 125 = 5^3 are perfect cubes
- 100 is a perfect square, not a cube

Answer: 100
`,
  ),
  q(
    "logical-reasoning",
    "Find the next letter: A, C, F, J, O, ?",
    "Series",
    "EASY",
    `
Find the next letter in the series: A, C, F, J, O, ?
`,
    `
Use positions in the alphabet: A=1, C=3, F=6, J=10, O=15.

- Gaps: +2, +3, +4, +5, so the next gap is +6
- 15 + 6 = 21 = U

Answer: U
`,
  ),
  q(
    "logical-reasoning",
    "All cats are dogs; some dogs are rats. Which conclusions follow?",
    "Syllogisms",
    "MEDIUM",
    `
Statements: All cats are dogs. Some dogs are rats.

Conclusions:
- I. Some cats are rats.
- II. Some rats are dogs.

Which conclusion(s) follow?
`,
    `
Only II follows.

- II: "Some dogs are rats" can be reversed to "Some rats are dogs", so it is definitely true
- I: the dogs that are rats may lie outside the cats circle, so "Some cats are rats" is possible but not certain

Draw Venn diagrams and only accept a conclusion that holds in every possible diagram.
`,
  ),
  q(
    "logical-reasoning",
    "If COMPUTER is coded RFUVQNPC, how is MEDICINE coded?",
    "Coding-Decoding",
    "MEDIUM",
    `
In a certain code, COMPUTER is written as RFUVQNPC. How is MEDICINE written in that code?
`,
    `
Find the rule from the example:

- Reverse COMPUTER: RETUPMOC
- Keep the first and last letters, shift the middle letters forward by one: R, E to F, T to U, U to V, P to Q, M to N, O to P, C, giving RFUVQNPC

Apply to MEDICINE:

- Reverse: ENICIDEM
- Shift the middle letters: E, O, J, D, J, E, F, M

Answer: EOJDJEFM
`,
    { company: "TCS" },
  ),
  q(
    "logical-reasoning",
    "Five friends sit in a row with C in the middle. Who sits at the right end?",
    "Arrangements",
    "MEDIUM",
    `
A, B, C, D and E sit in a row facing north.

- C sits in the middle.
- A sits immediately to the left of C.
- B sits at one of the ends.
- E sits immediately to the right of D.

Who sits at the right end, and who sits between C and E?
`,
    `
Number the seats 1 to 5 from left to right.

- C = 3 and A = 2
- Seats 1, 4 and 5 remain for B, D and E
- D and E must be adjacent with E on the right, so D = 4 and E = 5
- B = 1

Order: B A C D E. E sits at the right end and D sits between C and E.
`,
  ),
  q(
    "logical-reasoning",
    "What day of the week was 15 August 1947?",
    "Calendars",
    "MEDIUM",
    `
Using the odd-days method, find the day of the week on 15 August 1947.
`,
    `
Count odd days (days left over after full weeks):

- 1600 years: 0 odd days; 1601 to 1900 (300 years): 1 odd day
- 1901 to 1946 (46 years with 11 leap years): 46 + 11 = 57, which is 1 odd day
- 1947 up to 15 Aug: Jan 3, Feb 0, Mar 3, Apr 2, May 3, Jun 2, Jul 3, Aug 15 days = 1, total 17, which is 3
- Total = 0 + 1 + 1 + 3 = 5

With 0 = Sunday, 5 = Friday. Answer: Friday.
`,
  ),
  q(
    "logical-reasoning",
    "How many times a day do the hands of a clock coincide?",
    "Clocks",
    "MEDIUM",
    `
How many times in a day (24 hours) do the hour and minute hands of a clock coincide? How many times are they at right angles?
`,
    `
- In 12 hours the minute hand gains 11 full rounds on the hour hand, so the hands coincide 11 times (not 12: the 11-to-1 o'clock stretch has only one meeting, at 12)
- In 24 hours: 22 times
- Right angles occur twice per gain, so 22 times in 12 hours and 44 times in 24 hours
- The hands are in a straight line but opposite 11 times in 12 hours, 22 times a day
`,
  ),
  q(
    "logical-reasoning",
    "A is B's sister, C is B's mother, D is C's father. How is A related to D?",
    "Blood Relations",
    "MEDIUM",
    `
A is the sister of B. C is the mother of B. D is the father of C. E is the mother of D. How is A related to D?
`,
    `
- A and B are siblings, and C is the mother of both
- D is C's father, so D is the maternal grandfather of A and B
- A is female (a sister)

Answer: A is D's granddaughter. (E is A's great-grandmother; that statement is extra information.)
`,
  ),
  q(
    "logical-reasoning",
    "Is x > y? Which statement is enough: x^2 > y^2, or x - y > 0?",
    "Data Sufficiency",
    "MEDIUM",
    `
Question: Is x greater than y?

- Statement 1: x^2 > y^2
- Statement 2: x - y > 0

Which statement(s) are sufficient to answer the question?
`,
    `
Statement 2 alone is sufficient; statement 1 alone is not.

- Statement 1: x = 3, y = 2 gives yes; x = -3, y = 2 gives 9 > 4 but x < y, so no. Not sufficient
- Statement 2: x - y > 0 means x > y directly. Sufficient

Test statements with negative numbers and zero, not just positive ones.
`,
  ),
  q(
    "logical-reasoning",
    "In the morning the shadow of a pole falls to Ravi's right. Which way is he facing?",
    "Directions",
    "MEDIUM",
    `
One morning after sunrise, Ravi stood facing a pole. The shadow of the pole fell exactly to his right. Which direction was he facing?
`,
    `
- In the morning the sun is in the east, so shadows fall towards the west
- The shadow is on his right, so his right-hand side points west
- If right is west, he is facing south

Answer: south.
`,
  ),
  q(
    "logical-reasoning",
    "Three boxes are labelled Apples, Oranges and Mixed, all wrongly. Fix them with one pick.",
    "Puzzles",
    "HARD",
    `
Three boxes are labelled "Apples", "Oranges" and "Mixed". Every label is wrong. You may take out one fruit from one box without looking inside. How do you correct all the labels?
`,
    `
Pick from the box labelled "Mixed".

- Its label is wrong, so it holds only apples or only oranges. Say you draw an apple: it is the Apples box
- The box labelled "Oranges" cannot be oranges (wrong label) and cannot be apples (already found), so it is Mixed
- The remaining box, labelled "Apples", must be Oranges

Picking from either other box fails, because a single fruit cannot tell "only that fruit" from "mixed".
`,
    { company: "Infosys" },
  ),
  q(
    "logical-reasoning",
    "A says 'We are both liars.' If truth-tellers never lie, what are A and B?",
    "Puzzles",
    "HARD",
    `
On an island every person is either a truth-teller (always tells the truth) or a liar (always lies). A says: "We are both liars", talking about himself and B. What are A and B?
`,
    `
- If A were a truth-teller, his statement would make him a liar: a contradiction. So A is a liar
- A liar's statement is false, so "both are liars" is false
- A is a liar, so B must be the truth-teller

Answer: A is a liar, B is a truth-teller. Test each case and discard the contradictory one.
`,
  ),
  q(
    "logical-reasoning",
    "25 horses, 5 tracks, no timer: minimum races to find the fastest 3?",
    "Puzzles",
    "HARD",
    `
You have 25 horses and a track where only 5 can race at a time. You have no stopwatch, only the finishing order of each race. What is the minimum number of races needed to find the 3 fastest horses?
`,
    `
Answer: 7 races.

- Races 1 to 5: race the horses in 5 groups of 5
- Race 6: race the 5 group winners. Its winner is the fastest overall
- Only 5 horses can still be 2nd or 3rd: the 2nd and 3rd of race 6, the 2nd and 3rd from the fastest horse's group, and the 2nd from the group of race 6's runner-up
- Race 7: race these 5; the top two are 2nd and 3rd overall

The key is eliminating horses that already have three faster horses ahead of them.
`,
  ),
  q(
    "logical-reasoning",
    "8 identical balls, one heavier. Minimum balance weighings to find it?",
    "Puzzles",
    "HARD",
    `
You have 8 balls that look identical, but one is slightly heavier. Using a two-pan balance, what is the minimum number of weighings needed to find the heavy ball? Explain the method.
`,
    `
Answer: 2 weighings.

- Weighing 1: put 3 balls on each pan and keep 2 aside
- If the pans balance, the heavy ball is among the 2 aside; weigh those 2 against each other
- If one pan is heavier, take 2 of its 3 balls and weigh them; if they balance, the third is heavy

Each weighing has 3 outcomes, so k weighings can cover up to 3^k balls; 3^2 = 9 is at least 8.
`,
  ),
  q(
    "logical-reasoning",
    "With 2 eggs and a 100-floor building, what is the minimum number of drops needed?",
    "Puzzles",
    "HARD",
    `
You have 2 identical eggs and a 100-floor building. An egg breaks if dropped from floor F or above and survives below F. What is the minimum number of drops that guarantees you find F in the worst case?
`,
    `
Answer: 14 drops.

- With the first egg, drop from floors that shrink the gap by one each time: 14, 27, 39, 50, 60, 69, 77, 84, 90, 95, 99, 100
- When it breaks, use the second egg one floor at a time from the last safe floor upward
- The total in every case is at most 14

Why 14: the smallest n with n(n + 1)/2 >= 100 is 14 (14 x 15 / 2 = 105).
`,
  ),

  // ---------------------------------------------------------------- Verbal ability
  q(
    "verbal-ability",
    "Correct the error: 'Each of the students have submitted their assignment.'",
    "Grammar",
    "EASY",
    `
Spot and correct the error in the sentence:

"Each of the students have submitted their assignment."
`,
    `
- "Each" is singular, so the verb must be singular: "has", not "have"
- Correct: "Each of the students has submitted his or her assignment." Many style guides now accept "their" as a singular pronoun

Rule: each, every, either, neither, everyone and anybody take a singular verb.
`,
  ),
  q(
    "verbal-ability",
    "What is a synonym of 'ephemeral'?",
    "Vocabulary",
    "EASY",
    `
Choose the word closest in meaning to EPHEMERAL: (a) eternal (b) transient (c) robust (d) obvious
`,
    `
Answer: (b) transient.

- Ephemeral means lasting a very short time
- Other synonyms: short-lived, fleeting, momentary
- Antonyms: permanent, eternal, enduring

Example: "Social media fame is often ephemeral."
`,
  ),
  q(
    "verbal-ability",
    "What is the antonym of 'benevolent'?",
    "Vocabulary",
    "EASY",
    `
Choose the word opposite in meaning to BENEVOLENT: (a) generous (b) kind (c) malevolent (d) humble
`,
    `
Answer: (c) malevolent.

- Benevolent: well-meaning and kind (bene = good)
- Malevolent: wishing harm to others (male = bad)

Knowing Latin roots like bene/male helps with unfamiliar words.
`,
  ),
  q(
    "verbal-ability",
    "Fill the blank: 'He has been working here ___ 2019.' (since or for?)",
    "Fill in the Blanks",
    "EASY",
    `
Fill in the blank with the correct word:

"He has been working here ___ 2019."
`,
    `
Answer: since.

- "Since" is used with a point in time: since 2019, since Monday, since morning
- "For" is used with a duration: for five years, for two hours

Both usually go with the present perfect or present perfect continuous tense.
`,
  ),
  q(
    "verbal-ability",
    "What does the idiom 'bite the bullet' mean?",
    "Idioms",
    "EASY",
    `
Explain the meaning of the idiom "bite the bullet" and use it in a sentence.
`,
    `
Meaning: to face a difficult or unpleasant situation bravely, instead of avoiding it.

Example: "The exams were close, so she bit the bullet and cut down on her phone time."

Related idioms often asked: "break the ice" (start a conversation), "once in a blue moon" (very rarely), "hit the nail on the head" (be exactly right).
`,
  ),
  q(
    "verbal-ability",
    "Fill the articles: 'She is ___ honest woman and ___ university professor.'",
    "Grammar",
    "EASY",
    `
Fill in the blanks with the correct articles:

"She is ___ honest woman and ___ university professor."
`,
    `
Answer: "an honest woman" and "a university professor".

- The choice depends on the sound, not the letter
- "Honest" starts with a vowel sound (the h is silent), so it takes "an"
- "University" starts with a "yu" (consonant) sound, so it takes "a"

Similar cases: an hour, an MBA, a European, a one-way street.
`,
  ),
  q(
    "verbal-ability",
    "Give one word for 'a remedy for all diseases or problems'.",
    "Vocabulary",
    "EASY",
    `
Give a single word for the phrase: "a remedy for all diseases or problems".
`,
    `
Answer: panacea.

Other common one-word substitutions:
- Bilingual: able to speak two languages
- Omniscient: knowing everything
- Philanthropist: one who loves and helps mankind
- Insolvent: unable to pay debts
`,
  ),
  q(
    "verbal-ability",
    "Correct: 'Neither the manager nor the employees was aware of the change.'",
    "Grammar",
    "MEDIUM",
    `
Spot and correct the error:

"Neither the manager nor the employees was aware of the change."
`,
    `
Correct: "Neither the manager nor the employees were aware of the change."

- With either...or and neither...nor, the verb agrees with the nearer subject
- The nearer subject is "employees" (plural), so the verb is "were"
- Reversed, "Neither the employees nor the manager was aware" is correct

Tip: put the plural subject second, so the sentence sounds natural.
`,
  ),
  q(
    "verbal-ability",
    "Arrange the four sentences on campus placements into a coherent paragraph.",
    "Para Jumbles",
    "MEDIUM",
    `
Arrange the sentences into a meaningful paragraph:

- P: However, most students start preparing only in their final year.
- Q: Campus placements are the main route into a first job for engineering graduates.
- R: As a result, they rush through aptitude, coding and interview practice together.
- S: A steady plan that begins two years earlier avoids this last-minute pressure.
`,
    `
Answer: QPRS.

- Q opens the topic and depends on nothing before it, so it comes first
- P starts with "However", so it contrasts with an earlier idea (Q)
- R starts with "As a result", the consequence of P
- S gives the solution and closes the paragraph

Strategy: find the opening sentence, then link pairs using connectors (however, as a result, this, they).
`,
    { company: "Accenture" },
  ),
  q(
    "verbal-ability",
    "Correct: 'No sooner had he reached the station when the train left.'",
    "Sentence Correction",
    "MEDIUM",
    `
Spot and correct the error:

"No sooner had he reached the station when the train left."
`,
    `
Correct: "No sooner had he reached the station than the train left."

- "No sooner" pairs with "than"
- "Hardly" and "scarcely" pair with "when": "Hardly had he reached the station when the train left."
- Both structures use inversion: "had he reached", not "he had reached"
`,
  ),
  q(
    "verbal-ability",
    "Correct: 'I am knowing him for ten years.'",
    "Sentence Correction",
    "MEDIUM",
    `
Spot and correct the error:

"I am knowing him for ten years."
`,
    `
Correct: "I have known him for ten years."

Two errors:
- "Know" is a stative verb (like believe, understand, own), so it is not normally used in the continuous form
- An action that started in the past and continues now, marked with "for ten years", needs the present perfect

This is a common Indian-English error, so interviewers like to test it.
`,
  ),
  q(
    "verbal-ability",
    "Correct: 'He is senior than me in the company.'",
    "Grammar",
    "MEDIUM",
    `
Spot and correct the error:

"He is senior than me in the company."
`,
    `
Correct: "He is senior to me in the company."

- Latin comparatives such as senior, junior, superior, inferior, prior and preferable take "to", not "than"
- Examples: "This plan is superior to that one." "I prefer tea to coffee."
`,
  ),
  q(
    "verbal-ability",
    "Convert to passive voice: 'The committee will announce the results tomorrow.'",
    "Voice & Speech",
    "MEDIUM",
    `
Change the sentence into the passive voice:

"The committee will announce the results tomorrow."
`,
    `
Answer: "The results will be announced by the committee tomorrow."

Steps:
- The object (the results) becomes the subject
- The future tense passive is will + be + past participle
- The original subject moves into a "by" phrase (it can be dropped if it is unimportant)

Time words like "tomorrow" stay unchanged.
`,
  ),
  q(
    "verbal-ability",
    "Convert to indirect speech: He said, 'I am going to Delhi tomorrow.'",
    "Voice & Speech",
    "MEDIUM",
    `
Change the sentence into indirect (reported) speech:

He said, "I am going to Delhi tomorrow."
`,
    `
Answer: He said that he was going to Delhi the next day.

- The reporting verb is in the past ("said"), so the tense moves back one step: "am going" becomes "was going"
- The pronoun changes to match the speaker: "I" becomes "he"
- Time words shift: tomorrow becomes the next day (or the following day), today becomes that day, now becomes then

If the reporting verb is in the present ("He says"), the tense does not change.
`,
  ),
  q(
    "verbal-ability",
    "Fill the blank with affect or effect: 'The new policy will ___ all employees.'",
    "Fill in the Blanks",
    "MEDIUM",
    `
Fill in the blank with "affect" or "effect":

"The new policy will ___ all employees."

Then explain the difference between the two words.
`,
    `
Answer: affect.

- Affect (verb): to influence. "The policy will affect all employees."
- Effect (noun): the result. "The policy had a big effect."
- Effect as a verb means to bring about: "to effect change"

Other commonly confused pairs: principal/principle, complement/compliment, stationary/stationery.
`,
  ),
  q(
    "verbal-ability",
    "Which option most weakens 'Training raised sales, so all staff should be trained'?",
    "Critical Reasoning",
    "HARD",
    `
Argument: "Salespeople who attended our training programme had 30% higher sales than those who did not. So the training increases sales and every salesperson should attend."

Which statement most weakens the argument?
- (a) The training was expensive.
- (b) Only the top performers from last year were chosen for the training.
- (c) Some trainees found the sessions boring.
- (d) Sales rose across the industry this year.
`,
    `
Answer: (b).

- The argument assumes the training caused the higher sales
- If only top performers were chosen, they may have sold more anyway: a selection bias, giving another cause for the result
- (a) and (c) do not affect whether the training works
- (d) affects both groups equally, so it does not explain the gap

To weaken a cause-effect claim, look for another explanation of the same result.
`,
  ),
  q(
    "verbal-ability",
    "Read the passage on remote work and identify its main idea and the author's tone.",
    "Reading Comprehension",
    "HARD",
    `
Passage: "Remote work was hailed as the end of the office. Yet many firms that went fully remote now ask staff to return for part of the week. They cite weaker mentoring of juniors and slower collaboration. Remote work has not failed; it has simply turned out to be one tool among several, not a replacement for all of them."

What is the main idea of the passage, and what is the author's tone?
`,
    `
- Main idea: remote work is useful but not a complete replacement for the office, so a mix is emerging
- Tone: balanced, measured or analytical; not critical or enthusiastic
- Clues: "has not failed" rules out a negative reading; "one tool among several" rules out full support

In RC, eliminate options that are too extreme ("remote work is a failure") or too narrow ("mentoring of juniors" is only a supporting detail).
`,
  ),
  q(
    "verbal-ability",
    "Find the sentence that does not fit the paragraph on electric vehicles.",
    "Para Jumbles",
    "HARD",
    `
Four of these sentences form a paragraph. Find the odd one out:

- 1: Electric vehicle sales in India have grown sharply in recent years.
- 2: Lower running costs and government subsidies have driven much of this growth.
- 3: Petrol engines were first mass-produced in the early twentieth century.
- 4: Yet the lack of charging stations still holds back many buyers.
- 5: Expanding charging networks is therefore the next big priority.
`,
    `
Answer: sentence 3.

- 1, 2, 4 and 5 form a chain: growth, the reasons, the obstacle ("Yet") and the conclusion ("therefore")
- Sentence 3 is about the history of petrol engines, which is related but off-topic and connects to nothing

Odd-one-out sentences often share keywords with the paragraph but break its logical flow.
`,
    { company: "Capgemini" },
  ),
  q(
    "verbal-ability",
    "Correct the dangling modifier: 'Walking down the road, the trees looked beautiful.'",
    "Sentence Correction",
    "HARD",
    `
What is wrong with this sentence, and how would you correct it?

"Walking down the road, the trees looked beautiful."
`,
    `
It has a dangling modifier: the opening phrase "Walking down the road" attaches to the subject next to it, which is "the trees". This suggests the trees were walking.

Corrections:
- "Walking down the road, I thought the trees looked beautiful."
- "As I walked down the road, the trees looked beautiful."

Rule: an introductory participle phrase must describe the subject that comes right after the comma.
`,
  ),
  q(
    "verbal-ability",
    "Fill both blanks: 'The plan was ___ on paper, ___ it failed in practice.'",
    "Fill in the Blanks",
    "HARD",
    `
Choose the best pair to fill the blanks:

"The plan was ___ on paper, ___ it failed miserably in practice."

- (a) flawed, and
- (b) impeccable, yet
- (c) impeccable, so
- (d) mediocre, because
`,
    `
Answer: (b) impeccable, yet.

- "Failed miserably in practice" contrasts with how the plan looked on paper, so the connector must show contrast: yet, but or although
- Contrast also needs a positive first word: "impeccable"
- (c) "so" suggests cause and effect, which does not make sense
- (a) and (d) have no contrast

Solve two-blank questions by fixing the connector first, then the word.
`,
  ),

  // ---------------------------------------------------------------- Data interpretation
  q(
    "data-interpretation",
    "Sales rose from 250 to 300 units. What is the percentage growth?",
    "Tables",
    "EASY",
    `
A company sold 250 units in 2022 and 300 units in 2023. What is the percentage growth in sales?
`,
    `
- Growth = (new - old) / old x 100
- (300 - 250) / 250 x 100 = 50/250 x 100 = 20%

Always divide by the earlier (base) value. A fall from 300 back to 250 would be a drop of 16.67%, not 20%.
`,
  ),
  q(
    "data-interpretation",
    "Rent is 30% of a Rs 2,40,000 budget. Find the amount and the pie-chart angle.",
    "Pie Charts",
    "EASY",
    `
In a pie chart of a family's annual budget of Rs 2,40,000, rent is 30%. Find the amount spent on rent and the central angle of the rent sector.
`,
    `
- Amount = 30% of 2,40,000 = Rs 72,000
- Central angle = 30% of 360 degrees = 108 degrees

Conversions: percent to degrees multiply by 3.6; degrees to percent divide by 3.6.
`,
  ),
  q(
    "data-interpretation",
    "Monthly production was 120, 150, 130, 170 and 180. What is the average?",
    "Bar Charts",
    "EASY",
    `
A bar chart shows a factory's production (in units) for five months: Jan 120, Feb 150, Mar 130, Apr 170, May 180.

Find the average monthly production and the months above the average.
`,
    `
- Total = 120 + 150 + 130 + 170 + 180 = 750
- Average = 750 / 5 = 150 units
- Months above average: April (170) and May (180). February equals the average.
`,
  ),
  q(
    "data-interpretation",
    "A college has 1200 male and 800 female students. Find the ratio and female share.",
    "Tables",
    "EASY",
    `
A table shows a college has 1200 male and 800 female students. Find the ratio of male to female students and the percentage of female students.
`,
    `
- Ratio = 1200 : 800 = 3 : 2
- Total = 2000; female share = 800 / 2000 x 100 = 40%
`,
  ),
  q(
    "data-interpretation",
    "Which year had the highest percentage growth: 40, 45, 60, 66, 70?",
    "Line Graphs",
    "EASY",
    `
A line graph shows a company's revenue (Rs crore): 2019: 40, 2020: 45, 2021: 60, 2022: 66, 2023: 70.

In which year was the percentage growth over the previous year the highest?
`,
    `
- 2020: 5/40 = 12.5%
- 2021: 15/45 = 33.3%
- 2022: 6/60 = 10%
- 2023: 4/66 = about 6.1%

Answer: 2021. The steepest segment of a line graph shows the largest absolute rise, which is not always the largest percentage rise, so check against the base.
`,
  ),
  q(
    "data-interpretation",
    "A pie sector is 72 degrees out of 5000 students. How many students does it show?",
    "Pie Charts",
    "EASY",
    `
A pie chart shows how 5000 students are split across branches. The Mechanical sector has a central angle of 72 degrees. How many students study Mechanical?
`,
    `
- 72 / 360 = 1/5 = 20%
- Students = 20% of 5000 = 1000
`,
  ),
  q(
    "data-interpretation",
    "Company A earns Rs 45 crore out of a Rs 180 crore market. What is its share?",
    "Tables",
    "EASY",
    `
The total revenue of four companies in a market is Rs 180 crore. Company A earns Rs 45 crore. What is its market share, and how many degrees would it take in a pie chart?
`,
    `
- Share = 45 / 180 x 100 = 25%
- Pie angle = 25% of 360 = 90 degrees
`,
  ),
  q(
    "data-interpretation",
    "Find the combined average salary of two departments of 20 and 30 employees.",
    "Tables",
    "MEDIUM",
    `
Dept A has 20 employees with an average salary of Rs 30,000. Dept B has 30 employees with an average salary of Rs 40,000. Find the average salary of all 50 employees.
`,
    `
Use a weighted average, not the simple average of 30,000 and 40,000.

- Total A = 20 x 30,000 = 6,00,000
- Total B = 30 x 40,000 = 12,00,000
- Combined = 18,00,000 / 50 = Rs 36,000

The answer is closer to Dept B's average because B has more people.
`,
    { role: "Data Analyst" },
  ),
  q(
    "data-interpretation",
    "From the export and import figures, which year had the largest trade deficit?",
    "Bar Charts",
    "MEDIUM",
    `
Exports and imports (Rs '000 crore):

| Year | Exports | Imports |
| 2020 | 120 | 150 |
| 2021 | 140 | 160 |
| 2022 | 150 | 200 |
| 2023 | 180 | 210 |

Which year had the largest trade deficit? What were exports as a percentage of imports in 2023?
`,
    `
Deficit = imports - exports:
- 2020: 30, 2021: 20, 2022: 50, 2023: 30
- Largest deficit: 2022 (50)

Exports as a share of imports in 2023: 180 / 210 x 100 = about 85.7%
`,
  ),
  q(
    "data-interpretation",
    "Revenue grew from Rs 100 crore to Rs 121 crore in 2 years. What is the yearly rate?",
    "Line Graphs",
    "MEDIUM",
    `
A company's revenue grew from Rs 100 crore to Rs 121 crore over 2 years at a constant annual rate. Find the annual growth rate. Is it 10.5%?
`,
    `
Growth compounds, so do not just divide 21% by 2.

- 100 x (1 + r)^2 = 121
- (1 + r)^2 = 1.21, so 1 + r = 1.1
- r = 10% per year (CAGR)

10.5% is the simple average, which overstates the rate.
`,
    { role: "Business Analyst" },
  ),
  q(
    "data-interpretation",
    "In a Rs 50,000 budget pie chart, how much more goes to food than education?",
    "Pie Charts",
    "MEDIUM",
    `
A family's monthly expenditure of Rs 50,000 is split as: Food 35%, Rent 25%, Education 15%, Transport 10%, Savings 15%.

- How much more is spent on food than on education?
- What is the ratio of rent to transport?
`,
    `
- Food - Education = 35% - 15% = 20% of 50,000 = Rs 10,000
- Rent : Transport = 25 : 10 = 5 : 2

Work with percentages first and convert to rupees only at the end; it saves time.
`,
  ),
  q(
    "data-interpretation",
    "The average of four quarters is 250; Q1, Q2, Q4 are 220, 260, 280. Find Q3.",
    "Tables",
    "MEDIUM",
    `
A table shows a store's quarterly sales, but the Q3 value is smudged. The average of the four quarters is 250 units, and Q1 = 220, Q2 = 260 and Q4 = 280. Find Q3.
`,
    `
- Total of four quarters = 4 x 250 = 1000
- Known total = 220 + 260 + 280 = 760
- Q3 = 1000 - 760 = 240 units
`,
  ),
  q(
    "data-interpretation",
    "The price moved from Rs 80 to Rs 92. What is the percentage change?",
    "Line Graphs",
    "MEDIUM",
    `
A line graph shows a share price rising from Rs 80 in January to Rs 92 in June. Find the percentage increase. If it then falls back to Rs 80, what is the percentage fall?
`,
    `
- Rise = 12 / 80 x 100 = 15%
- Fall = 12 / 92 x 100 = about 13.0%

The same rupee change gives a smaller percentage when the base is larger.
`,
  ),
  q(
    "data-interpretation",
    "Of 500 students, 60% like cricket, 45% football and 15% neither. How many like both?",
    "Caselets",
    "MEDIUM",
    `
In a survey of 500 students, 60% like cricket, 45% like football and 15% like neither. How many students like both? How many like only cricket?
`,
    `
- At least one sport = 100% - 15% = 85%
- Both = 60% + 45% - 85% = 20%, which is 100 students
- Only cricket = 60% - 20% = 40%, which is 200 students

Draw a two-circle Venn diagram for overlap caselets.
`,
  ),
  q(
    "data-interpretation",
    "Three schools' appeared and passed counts are given. Find the best and overall pass %.",
    "Tables",
    "MEDIUM",
    `
| School | Appeared | Passed |
| X | 400 | 340 |
| Y | 500 | 400 |
| Z | 250 | 225 |

Which school has the highest pass percentage? What is the overall pass percentage?
`,
    `
- X: 340/400 = 85%
- Y: 400/500 = 80%
- Z: 225/250 = 90%, the highest
- Overall: (340 + 400 + 225) / (400 + 500 + 250) = 965 / 1150 = about 83.9%

The overall rate is not the average of the three rates (85%); weight by the number who appeared.
`,
    { role: "Data Analyst" },
  ),
  q(
    "data-interpretation",
    "Find the share of women across three departments of a 1200-person company.",
    "Caselets",
    "HARD",
    `
A company has 1200 employees in Sales, Tech and HR in the ratio 5 : 4 : 3. Women make up 40% of Sales, 30% of Tech and 60% of HR.

- What percentage of all employees are women?
- Which department has the most men?
`,
    `
Headcount: 1200 / 12 = 100 per part, so Sales 500, Tech 400, HR 300.

- Women: Sales 200, Tech 120, HR 180, total 500
- Share of women = 500 / 1200 = about 41.7%
- Men: Sales 300, Tech 280, HR 120, so Sales has the most

Make a small table of headcount, women and men before answering caselet questions.
`,
  ),
  q(
    "data-interpretation",
    "A population of 50,000 changes +10%, -10%, then +20%. What is the final value?",
    "Line Graphs",
    "HARD",
    `
A town's population was 50,000 in 2021. It rose 10% in 2022, fell 10% in 2023 and rose 20% in 2024. Find the 2024 population and the net percentage change.
`,
    `
Apply the changes one after another:

- 2022: 50,000 x 1.1 = 55,000
- 2023: 55,000 x 0.9 = 49,500
- 2024: 49,500 x 1.2 = 59,400
- Net change = 9,400 / 50,000 = 18.8% increase

Check: 1.1 x 0.9 x 1.2 = 1.188. Adding the percentages (+20%) is wrong.
`,
    { company: "TCS" },
  ),
  q(
    "data-interpretation",
    "Rs 8 crore of sales are split across three products with different margins. Find profit.",
    "Pie Charts",
    "HARD",
    `
Total sales in 2023 were Rs 8 crore. A pie chart splits sales as Product A 25%, B 35% and C 40%. Profit margins are A 20%, B 10% and C 15%.

Find the total profit, the overall profit margin and the product with the highest profit.
`,
    `
Sales: A = 2 crore, B = 2.8 crore, C = 3.2 crore.

- Profit A = 2 x 0.20 = 0.40 crore
- Profit B = 2.8 x 0.10 = 0.28 crore
- Profit C = 3.2 x 0.15 = 0.48 crore
- Total = 1.16 crore; overall margin = 1.16 / 8 = 14.5%

C earns the most profit even though A has the best margin: combine share and margin before comparing.
`,
    { role: "Business Analyst" },
  ),
  q(
    "data-interpretation",
    "Compare two companies' profit growth from their revenue and margin figures.",
    "Tables",
    "HARD",
    `
| Company | Revenue 2022 | Margin 2022 | Revenue 2023 | Margin 2023 |
| P | 400 | 10% | 500 | 15% |
| Q | 300 | 20% | 320 | 20% |

(Revenue in Rs crore.) Which company earned more profit in 2023? Find each company's percentage growth in profit.
`,
    `
Profit = revenue x margin:

- P: 2022 = 40, 2023 = 75, growth = 35/40 = 87.5%
- Q: 2022 = 60, 2023 = 64, growth = 4/60 = about 6.7%
- In 2023 P earned more (75 vs 64), although Q has the higher margin

Never compare margins alone. Without the revenue figures, the question "who earned more?" cannot be answered.
`,
    { role: "Data Analyst" },
  ),
  q(
    "data-interpretation",
    "Units grew 1600 to 2000 to 2500. Project 2024 sales at the same growth rate.",
    "Bar Charts",
    "HARD",
    `
A bar chart shows units sold: 2020: 1600, 2021: 2000, 2022: 2500. If the same annual growth rate continues, estimate sales in 2024.
`,
    `
- Growth 2021: 400/1600 = 25%; growth 2022: 500/2000 = 25%, a constant rate
- 2023: 2500 x 1.25 = 3125
- 2024: 3125 x 1.25 = 3906.25, about 3906 units

Note: assuming a constant absolute rise of 500 a year would give 3500, which is a different (linear) model. Say which model you are using.
`,
    { role: "Data Analyst" },
  ),
];
