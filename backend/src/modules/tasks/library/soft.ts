import { c, task, type CatalogueTask } from "./helpers.js";

/** More practical tasks for this topic group (see helpers.ts for the format). */
export const SOFT_TASKS: CatalogueTask[] = [
  // ---------------- communication ----------------
  task(
    "communication",
    "Explain a technical idea to a non-techie",
    "EASY",
    `
Your aunt asks: "What is the cloud? Where are my photos actually stored?" She is not from a tech background.

Write your reply in about 100-150 words. Use plain language and at least one everyday analogy. Avoid jargon, or explain any technical word you must use.
`,
    [
      c(
        "accuracy",
        "Explanation is technically correct",
        3,
        "Explanation is technically correct (photos live on remote servers / data centres)",
      ),
      c("analogy", "Uses a clear, fitting everyday analogy", 3),
      c("plain", "No unexplained jargon; easy for a non-technical person to follow", 3),
      c("length", "Stays within roughly 100-150 words", 1),
    ],
  ),
  task(
    "communication",
    "Summarise a long update for your manager",
    "MEDIUM",
    `
You are an intern. Your manager asks for a 5-line status update on Slack. Your rough notes:

\`\`\`
- login page done, tested on Chrome + Firefox, Safari not tested (no Mac)
- signup API working but email verification failing on prod, works locally
- spent 1 day stuck on CORS, fixed now
- designer changed the dashboard mockup yesterday, so dashboard will slip ~2 days
- need staging DB access from DevOps, asked twice, no reply
- demo to client is on Friday
\`\`\`

Write the update (max 5-6 lines). Put the most important information first and make any request for help explicit.
`,
    [
      c("priority", "Leads with what matters most for Friday's demo (risks / blockers)", 3),
      c(
        "blockers",
        "Clearly flags the key bug and blocker, with a specific ask",
        3,
        "Clearly flags the prod email bug and the DevOps access blocker with a specific ask",
      ),
      c(
        "concise",
        "Drops low-value detail and stays within 5-6 lines",
        2,
        "Drops low-value detail (e.g. the CORS story) and stays within 5-6 lines",
      ),
      c("tone", "Professional, factual tone; gives a revised date for the dashboard", 2),
    ],
    `
Status update – <date>

Done:
In progress / at risk:
Blocked / need help:
Plan till Friday:
`,
  ),
  task(
    "communication",
    "Handle a tough interview question",
    "MEDIUM",
    `
Write your spoken answers (about 80-120 words each) to these two HR-round questions:

1. "Your CGPA is 6.8. Why should we hire you over someone with 8.5?"
2. "What is your biggest weakness?"

Be honest without being defensive, and back up claims with concrete examples (projects, skills, steps you are taking).
`,
    [
      c("honest", "Acknowledges the point honestly, no excuses or blaming", 2),
      c("evidence", "Backs claims with concrete projects, skills or results", 3),
      c("weakness", "Names a real (not fake-humble) weakness and specific steps to improve it", 3),
      c("delivery", "Confident, positive tone and appropriate length", 2),
    ],
    `
Q1 answer:


Q2 answer:
`,
  ),
  task(
    "communication",
    "Prepare a 3-minute project presentation",
    "HARD",
    `
In the technical/HR round you are asked: "Walk me through your best project in 3 minutes." Pick a real project (or a realistic one, e.g. a library management app or an attendance tracker).

Write:
- The full script you would speak (about 350-400 words)
- A one-line outline of 4-5 slides or whiteboard points you would show
- Two likely follow-up questions from the interviewer and your short answers

The script should cover the problem, your role, the tech choices and why, one hard challenge you solved, and the result/impact.
`,
    [
      c("structure", "Logical flow: problem → solution → your role → challenge → result", 3),
      c("technical", "Explains tech choices with reasons, not just a list of tools", 2),
      c("ownership", "Makes their personal contribution clear (I vs we)", 2),
      c("followups", "Anticipates realistic follow-up questions with solid answers", 2),
      c("timing", "Fits roughly 3 minutes spoken; slides/points match the script", 1),
    ],
    `
Script:


Slides / points:
1.
2.
3.
4.

Follow-up 1:
Answer:

Follow-up 2:
Answer:
`,
  ),

  // ---------------- teamwork ----------------
  task(
    "teamwork",
    "Split a group project fairly",
    "EASY",
    `
Your team of 4 has 2 weeks to build a college canteen pre-order web app (frontend, backend API, database, testing, final report and demo). The members:

- Riya – strong in React
- Arjun – knows Node.js and SQL
- Meera – good at writing and testing, new to coding
- You – a bit of everything

Write how you would divide the work, how the team will stay in sync, and how you will handle someone falling behind.
`,
    [
      c("split", "Assigns work that matches strengths and is roughly balanced", 4),
      c("sync", "Concrete sync plan (stand-ups, shared board, Git workflow, check-in days)", 3),
      c("growth", "Gives Meera a chance to learn or pairs people, not just leftover work", 1),
      c("slipping", "Sensible, respectful plan for when someone falls behind", 2),
    ],
  ),
  task(
    "teamwork",
    "Respond to a teammate who isn't contributing",
    "MEDIUM",
    `
Final-year project, 3 days before the review. Your teammate Karan has not pushed any code for 10 days and is not replying much in the group chat. Your other teammate wants to "complain to the guide right away".

Write:
1. The message you would send Karan (private, 60-100 words)
2. What you would do if he still does not respond in 24 hours
3. How you would make sure the review still goes well
`,
    [
      c("empathy", "Message to Karan is non-accusing and checks if something is wrong", 3),
      c("specific", "Message makes a specific, small ask with a deadline", 2),
      c("escalation", "Escalates sensibly and fairly (team talk first, then guide, with facts)", 3),
      c("delivery", "Practical plan to cover the work so the review is not at risk", 2),
    ],
    `
1. Message to Karan:


2. If no reply in 24 hours:


3. Plan for the review:
`,
  ),
  task(
    "teamwork",
    "Give feedback on a teammate's work",
    "MEDIUM",
    `
Your teammate Sneha built the login page for your team project. It works, but:

- Passwords are shown in plain text (no masking)
- There is no error message when login fails – the page just reloads
- The code is all in one 400-line file

She worked hard on it and is a little sensitive about criticism. Write the feedback you would give her (as a message or what you would say in person), around 120-180 words.
`,
    [
      c("positive", "Starts with genuine, specific appreciation", 2),
      c(
        "issues",
        "Covers all three issues clearly, the most serious first",
        3,
        "Covers all three issues clearly, with the security issue as top priority",
      ),
      c(
        "constructive",
        "Suggests concrete fixes or offers help instead of only pointing out flaws",
        3,
      ),
      c("tone", "Respectful, about the work not the person; invites her view", 2),
    ],
  ),
  task(
    "teamwork",
    "Group discussion: argue and build consensus",
    "HARD",
    `
Many placement drives include a Group Discussion (GD). Topic: "Should coding interviews be replaced by take-home projects?"

Write:
- Your opening statement (about 80 words) taking a clear position
- Two responses to other participants: one who strongly disagrees with you, and one who has been silent (bring them in)
- A closing summary (about 80 words) that fairly captures both sides and proposes a balanced conclusion

Include at least two concrete points (facts, examples or trade-offs) in your arguments.
`,
    [
      c("position", "Clear, well-reasoned opening with concrete points", 3),
      c(
        "disagreement",
        "Handles disagreement respectfully, building on or countering with reasons",
        2,
      ),
      c("inclusion", "Brings the quiet participant in naturally", 2),
      c("summary", "Closing summary is balanced and reaches a sensible conclusion", 2),
      c("language", "Concise, polite GD language without dominating", 1),
    ],
    `
Opening statement:


Response to the disagreeing participant:


Bringing in the quiet participant:


Closing summary:
`,
  ),

  // ---------------- problem-solving ----------------
  task(
    "problem-solving",
    "Find the root cause with 5 Whys",
    "EASY",
    `
Problem: "Our team missed the hackathon submission deadline by 20 minutes."

Use the 5 Whys technique: ask "why?" repeatedly (5 times) to dig from the symptom to a root cause. Write each why and its answer (make realistic answers up). Then give one concrete action that would prevent this next time.
`,
    [
      c("chain", "Five whys, each following logically from the previous answer", 4),
      c("root", "Ends at a real root cause (process/planning), not just a symptom", 3),
      c("action", "Prevention action directly addresses the root cause", 3),
    ],
    `
Problem: Missed the submission deadline by 20 minutes.

Why 1:
Why 2:
Why 3:
Why 4:
Why 5:

Root cause:
Prevention:
`,
  ),
  task(
    "problem-solving",
    "Make a decision with a weighted matrix",
    "EASY",
    `
You have two offers:

\`\`\`
              Offer A (startup)   Offer B (big IT services)
CTC           8 LPA               4.5 LPA
Location      Bengaluru           Your home city
Learning      High                Medium
Job security  Low                 High
Bond          None                2 years
\`\`\`

Pick 4-5 criteria, give each a weight (weights total 100%), score both offers out of 10 on each, compute the weighted totals, and state your decision. Show the calculation.
`,
    [
      c("criteria", "Sensible criteria with weights that total 100% and are justified", 3),
      c("scores", "Reasonable scores consistent with the data given", 2),
      c("math", "Weighted totals calculated correctly with working shown", 3),
      c("decision", "Clear decision that follows from (or thoughtfully overrides) the result", 2),
    ],
    `
Criterion | Weight | A score | B score | A weighted | B weighted
---------------------------------------------------------------


Totals:
Decision:
`,
  ),
  task(
    "problem-solving",
    "Estimate a number (guesstimate)",
    "MEDIUM",
    `
Guesstimates are common in product and consulting interviews. Estimate:

"How many cups of tea are sold per day at railway stations across India?"

Break it into clear steps, state every assumption with a number, do the arithmetic, and give a final range. Finish with one way you could sanity-check your answer.
`,
    [
      c("structure", "Breaks the problem into logical, independent factors", 3),
      c("assumptions", "Every assumption is stated with a reasonable number", 3),
      c("math", "Arithmetic is correct and units are consistent", 2),
      c("check", "Gives a final range and a sanity-check", 2),
    ],
    `
Approach:

Assumptions:
1.
2.
3.

Calculation:

Final estimate (range):
Sanity check:
`,
  ),
  task(
    "problem-solving",
    "Solve a messy real-world scenario",
    "HARD",
    `
You run the tech side of your college's annual fest. Online registrations open at 10 am. At 10:15 you learn:

- The registration site is very slow and some students got "payment failed" but money was deducted
- 600 students have registered, but the sponsor needs 1000 by tomorrow evening
- The volunteer who built the site is in an exam until 1 pm

Write a structured plan: what you do in the first 30 minutes, how you handle the deducted-payment students, how you diagnose the slowness without the original developer, how you reach 1000 registrations, and what you would change for next year. Prioritise clearly.
`,
    [
      c(
        "triage",
        "Triage first: stabilises the site and stops further damage before optimising",
        3,
      ),
      c(
        "payments",
        "Handles failed-but-deducted payments responsibly (record, communicate, reconcile)",
        2,
      ),
      c("diagnosis", "Reasonable diagnosis steps (logs, host metrics, gateway dashboard, load)", 2),
      c("growth", "Realistic plan to reach the registration target", 2),
      c("retro", "Concrete improvements for next year", 1),
    ],
    `
First 30 minutes:

Deducted payments:

Diagnosing the slowness:

Reaching 1000 registrations:

Next year:
`,
  ),

  // ---------------- time-management ----------------
  task(
    "time-management",
    "Sort tasks with the Eisenhower matrix",
    "EASY",
    `
Place each item into one of the four Eisenhower quadrants (Urgent+Important, Important not urgent, Urgent not important, Neither) and write what you will do with it (do now, schedule, delegate/minimise, drop):

- Online assessment for a dream company closes tonight
- Revise DBMS for placements starting next month
- Friend asks you to proofread his resume right now
- Reply to 40 unread group-chat messages
- Pay hostel fee, last date tomorrow
- Watch the new season of a web series
- Update your LinkedIn profile
- Phone call from a club about tomorrow's event poster

Give a one-line reason for any item you think is debatable.
`,
    [
      c(
        "placement",
        "Items placed in sensible quadrants",
        4,
        "Items placed in sensible quadrants (OA and fee as urgent+important, etc.)",
      ),
      c("actions", "Clear action for each item that fits its quadrant", 3),
      c("reasoning", "Justifies debatable choices briefly", 3),
    ],
    `
Urgent + Important (do now):

Important, not urgent (schedule):

Urgent, not important (delegate / minimise):

Neither (drop):
`,
  ),
  task(
    "time-management",
    "Build a 6-week placement prep plan",
    "MEDIUM",
    `
Placement season starts in 6 weeks. You have classes 9 am-4 pm on weekdays and about 3 hours free each weekday evening plus 6 hours on Saturday and Sunday. You need to cover: DSA (weak), aptitude (average), one core subject revision (DBMS/OS/CN), resume, and mock interviews.

Write a week-by-week plan and a sample weekday schedule. Show how many total hours you have and how you split them.
`,
    [
      c(
        "hours",
        "Correct total available hours and a sensible split",
        3,
        "Correct total available hours (6 weeks × 27 h = 162 h) and a sensible split",
      ),
      c(
        "weakness",
        "Gives more time to the weak areas, with a clear reason",
        2,
        "Gives more time to weak areas (DSA) with a clear reason",
      ),
      c("progression", "Week-by-week progression ending with mocks and revision", 3),
      c("realistic", "Realistic daily schedule with breaks and a buffer", 2),
    ],
    `
Total hours available:
Split by area:

Week 1:
Week 2:
Week 3:
Week 4:
Week 5:
Week 6:

Sample weekday evening:
`,
  ),
  task(
    "time-management",
    "Fix a procrastination pattern",
    "MEDIUM",
    `
Read this student's typical day:

\`\`\`
7:30  wake up, check phone in bed till 8:15
9-4   classes (scrolls reels in breaks)
4:30  "quick" YouTube break → till 6:30
7:00  opens laptop for DSA, gets stuck on a problem, switches to WhatsApp
9:00  dinner, then series till 12:30 am
      Sundays: plans to "catch up on everything", usually sleeps till 11
\`\`\`

Identify at least 4 specific time-wasters or habits causing the problem, and propose a concrete fix for each (technique, tool or rule). Then write a revised realistic weekday evening schedule.
`,
    [
      c(
        "diagnosis",
        "Identifies at least 4 specific problems in the routine",
        3,
        "Identifies at least 4 specific problems (phone in bed, open-ended breaks, giving up when stuck, late sleep, vague Sunday plan)",
      ),
      c(
        "fixes",
        "Concrete, practical fix for each problem",
        4,
        "Concrete, practical fix for each (timers, app limits, Pomodoro, hint rule, sleep time)",
      ),
      c("schedule", "Revised evening schedule is realistic, not overly strict", 3),
    ],
  ),
  task(
    "time-management",
    "Recover from a missed deadline",
    "HARD",
    `
You are in the second week of an internship. On Monday your mentor asked you to build a CSV-export feature "by Thursday". It is now Wednesday 5 pm and you are about 40% done because:

- you spent Monday setting up the project, which took longer than expected
- you did not ask about an unclear requirement and built the wrong format first
- you also attended two long team meetings

Write:
1. The message you send your mentor now (what is done, what is left, new estimate, what you need)
2. A plan for Wednesday evening and Thursday, hour by hour
3. Three habits you will adopt so this does not happen again, each tied to one of the causes above
`,
    [
      c("message", "Message is early, honest, specific, and gives a realistic new estimate", 3),
      c(
        "scope",
        "Proposes options (e.g. a smaller first version by Thursday) instead of just more time",
        2,
      ),
      c("plan", "Hour-by-hour plan is realistic and focuses on the highest-value work", 2),
      c(
        "habits",
        "Habits map directly to the three causes",
        3,
        "Habits map directly to the three causes (estimate setup, clarify early, protect focus time)",
      ),
    ],
    `
1. Message to mentor:


2. Plan
Wednesday evening:
Thursday:


3. Habits:
-
-
-
`,
  ),

  // ---------------- leadership ----------------
  task(
    "leadership",
    "Motivate a demotivated team",
    "EASY",
    `
You lead a 5-member team for a college tech event. After a sponsor pulled out, the team feels the event is "pointless now" and two members have stopped coming to meetings.

Write the short message (about 120 words) you would send the team to re-energise them, and list 3 actions you would take this week.
`,
    [
      c("acknowledge", "Acknowledges the setback honestly instead of ignoring it", 2),
      c("purpose", "Reconnects the team to a clear purpose or goal", 3),
      c(
        "actions",
        "Three concrete actions",
        3,
        "Three concrete actions (e.g. new sponsor plan, 1-on-1s, smaller wins)",
      ),
      c("tone", "Positive, inclusive tone without blame", 2),
    ],
  ),
  task(
    "leadership",
    "Delegate tasks with clear ownership",
    "MEDIUM",
    `
You are the coordinator for a 2-day coding workshop for first-years, 3 weeks away. You have 4 volunteers. Tasks include: booking the lab, preparing content and slides, registrations, publicity, arranging lunch, certificates, and feedback forms.

Write a delegation plan: who owns what (give volunteers names and short strengths), the deadline for each task, how you will track progress, and what you yourself will NOT do and why.
`,
    [
      c("ownership", "Every task has one clear owner matched to strengths", 3),
      c(
        "deadlines",
        "Realistic deadlines that respect the dependencies",
        3,
        "Realistic deadlines with dependencies (e.g. lab before publicity)",
      ),
      c("tracking", "Light-weight tracking method (checklist, weekly check-in)", 2),
      c("restraint", "Shows they will not micromanage or do everything themselves", 2),
    ],
  ),
  task(
    "leadership",
    "Make a call with incomplete information",
    "MEDIUM",
    `
You are the team lead for your final-year project. Two weeks before the deadline, your team is split:

- Half want to switch from your current custom ML model (72% accuracy, unstable) to a pre-trained model API (about 90% accuracy, but your guide said "show your own work")
- Half want to keep improving the custom model

You cannot get hold of your guide until next week. Write how you would make the decision: what information you would gather in one day, how you would involve the team, the decision you would take, and how you would communicate it to the group that disagreed.
`,
    [
      c(
        "info",
        "Gathers the right information quickly",
        3,
        "Gathers the right information quickly (time left, guide's criteria, effort estimates)",
      ),
      c("involve", "Involves the team fairly but keeps ownership of the final call", 2),
      c(
        "decision",
        "Makes a clear, reasoned decision with a fallback",
        3,
        "Makes a clear, reasoned decision (possibly a hybrid) with a fallback",
      ),
      c("communicate", "Communicates respectfully to those who disagreed and gets commitment", 2),
    ],
  ),
  task(
    "leadership",
    "Lead a project through a crisis (STAR)",
    "HARD",
    `
Interviewers often ask: "Tell me about a time you led a team through a difficult situation."

Write a full STAR answer (about 300-350 words) about a real or realistic situation (e.g. a teammate dropped out before a hackathon, a server crashed before a demo, a club event lost its venue). Then answer these two follow-ups in 2-4 lines each:

- "What would you do differently?"
- "How did you handle the team member who was least cooperative?"

Your answer must show decisions YOU made, how you kept people aligned, and a measurable result.
`,
    [
      c("star", "Complete STAR structure with stakes made clear", 2),
      c("decisions", "Specific decisions and actions the candidate personally took", 3),
      c("people", "Shows handling of people: alignment, morale, a difficult member", 2),
      c("result", "Measurable or concrete result", 1),
      c("reflection", "Honest, specific reflection in the follow-ups", 2),
    ],
    `
Situation:

Task:

Action:

Result:

What I would do differently:

The least cooperative member:
`,
  ),

  // ---------------- workplace-etiquette ----------------
  task(
    "workplace-etiquette",
    "Introduce yourself on your first day",
    "EASY",
    `
You have just joined a company as a software engineering intern. Your manager asks you to introduce yourself in the team's Slack/Teams channel (about 25 people, many senior).

Write the message (60-100 words). Then list 3 do's and 3 don'ts for chat etiquette in a workplace channel.
`,
    [
      c(
        "intro",
        "Introduction is friendly, brief and professional (name, role, team, one personal touch)",
        4,
      ),
      c("dos", "Three sensible do's (e.g. use threads, be concise, respond in reasonable time)", 3),
      c(
        "donts",
        "Three sensible don'ts (e.g. no 'hi' without context, no all-caps, no late-night pings)",
        3,
      ),
    ],
  ),
  task(
    "workplace-etiquette",
    "Follow up after an interview",
    "MEDIUM",
    `
Write two short emails:

1. A thank-you email to the interviewer (Ms. Priya Sharma, Engineering Manager) sent the evening after your final-round interview for a Graduate Engineer role. Mention one specific thing you discussed.
2. A polite follow-up to the HR contact 10 days later, because you have heard nothing and another company has given you an offer with a deadline in 5 days.

Each email: subject line, greeting, body (under 120 words), sign-off.
`,
    [
      c("thanks", "Thank-you email is specific, warm and brief, not generic", 3),
      c(
        "followup",
        "Follow-up asks about status clearly and mentions the deadline without sounding like a threat",
        3,
      ),
      c("format", "Proper subject lines, greetings and sign-offs on both", 2),
      c("polish", "Professional tone and no errors", 2),
    ],
    `
Email 1
Subject:

Email 2
Subject:
`,
  ),
  task(
    "workplace-etiquette",
    "Ask for help without wasting time",
    "MEDIUM",
    `
You are an intern. You have been stuck for 2 hours: the app crashes on startup with "Error: connect ECONNREFUSED 127.0.0.1:5432" after you pulled the latest code. You tried restarting your laptop and reinstalling node_modules.

Write the message you would post in the team's help channel so that a busy senior can help you quickly. Then write 3-4 lines on when an intern should ask for help versus keep trying alone.
`,
    [
      c("context", "Message includes what you were doing, the exact error and the environment", 3),
      c("tried", "Lists what was already tried, so the senior does not repeat it", 2),
      c("ask", "Clear, specific question and respectful of the senior's time", 2),
      c("judgement", "Sensible rule for when to ask (e.g. time-box, after basic checks)", 3),
    ],
  ),
  task(
    "workplace-etiquette",
    "Handle a sensitive workplace situation",
    "HARD",
    `
You are three months into your first job. In the last two weeks:

- A senior colleague has twice presented your analysis in team meetings as his own work
- In a group chat, he made a joke about your hometown that a few people laughed at
- Your manager seems to think you have been "quiet and not contributing"

Write:
1. What you would say to the colleague in a private conversation (script, about 100 words)
2. The email you would send your manager to make your contributions visible (without attacking the colleague)
3. When and how you would involve HR, and what you would document
4. What you would do differently from now on to avoid this happening again
`,
    [
      c(
        "direct",
        "Private conversation is calm, specific (facts, not labels) and states a clear expectation",
        3,
      ),
      c("visibility", "Manager email shows contributions with evidence and stays professional", 3),
      c("escalation", "Sensible escalation path with documentation (dates, messages)", 2),
      c("prevention", "Practical prevention steps (share work in writing, regular 1-on-1s)", 2),
    ],
    `
1. Conversation with the colleague:


2. Email to manager
Subject:


3. Involving HR:


4. Going forward:
`,
  ),
];
