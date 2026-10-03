import { q, type CatalogueQuestion } from "./helpers.js";

/** Interview questions for this topic group (see helpers.ts for the format). */
export const SOFT_QUESTIONS: CatalogueQuestion[] = [
  // ---------------------------------------------------------------- communication
  q(
    "communication",
    "Tell me about yourself.",
    "Self Introduction",
    "EASY",
    `The classic opener in almost every HR and technical round. You have about 60-90 seconds. Introduce yourself in a way that makes the interviewer want to ask follow-up questions.`,
    `Use a Present - Past - Future structure:
- Present: who you are now (final-year B.Tech CSE at X, what you are focused on).
- Past: 2-3 highlights that prove it (a project, an internship, a hackathon, a measurable result).
- Future: why this role/company is the logical next step.
- Keep it professional: skip family details, hometown history and marks of every semester unless asked.
- End with a hook ("...which is why I am excited about backend roles like this one").
- Practise it aloud so it sounds natural, not memorised.`,
  ),
  q(
    "communication",
    "How would you explain a technical concept to a non-technical person?",
    "Clarity",
    "EASY",
    `Explain what an API is to your grandmother (or to a client from the sales team) in under a minute.`,
    `Interviewers want to see that you can drop jargon and use analogies.
- Start with what it does for them, not how it works.
- Use an everyday analogy: "An API is like a waiter in a restaurant. You tell the waiter what you want, the waiter tells the kitchen, and brings back your food. You never go into the kitchen yourself."
- Check understanding ("Does that make sense?") and adjust.
- Avoid acronyms; if you must use one, define it.
- Keep it short; offer more detail only if they ask.`,
  ),
  q(
    "communication",
    "What does active listening mean to you?",
    "Listening",
    "EASY",
    `Many people think communication is mostly about speaking well. What is active listening, and how do you practise it in meetings or interviews?`,
    `Active listening is fully concentrating on, understanding and responding to the speaker, not just waiting for your turn to talk.
- Give full attention: no phone, eye contact, nodding.
- Paraphrase to confirm: "So you're saying the deadline moved to Friday?"
- Ask clarifying, open-ended questions.
- Do not interrupt; note your point and raise it after they finish.
- Notice tone and body language, not just words.
- Example: in an interview, restating the problem before coding avoids solving the wrong question.`,
  ),
  q(
    "communication",
    "How do you write a professional email to a manager?",
    "Written Communication",
    "EASY",
    `You need to inform your manager that a task will be delayed by two days. Describe how you would write this email.`,
    `- Clear subject line: "Login module - delayed to Thursday (was Tuesday)".
- Put the key message first: what is late and the new date.
- Give the reason briefly and factually, without excuses or blame.
- Show what you are doing about it and any help you need.
- Mention impact on others, if any.
- Keep it short, polite and proofread; avoid SMS language and all caps.
- Close with a clear next step: "I will share an update by EOD tomorrow."`,
  ),
  q(
    "communication",
    "What are your strengths in communication, and where can you improve?",
    "Self Awareness",
    "EASY",
    `Rate your own communication skills. Where are you strong and what are you working on?`,
    `Be honest and specific, with evidence.
- Strength example: "I explain technical ideas clearly - I ran the DSA doubt sessions for my juniors every week."
- Improvement example: "I used to speak too fast in presentations. I now rehearse with a timer and pause after key points."
- Show an action you are taking, not just the weakness.
- Avoid fake weaknesses ("I am a perfectionist") and avoid weaknesses core to the role.`,
  ),
  q(
    "communication",
    "How do you handle stage fear while presenting?",
    "Presentations",
    "EASY",
    `You have to present your final-year project to a panel of professors and industry guests. You get nervous in front of groups. How do you prepare?`,
    `- Prepare deeply: know the content so well that you are not reading slides.
- Rehearse aloud 3-4 times, ideally in front of a friend, and time it.
- Structure: problem, approach, demo/results, learnings, next steps.
- Prepare for likely questions; it is fine to say "I will check and get back".
- Use breathing (slow exhale) before starting; start with a line you know by heart.
- Look at friendly faces, speak slower than feels natural, and pause instead of saying "umm".
- Remember nervousness is normal; the audience wants you to succeed.`,
  ),
  q(
    "communication",
    "How would you ask for clarification when instructions are unclear?",
    "Clarity",
    "EASY",
    `Your team lead gives you a task in a one-line chat message and you are not sure what is expected. What do you do?`,
    `- Do not guess silently and do not wait until the deadline.
- Read the message and related context (ticket, docs) first so your questions are informed.
- Ask specific questions: scope, expected output, deadline, priority versus current work.
- Summarise your understanding back: "So I will add the export button for admins only, by Friday - correct?"
- Confirm in writing (chat/ticket) so there is a record.
- Shows ownership and saves rework.`,
  ),
  q(
    "communication",
    "Tell me about a time you had to convince someone to change their mind.",
    "Persuasion",
    "MEDIUM",
    `Describe a situation where you had to persuade a teammate, teacher or senior to accept your idea. How did you do it and what was the result?`,
    `Use STAR (Situation, Task, Action, Result).
- Situation: e.g. team wanted to build the project with a framework nobody knew, two weeks before submission.
- Task: convince them to use a stack we already knew.
- Action: listened to why they wanted it; compared both options on time, risk and learning; proposed using the new framework for one small module.
- Result: delivered on time, and still learned the new tool.
- Key ideas: understand their view first, use data not emotion, find a win-win, stay respectful if they still disagree.`,
  ),
  q(
    "communication",
    "How do you communicate bad news to a client or senior?",
    "Difficult Conversations",
    "MEDIUM",
    `A bug you shipped caused wrong totals in a report a client used yesterday. You need to tell your manager and help inform the client. How do you handle it?`,
    `- Communicate early; bad news does not get better with age.
- Be factual: what happened, impact, since when, who is affected.
- Take ownership without excessive apology or blaming others.
- Bring a plan: immediate fix, data correction, timeline, how you will prevent it (tests, review).
- Tell your manager first so the client message is aligned.
- Follow up when it is resolved and share the root cause.`,
  ),
  q(
    "communication",
    "How do you adapt your communication style to different audiences?",
    "Clarity",
    "MEDIUM",
    `You built a feature that cuts page load time from 4 seconds to 1 second. How would you describe it to a developer, to your manager, and to a customer?`,
    `- Developer: the how - "Added Redis caching for the product list and lazy-loaded images; p95 dropped from 4s to 1s."
- Manager: impact and risk - "Pages load 4x faster; we expect lower drop-off. No extra infra cost beyond a small cache."
- Customer: the benefit - "Pages now open almost instantly."
- Principle: know your audience's goal and vocabulary, lead with what they care about, keep detail available on request.`,
  ),
  q(
    "communication",
    "How do you handle a situation where you are misunderstood?",
    "Difficult Conversations",
    "MEDIUM",
    `In a group chat, your comment on a teammate's code was taken as rude and they were upset. What do you do?`,
    `- Do not argue in the group; move to a 1:1 call or message.
- Acknowledge their feelings: "I realise my comment came across as harsh - that was not my intent."
- Clarify what you meant and focus on the code, not the person.
- Learn from it: written text loses tone, so add context, suggestions and positives ("Nice approach; one idea - could we...").
- Follow up later to make sure things are fine.`,
  ),
  q(
    "communication",
    "What makes a good status update in a stand-up meeting?",
    "Meetings",
    "MEDIUM",
    `In a daily stand-up you get about one minute. What should you say, and what should you avoid?`,
    `- Three parts: what I did yesterday, what I will do today, any blockers.
- Be specific and outcome-focused: "Finished the signup API, PR is up" rather than "worked on backend".
- Raise blockers clearly and name who can help.
- Avoid long technical deep-dives; take them offline after the stand-up.
- Be on time and prepared; keep it under a minute.`,
  ),
  q(
    "communication",
    "How do you give a short self-pitch in an elevator or networking event?",
    "Self Introduction",
    "MEDIUM",
    `You meet a senior engineer from a company you admire at a college fest. You have 30 seconds. What do you say?`,
    `- Name and context: "Hi, I am Riya, final-year CSE at X."
- One standout fact: "I built a bus-tracking app used by 800 students on campus."
- Connect to them: "I read about your team's work on payments reliability and found it fascinating."
- Ask, do not demand: "Could I ask you a couple of questions about how your team works?"
- Exchange LinkedIn, send a thank-you note within a day mentioning the conversation.`,
  ),
  q(
    "communication",
    "What is the role of body language in an interview?",
    "Non-verbal Communication",
    "MEDIUM",
    `Interviewers often say they judge confidence in the first few minutes. Which non-verbal signals matter in a face-to-face or video interview?`,
    `- Posture: sit upright, lean slightly forward; avoid slouching or crossing arms.
- Eye contact: steady but natural; on video, look at the camera when speaking.
- Facial expression: a genuine smile at greeting; nod to show listening.
- Hands: open gestures; avoid fidgeting with pens or hair.
- Voice: moderate pace, clear volume, pauses instead of filler words.
- Video specifics: good light on your face, neutral background, stable internet, camera at eye level.`,
  ),
  q(
    "communication",
    "How do you document your work so others can understand it?",
    "Written Communication",
    "MEDIUM",
    `You are moving to another project and a new teammate will take over your module. How do you hand it over?`,
    `- Write a README: purpose, setup steps, how to run tests, configuration.
- Explain key design decisions and why (not just what).
- List known issues, pending work and gotchas.
- Diagrams for data flow if it is non-trivial.
- Keep code comments for the "why"; good names for the "what".
- Do a live walkthrough session and stay available for questions for a while.`,
  ),
  q(
    "communication",
    "Tell me about a time you had to deliver a presentation with very little preparation.",
    "Presentations",
    "HARD",
    `Your team lead fell sick and you had to present the sprint demo to the client in 30 minutes. Walk me through what you did.`,
    `STAR answer outline:
- Situation/Task: unexpected demo with a client, little time.
- Action: quickly listed the 3 things the client cares about; prepared a simple flow (goal, demo of completed stories, what is next); did one dry run of the demo to avoid surprises; kept a backup (screenshots) in case the live demo failed; was honest about questions outside my area and promised follow-ups.
- Result: demo went smoothly; client approved the sprint; I sent follow-up answers the same day.
- Learning: always keep demo scripts and environments ready, not just the lead.`,
  ),
  q(
    "communication",
    "How do you handle disagreement with a senior in a meeting?",
    "Difficult Conversations",
    "HARD",
    `In a design meeting, a senior architect proposes an approach you believe has a serious performance problem. Others are nodding along. What do you do?`,
    `- Speak up respectfully; silence can cost the team later.
- Frame it as a question or concern, not an attack: "I may be missing something - with 1M rows, would this query scan the full table?"
- Bring evidence: numbers, a quick benchmark, a reference.
- Be open to being wrong; they may have context you lack.
- If the room is not right, raise it 1:1 after the meeting.
- Once a decision is made after discussion, commit to it and help it succeed.`,
  ),
  q(
    "communication",
    "How would you handle an angry customer on a call?",
    "Difficult Conversations",
    "HARD",
    `You are on a support or client call and the customer is shouting because their order was charged twice. How do you handle the conversation?`,
    `- Stay calm; do not take it personally or interrupt.
- Let them finish, then acknowledge: "I understand how frustrating a double charge is."
- Apologise for the experience without blaming other teams.
- Get facts: order ID, amount, date; confirm you understood.
- Explain clearly what you will do and by when (refund timeline), and only promise what you can deliver.
- Follow up as promised and record the issue so the root cause can be fixed.`,
  ),
  q(
    "communication",
    "Explain your final-year project in two minutes.",
    "Presentations",
    "HARD",
    `Almost every campus interview asks about your main project. Explain it so that a non-expert understands it and an expert is impressed.`,
    `Structure:
- Problem: what real problem it solves and for whom (one line).
- Solution: what you built, in plain words.
- Your role: what you personally did (be honest - they will probe).
- Tech: the stack and one interesting technical decision with its reason.
- Results: numbers if possible (users, accuracy, speed).
- Challenges: one hard problem and how you solved it.
- Learning / what you would do differently.
Tip: prepare for deep follow-ups on anything you mention.`,
  ),
  q(
    "communication",
    "Why is communication important for a software engineer?",
    "Self Awareness",
    "HARD",
    `Some students believe that good coding skills are enough to succeed as a developer. Do you agree? Justify with examples.`,
    `Disagree, with reasons:
- Most work is collaborative: requirements, code reviews, design discussions, handovers.
- Misunderstood requirements cause more rework than bad code.
- Clear PR descriptions and documentation speed up the whole team.
- Raising blockers early protects deadlines.
- Explaining trade-offs to managers and clients influences what gets built.
- Career growth to senior/lead roles depends heavily on communication.
Give a personal example where better communication saved time or a misunderstanding cost time.`,
  ),

  // ---------------------------------------------------------------- teamwork
  q(
    "teamwork",
    "Do you prefer working alone or in a team?",
    "Collaboration",
    "EASY",
    `A common HR question. What do you prefer, and why?`,
    `There is no single right answer, but show you can do both.
- "I enjoy working in a team because ideas get better with discussion and work moves faster. I am also comfortable working independently on focused tasks like debugging or research."
- Back it with examples of each.
- Avoid saying you dislike teams; almost all software work is team-based.`,
  ),
  q(
    "teamwork",
    "What makes a team successful?",
    "Collaboration",
    "EASY",
    `In your view, what are the key qualities of a high-performing team?`,
    `- A clear, shared goal.
- Defined roles and responsibilities.
- Trust and psychological safety: people can ask questions and admit mistakes.
- Open, frequent communication.
- Respect for different skills and opinions.
- Accountability: everyone delivers on commitments.
- Support each other when someone is stuck.
Add an example from a college project or fest team.`,
  ),
  q(
    "teamwork",
    "Tell me about a team project you worked on.",
    "Contribution",
    "EASY",
    `Describe a group project from college. What was your role and what did the team achieve?`,
    `Use STAR and be clear about "I" versus "we".
- Situation: project, team size, timeline.
- Task: your specific responsibility (e.g. backend APIs and database).
- Action: what you did - design, coordination, helping others.
- Result: outcome with numbers if possible (grade, prize, users).
- Mention one collaboration moment (helping a teammate, resolving a blocker).`,
  ),
  q(
    "teamwork",
    "How do you handle a teammate who is not contributing?",
    "Conflict",
    "EASY",
    `In a 4-person college project, one member keeps missing meetings and has not done their part. The deadline is in a week. What do you do?`,
    `- Talk to them privately first; do not assume laziness - there may be a personal or skill issue.
- Ask how you can help; maybe the task is unclear or too hard.
- Agree on a smaller, specific deliverable with a date.
- If it continues, rebalance work within the team to protect the deadline.
- Escalate to the guide/mentor only as a last resort, factually.
- Focus on the outcome, not blame.`,
  ),
  q(
    "teamwork",
    "How do you accept feedback from teammates?",
    "Feedback",
    "EASY",
    `A teammate reviewing your code says your functions are too long and hard to read. How do you respond?`,
    `- Listen without being defensive; feedback is about the work, not you.
- Thank them and ask for specifics or examples.
- Evaluate it honestly; if it is valid, fix it and apply the lesson going forward.
- If you disagree, explain your reasoning politely and be open to a compromise.
- Example: "After review comments, I started splitting functions under 30 lines and my PRs got approved faster."`,
  ),
  q(
    "teamwork",
    "What role do you usually take in a team?",
    "Contribution",
    "EASY",
    `In group work, are you usually the leader, the planner, the executor, the idea person? Explain with an example.`,
    `- Be honest and show flexibility: "I usually take the planner/coordinator role, but I adapt to what the team needs."
- Give an example for your main role.
- Show you can also follow when someone else leads.
- Link it to the job: in a new team you will start as a contributor and learn the codebase.`,
  ),
  q(
    "teamwork",
    "How do you help a teammate who is stuck?",
    "Collaboration",
    "EASY",
    `A junior teammate has been stuck on a bug for a day but is hesitant to ask for help. How do you approach it?`,
    `- Notice and offer help without making them feel judged: "Want to pair on it for 20 minutes?"
- Ask them to explain the problem; often they solve it while explaining.
- Guide with questions rather than taking over the keyboard.
- Share debugging approaches (logs, breakpoints, minimal reproduction).
- Encourage asking early in future: a quick question saves hours.`,
  ),
  q(
    "teamwork",
    "Tell me about a conflict in your team and how you resolved it.",
    "Conflict",
    "MEDIUM",
    `Describe a real disagreement within a team you were part of. What caused it and how was it resolved?`,
    `STAR with focus on behaviour:
- Situation: e.g. two members disagreed on using Firebase versus a custom Node backend.
- Action: got both sides to list pros/cons against our actual requirements (deadline, cost, learning), proposed a quick spike, agreed on criteria before deciding.
- Result: chose one option with everyone's buy-in and delivered on time.
- Show: listening, staying neutral, data-driven decisions, preserving relationships.
- Avoid stories where you blame others or where the conflict was never resolved.`,
  ),
  q(
    "teamwork",
    "How do you work with someone whose working style is very different from yours?",
    "Collaboration",
    "MEDIUM",
    `You like planning everything in advance; your teammate prefers to figure things out as they go. You are paired on a feature. How do you make it work?`,
    `- Acknowledge that both styles have strengths (planning reduces risk; flexibility adapts to change).
- Talk early about how you will work: check-ins, who owns what, definition of done.
- Agree on a light plan with milestones but room to adjust.
- Focus on shared goals and outcomes, not process preferences.
- Example of a result where combining styles worked better than either alone.`,
  ),
  q(
    "teamwork",
    "Tell me about a time you went beyond your role to help the team.",
    "Contribution",
    "MEDIUM",
    `Describe a situation where you did something outside your assigned work to help your team succeed.`,
    `STAR example:
- Situation: hackathon team, our frontend dev was overloaded the night before the demo.
- Action: finished my backend early, learned enough of the CSS framework to build two screens, wrote the demo script.
- Result: all features were demo-ready; we placed in the top 3.
- Show initiative without neglecting your own responsibilities, and without taking over someone else's work uninvited.`,
  ),
  q(
    "teamwork",
    "How do you collaborate effectively in a remote team?",
    "Remote Work",
    "MEDIUM",
    `Your team is spread across Bengaluru, Pune and a client in the US. What practices help you work well together?`,
    `- Over-communicate in writing: clear updates, decisions recorded in tickets/docs.
- Respect time zones: overlap hours for calls, async for the rest.
- Use the right tool for the right thing: chat for quick, tickets for tasks, docs for decisions.
- Be responsive and set status (busy, on leave).
- Turn on video in key meetings to build rapport.
- Share progress early (draft PRs) so others are not blocked.`,
  ),
  q(
    "teamwork",
    "What would you do if a teammate took credit for your work?",
    "Conflict",
    "MEDIUM",
    `In a review meeting, a teammate presents a feature you mostly built as their own work. How do you handle it?`,
    `- Stay calm; do not confront them publicly.
- Talk to them 1:1, assume positive intent first: maybe they meant "we".
- Explain how it made you feel and agree how to present shared work in future.
- Make your contributions visible routinely: PRs, stand-up updates, demo your own features.
- Escalate to your manager only if it becomes a pattern, with facts.`,
  ),
  q(
    "teamwork",
    "How do you build trust in a new team?",
    "Collaboration",
    "MEDIUM",
    `You have just joined a project team as a fresher. How do you earn the trust of your teammates and lead?`,
    `- Deliver on small commitments reliably and on time.
- Be honest about what you do not know; ask good questions after trying first.
- Communicate progress and blockers early.
- Respect existing conventions before suggesting changes.
- Help others where you can (documentation, testing, reviews).
- Admit mistakes quickly and fix them.`,
  ),
  q(
    "teamwork",
    "How do you give constructive feedback to a peer?",
    "Feedback",
    "MEDIUM",
    `Your teammate's pull requests often lack tests, which causes bugs later. How do you raise this with them?`,
    `- Private and timely, not in front of others.
- Use a structure like SBI: Situation, Behaviour, Impact - "In the last two PRs (situation), there were no tests for the edge cases (behaviour), and we had two bugs in QA (impact)."
- Focus on the work, not their personality.
- Ask for their view; maybe they lack time or know-how.
- Offer help: share a test template, pair on one.
- Recognise improvement later.`,
  ),
  q(
    "teamwork",
    "Tell me about a time your team failed. What did you learn?",
    "Failure",
    "MEDIUM",
    `Describe a team project or competition that did not go as planned. What went wrong and what did you take from it?`,
    `- Choose a real failure with a genuine lesson.
- Explain briefly what happened and your part in it (own it, do not blame).
- Root causes, e.g. unclear scope, late integration, no testing.
- What you changed afterwards: weekly integration, clearer task split, buffer time.
- Show the lesson applied in a later success.`,
  ),
  q(
    "teamwork",
    "Tell me about a time you disagreed with your team but committed to the decision.",
    "Conflict",
    "HARD",
    `Describe a situation where you strongly disagreed with a team decision, argued your case, but the team went another way. What did you do?`,
    `Maps to Amazon's "Have Backbone; Disagree and Commit" principle.
- Situation and the decision you disagreed with.
- Action: raised concerns clearly with data, respectfully, at the right time.
- When the decision went against you, you committed fully - no "I told you so", no half-effort.
- Result: what happened; if risks appeared, you helped mitigate them.
- Learning: when to push harder and when to commit.`,
    { company: "Amazon" },
  ),
  q(
    "teamwork",
    "How would you handle a team member who is consistently negative?",
    "Conflict",
    "HARD",
    `One teammate criticises every idea, complains in meetings and it is affecting team morale. You are not the manager. What do you do?`,
    `- Try to understand the cause privately: workload, frustration with process, personal issues.
- Acknowledge valid points in their criticism; sometimes negativity hides real problems.
- Encourage turning complaints into proposals: "What would you do instead?"
- Model positive behaviour in meetings; do not join in.
- If it seriously harms the team, raise it with the manager factually, focusing on impact.`,
  ),
  q(
    "teamwork",
    "How do you handle working with a teammate you personally do not like?",
    "Collaboration",
    "HARD",
    `You have been paired with someone you have had a falling-out with in the past. The project lasts three months. How do you approach it?`,
    `- Separate personal feelings from professional work.
- Have a short, honest conversation to reset: agree to focus on the project.
- Set clear roles, communication norms and check-ins.
- Be courteous and reliable; keep discussions about the work.
- Often working together improves the relationship; at minimum the project succeeds.
- Show maturity: the interviewer is testing emotional intelligence.`,
  ),
  q(
    "teamwork",
    "Your team is about to miss a deadline. What do you do?",
    "Collaboration",
    "HARD",
    `Two days before a release, the team realises it cannot finish all planned features. As a team member, how do you help?`,
    `- Raise it early and transparently with the lead; do not hide it.
- Help re-prioritise: which features are must-have versus nice-to-have?
- Suggest options: cut scope, phased release, extra help, short extension.
- Swarm on the critical items; pair to unblock.
- Do not sacrifice quality silently (skip testing) without agreement.
- After release, join a retrospective to improve estimates.`,
  ),

  // ---------------------------------------------------------------- problem-solving
  q(
    "problem-solving",
    "How do you approach a problem you have never seen before?",
    "Approach",
    "EASY",
    `In a coding round or at work, you get a problem that does not match anything you have practised. What is your process?`,
    `- Understand: restate the problem, clarify inputs, outputs, constraints.
- Work through small examples by hand.
- Break it into sub-problems.
- Relate to known patterns (sorting, two pointers, BFS, hashing).
- Start with a simple (even brute-force) solution, then optimise.
- Test with edge cases.
- Think aloud in interviews so the interviewer sees your reasoning.`,
  ),
  q(
    "problem-solving",
    "Tell me about a difficult bug you fixed.",
    "Debugging",
    "EASY",
    `Describe the hardest bug you have faced in a project. How did you find and fix it?`,
    `STAR, focus on method:
- Symptom: what was going wrong and how it was noticed.
- Process: reproduced it reliably, read logs, narrowed down with breakpoints or binary search on commits, formed and tested hypotheses.
- Root cause: e.g. a timezone mismatch between server and DB.
- Fix and prevention: added a test, documented it.
- Learning: e.g. "always store timestamps in UTC".`,
  ),
  q(
    "problem-solving",
    "What do you do when you are stuck on a problem?",
    "Approach",
    "EASY",
    `You have been stuck on a task for several hours. What steps do you take?`,
    `- Re-read the problem and check assumptions.
- Explain it to someone (or rubber-duck it) - this often reveals the gap.
- Simplify: create a minimal reproduction.
- Search documentation, error messages, Stack Overflow.
- Take a short break; fresh eyes help.
- Time-box: if still stuck after a set time, ask a teammate with a clear summary of what you tried.`,
  ),
  q(
    "problem-solving",
    "How do you prioritise between multiple possible solutions?",
    "Decision Making",
    "EASY",
    `You have three ways to solve a problem. How do you choose?`,
    `- Define criteria first: correctness, time to build, performance, maintainability, cost, risk.
- Compare options against them (a simple table helps).
- Consider constraints: deadline, team skills, existing systems.
- Prefer the simplest solution that meets requirements.
- Validate with a quick prototype if uncertain.
- Document why you chose it.`,
  ),
  q(
    "problem-solving",
    "Describe a time you used data to solve a problem.",
    "Analytical Thinking",
    "EASY",
    `Give an example where you relied on data or measurement, not intuition, to make a decision or fix something.`,
    `Example structure:
- Problem: e.g. college event registrations were dropping on the website.
- Data: checked form analytics - 60% of users quit at the payment step.
- Insight: payment page was slow on mobile.
- Action: simplified the form, added UPI option.
- Result: completions rose noticeably.
Key point: measure first, then act, then measure again.`,
    { role: "Data Analyst" },
  ),
  q(
    "problem-solving",
    "How many tennis balls can fit in a bus?",
    "Estimation",
    "EASY",
    `A guesstimate question. Estimate how many tennis balls fit inside a standard city bus. Explain your reasoning.`,
    `The process matters more than the number.
- Bus interior approx 10 m x 2.5 m x 2 m = 50 cubic metres.
- Subtract seats and fixtures, say 20%: about 40 cubic metres.
- Tennis ball diameter about 6.5 cm, so each ball takes a cube of about 6.5 x 6.5 x 6.5 = 275 cubic cm when stacked neatly.
- 1 cubic metre = 1,000,000 cubic cm, so about 1,000,000 / 275 = 3,600 balls per cubic metre.
- 40 x 3,600 = 1,44,000, so roughly 1.5 lakh balls (random dumping packs a little tighter, so 1.5-1.8 lakh).
State assumptions clearly and sanity-check the order of magnitude.`,
  ),
  q(
    "problem-solving",
    "What is root cause analysis?",
    "Debugging",
    "EASY",
    `Explain root cause analysis and one technique for doing it.`,
    `Root cause analysis means finding the underlying reason a problem happened, not just fixing the symptom.
- Technique: 5 Whys - keep asking "why" until you reach a cause you can fix.
- Example: Site went down. Why? Server ran out of disk. Why? Logs filled it. Why? Log rotation was not set up. Why? No checklist for new servers. Fix: add log rotation and a server setup checklist.
- Other tools: fishbone (Ishikawa) diagram, timeline of events.
- Goal: prevent recurrence.`,
  ),
  q(
    "problem-solving",
    "Tell me about a time you solved a problem creatively.",
    "Creativity",
    "MEDIUM",
    `Describe a situation where the obvious solution did not work and you found an unusual one.`,
    `STAR example:
- Situation: hostel Wi-Fi was too unreliable for a team hackathon submission.
- Obvious option (complain/wait) would not meet the deadline.
- Action: split the work so each member used mobile hotspots for only their part, synced via Git in small commits, and pre-recorded the demo video as a backup.
- Result: submitted on time.
Show: constraints, alternatives you considered, why the creative option was better.`,
  ),
  q(
    "problem-solving",
    "How do you make decisions with incomplete information?",
    "Decision Making",
    "MEDIUM",
    `Your lead is unreachable, a production issue needs a decision now, and you do not have all the facts. How do you decide?`,
    `- Clarify what decision is needed and by when.
- Gather the most important facts quickly; do not wait for perfect information.
- Consider reversibility: prefer actions that are easy to undo (e.g. rollback, feature flag off).
- Assess impact and risk of each option.
- Decide, communicate clearly what you did and why.
- Document and revisit when more information comes in.
This shows bias for action with sound judgement.`,
  ),
  q(
    "problem-solving",
    "Tell me about a time you made a mistake. How did you handle it?",
    "Failure",
    "MEDIUM",
    `Everyone makes mistakes. Describe a real one, its impact, and what you did.`,
    `- Pick a genuine but not catastrophic mistake (e.g. deleted a shared test database table, missed a requirement).
- Own it immediately: told the team, did not hide it.
- Fixed the impact: restored from backup, corrected the feature.
- Prevented recurrence: added a confirmation step, checklist or test.
- Learning stated clearly.
Avoid blaming others or picking a "mistake" that is secretly a strength.`,
  ),
  q(
    "problem-solving",
    "How would you find out why an app has suddenly become slow?",
    "Debugging",
    "MEDIUM",
    `Users report that your web app, which was fast last week, now takes 8 seconds to load pages. How do you investigate?`,
    `- Confirm and measure: reproduce, check monitoring (response times, error rates).
- What changed? Recent deploys, config changes, traffic spikes, data growth.
- Narrow down the layer: frontend (bundle size, network), backend (slow endpoints), database (slow queries, missing index), external APIs.
- Use tools: browser dev tools, APM/logs, DB query plans (EXPLAIN).
- Fix the root cause, verify with measurement, add an alert to catch it next time.`,
    { role: "Backend Developer" },
  ),
  q(
    "problem-solving",
    "Describe your approach to a guesstimate question.",
    "Estimation",
    "MEDIUM",
    `Estimate the number of smartphones sold in India in a year. Walk through your approach.`,
    `Approach: break down, state assumptions, compute, sanity-check.
- Population about 140 crore; smartphone users about 60%, so about 85 crore.
- People replace phones roughly every 4-5 years, so about 85 / 4.5 = 19 crore replacement phones a year.
- First-time buyers are shrinking but still a few crore - but many replacements are second-hand or shared, so trim the total.
- Estimate: roughly 15-20 crore new smartphones a year (industry figures are around 15 crore, so this is the right order of magnitude).
Lesson: show structure and be willing to adjust assumptions.`,
  ),
  q(
    "problem-solving",
    "What would you do if your solution works but you are not sure why?",
    "Analytical Thinking",
    "MEDIUM",
    `You changed some code and the bug disappeared, but you do not understand why the change fixed it. Is this okay to ship?`,
    `- Not ideal: a fix you do not understand may be hiding the real issue or may break later.
- Investigate: revert the change, confirm the bug comes back, then trace why.
- Read the relevant code/docs, add logs or tests to confirm the mechanism.
- If time is critical, ship with the team's agreement, but create a follow-up ticket to understand it.
- Add a test that captures the bug so it cannot silently return.`,
  ),
  q(
    "problem-solving",
    "How do you break down a large, vague project into tasks?",
    "Approach",
    "MEDIUM",
    `You are asked to "build a library management system" for your college in six weeks. How do you plan it?`,
    `- Clarify goals and users (students, librarian, admin) and must-have features.
- Write user stories: issue book, return book, search, fines.
- Break into components: data model, APIs, UI, auth, reports.
- Split into small tasks (1-2 days each) with dependencies.
- Prioritise an MVP for the first weeks, then extras.
- Add time for testing, buffers and feedback.
- Track progress weekly and adjust.`,
  ),
  q(
    "problem-solving",
    "What would you do if you realised the requirements were wrong mid-way through a project?",
    "Decision Making",
    "HARD",
    `Halfway through building a feature, you realise the requirement will not actually solve the user's problem. What do you do?`,
    `- Do not silently continue or silently change the scope.
- Gather evidence: user feedback, data, a concrete example of the gap.
- Raise it quickly with the product owner/lead, framed around the user's goal.
- Propose alternatives with effort estimates.
- Let the decision-maker decide; record the decision.
- Adjust the plan and reuse what you can from the work done.`,
  ),
  q(
    "problem-solving",
    "Tell me about a time you simplified a complex process.",
    "Creativity",
    "HARD",
    `Describe a time you found a simpler way to do something that others were doing in a complicated or manual way.`,
    `Maps to Amazon's "Invent and Simplify".
- Situation: e.g. club coordinators manually copied event registrations from Google Forms into Excel and emailed confirmations.
- Action: wrote a small script / used Apps Script to auto-generate the sheet and send confirmation emails.
- Result: saved several hours per event and removed copy errors.
- Show: you noticed the pain, measured it, built the simplest solution, and got people to adopt it.`,
    { company: "Amazon" },
  ),
  q(
    "problem-solving",
    "Tell me about a time you dug deep into data to find the real problem.",
    "Analytical Thinking",
    "HARD",
    `Describe a time when the surface-level explanation for a problem was wrong and you found the real cause by digging into details.`,
    `Maps to Amazon's "Dive Deep".
- Situation: e.g. a model's accuracy dropped; the team blamed the algorithm.
- Action: checked data pipeline step by step, compared distributions, found a preprocessing step silently dropping rows with null values from one city.
- Result: fixed the pipeline, accuracy recovered, added data-validation checks.
- Key traits: skepticism of anecdotes, checking metrics yourself, going to the source.`,
    { company: "Amazon" },
  ),
  q(
    "problem-solving",
    "How would you handle two urgent production issues at the same time?",
    "Decision Making",
    "HARD",
    `Issue A: checkout fails for 5% of users. Issue B: the admin dashboard is down for internal staff. You are the only on-call engineer. What do you do?`,
    `- Triage by impact: A affects customers and revenue; B affects internal users. Prioritise A.
- Communicate immediately: inform stakeholders that B is acknowledged and queued, with an expected time.
- Ask for help: escalate to get another engineer on B if possible.
- On A: mitigate first (rollback, feature flag), then root-cause.
- Keep a log of actions for the post-mortem.
- After both are fixed, review why both happened and how to prevent them.`,
  ),
  q(
    "problem-solving",
    "Tell me about a decision you made that turned out to be wrong.",
    "Failure",
    "HARD",
    `Describe a decision you made with good intentions that did not work out. How did you realise it and what did you do?`,
    `- Situation and the decision with your reasoning at the time.
- How you realised it was wrong (data, feedback) and how quickly.
- Action: acknowledged it, reversed or corrected course, managed impact on others.
- Learning: what you now do differently (e.g. prototype first, ask users earlier).
- Shows maturity, self-awareness and the ability to change your mind with new evidence.`,
  ),

  // ---------------------------------------------------------------- time-management
  q(
    "time-management",
    "How do you manage your time during placement preparation?",
    "Planning",
    "EASY",
    `Final-year students juggle classes, projects, exams and placement prep. How do you organise your time?`,
    `- Set weekly goals (e.g. 15 DSA problems, 2 mock interviews, 1 aptitude mock).
- Fixed daily slots for deep work (e.g. 2 hours of DSA in the morning).
- Use a calendar or to-do app; review the plan every Sunday.
- Balance: weak areas get more time; do not over-prepare favourites.
- Protect sleep and exercise; burnout hurts performance.
- Track progress and adjust.`,
  ),
  q(
    "time-management",
    "How do you prioritise tasks when everything seems important?",
    "Prioritisation",
    "EASY",
    `You have five tasks and all seem urgent. How do you decide what to do first?`,
    `- Use the Eisenhower matrix: urgent and important (do now), important not urgent (schedule), urgent not important (delegate or batch), neither (drop).
- Check actual deadlines and dependencies: what blocks others?
- Estimate effort; do quick wins if they unblock people.
- When unsure, ask your manager which matters most.
- Communicate if something will slip.`,
  ),
  q(
    "time-management",
    "How do you handle procrastination?",
    "Procrastination",
    "EASY",
    `Everyone procrastinates sometimes. What do you do when you keep putting off an important task?`,
    `- Break the task into a tiny first step (e.g. "open the file and write the function signature").
- Use time-boxing like the Pomodoro technique (25 minutes work, 5 minutes break).
- Remove distractions: phone in another room, block sites.
- Set a self-imposed deadline and tell someone (accountability).
- Understand the cause: unclear task, fear of failure, or boredom - and address it.`,
  ),
  q(
    "time-management",
    "What tools do you use to stay organised?",
    "Planning",
    "EASY",
    `Which tools or methods do you use to keep track of your tasks and deadlines?`,
    `- A calendar (Google Calendar) for time-bound events and focus blocks.
- A task list (Notion, Todoist, Trello, or even a notebook) for to-dos.
- Kanban boards (To do / Doing / Done) for projects.
- Reminders for deadlines a few days before they are due.
- A weekly review to plan the next week.
The tool matters less than using it consistently - give an example of how you use yours.`,
  ),
  q(
    "time-management",
    "How do you handle tight deadlines?",
    "Deadlines",
    "EASY",
    `Tell me how you work when you are given a task with a very tight deadline.`,
    `- Clarify the must-haves; focus on what truly matters for the deadline.
- Plan quickly: break into steps with time estimates.
- Remove distractions and focus.
- Communicate progress and risks early.
- Ask for help or reduced scope if needed rather than missing silently.
- Example from college: submitted a project report and demo within 48 hours by splitting tasks clearly.`,
  ),
  q(
    "time-management",
    "What is the Pomodoro technique?",
    "Focus",
    "EASY",
    `Explain the Pomodoro technique and whether it works for you.`,
    `- Work in focused blocks of 25 minutes ("pomodoros") followed by a 5-minute break.
- After 4 pomodoros, take a longer break (15-30 minutes).
- Single task per pomodoro; no phone or chat.
- Benefits: reduces procrastination (25 minutes feels manageable), keeps energy steady, makes time visible.
- Adapt it: some people prefer 50/10 for deep coding work.
Mention honestly how you use it or something similar.`,
  ),
  q(
    "time-management",
    "How do you balance academics with extracurricular activities?",
    "Work-Life Balance",
    "EASY",
    `You were a club coordinator and also maintained good grades. How did you manage both?`,
    `- Planned the semester with exam and event dates on one calendar.
- Delegated within the club team instead of doing everything yourself.
- Used small daily study slots rather than last-minute cramming.
- Said no to low-value commitments.
- Example: reduced club involvement during exam weeks after informing the team in advance.
Show trade-offs and planning, not superhuman effort.`,
  ),
  q(
    "time-management",
    "Tell me about a time you missed a deadline.",
    "Deadlines",
    "MEDIUM",
    `Describe a situation where you could not meet a deadline. What happened and what did you learn?`,
    `- Be honest; pick a real but recoverable example.
- Cause: e.g. underestimated integration work.
- What you did: informed stakeholders before the deadline (not after), proposed a new date, delivered the most important part first.
- Learning: break work into smaller tasks, add buffer, flag risks earlier.
- Show the lesson applied later.`,
  ),
  q(
    "time-management",
    "How do you estimate how long a task will take?",
    "Planning",
    "MEDIUM",
    `Your lead asks how long a new feature will take. How do you come up with an estimate?`,
    `- Understand the requirements fully; ask questions.
- Break the feature into small tasks (API, UI, tests, review, deployment).
- Estimate each piece; compare with similar past work.
- Add time for testing, code review and unknowns (often 20-30% buffer).
- Give a range if uncertain ("3-4 days") and explain assumptions.
- Re-estimate and inform early if you learn something new.`,
  ),
  q(
    "time-management",
    "How do you handle multiple deadlines at the same time?",
    "Prioritisation",
    "MEDIUM",
    `In one week you have a project submission, an internal test and a coding contest. How do you manage?`,
    `- List all tasks with deadlines and effort.
- Prioritise by impact and deadline; identify what can be done in parallel.
- Block calendar time for each.
- Start the longest task first; avoid leaving everything for the last day.
- Be ready to drop the lowest-value item (e.g. skip the optional contest).
- Communicate with teammates/teachers early if a conflict is unavoidable.`,
  ),
  q(
    "time-management",
    "What do you do when your manager gives you a new urgent task while you are busy?",
    "Prioritisation",
    "MEDIUM",
    `You are in the middle of a planned task due tomorrow, and your manager assigns an urgent production fix. What do you do?`,
    `- Acknowledge and clarify urgency and expected time.
- Explain your current commitment: "I am finishing X due tomorrow; should the fix take priority?"
- Let the manager decide priorities; they have the bigger picture.
- Update affected stakeholders if the original task will slip.
- Save your context on the current task (notes, WIP commit) to resume quickly.`,
  ),
  q(
    "time-management",
    "How do you deal with distractions while working?",
    "Focus",
    "MEDIUM",
    `Chat notifications, meetings and phone calls keep interrupting your coding. How do you protect your focus?`,
    `- Schedule focus blocks in your calendar and set status to "Do not disturb".
- Turn off non-essential notifications; check messages at fixed times.
- Batch small tasks (emails, reviews) together.
- Keep the phone away while doing deep work.
- Communicate your availability so teammates know when you will respond.
- Still be responsive to genuine urgent issues.`,
  ),
  q(
    "time-management",
    "How do you say no to extra work without hurting relationships?",
    "Prioritisation",
    "MEDIUM",
    `A colleague from another team keeps asking you to help with their tasks, and it is affecting your own work. How do you handle it?`,
    `- Be polite but clear: "I would like to help, but I am committed to X until Friday."
- Offer alternatives: a shorter time slot, documentation, another person who can help.
- If it is a priority question, involve your manager.
- Do not say yes and then deliver late - that hurts more.
- Help when you genuinely have capacity; it builds goodwill.`,
  ),
  q(
    "time-management",
    "How do you plan your first 90 days in a new job?",
    "Planning",
    "MEDIUM",
    `If you join us as a fresher, what would your plan for the first three months look like?`,
    `- Days 1-30: learn - complete onboarding/training, set up environment, understand the product and codebase, meet the team, fix small bugs.
- Days 31-60: contribute - take ownership of small features, ask for feedback, learn processes (reviews, deployment).
- Days 61-90: grow - handle medium tasks independently, improve something (docs, tests), set goals with your manager.
- Show eagerness to learn and humility; avoid promising to change everything.`,
  ),
  q(
    "time-management",
    "Tell me about a time you had to deliver under extreme time pressure.",
    "Deadlines",
    "HARD",
    `Describe the most time-pressured situation you have been in. How did you plan, what did you sacrifice, and what was the result?`,
    `Maps to Amazon's "Deliver Results".
- Situation: e.g. a client changed requirements three days before a hackathon final.
- Action: re-scoped with the team to core features, split work by strength, ran short check-ins every few hours, kept a working build at all times, cut nice-to-haves explicitly.
- Result: delivered a working demo; note any trade-offs made consciously (e.g. limited test coverage, addressed after).
- Learning: time pressure is managed by scope, focus and communication, not just longer hours.`,
    { company: "Amazon" },
  ),
  q(
    "time-management",
    "How do you balance speed and quality?",
    "Prioritisation",
    "HARD",
    `Your manager wants a feature shipped fast. You know cutting corners will create technical debt. How do you decide what to do?`,
    `- Understand why speed matters (customer commitment, demo, competition).
- Separate non-negotiables (correctness, security, data integrity) from things that can wait (perfect refactor, nice UI polish).
- Propose a plan: ship a smaller, well-tested scope first, then iterate.
- Make the trade-off explicit and visible: log technical debt tickets with the agreed follow-up.
- Avoid both extremes: perfectionism that misses the window, and shipping broken code.`,
  ),
  q(
    "time-management",
    "Are you comfortable working in shifts or extended hours when needed?",
    "Work-Life Balance",
    "HARD",
    `Service companies often support clients in other time zones. Would you be willing to work in rotational shifts or extend your hours during critical releases?`,
    `- Be honest; do not say yes if you truly cannot.
- A balanced answer: "Yes, I understand client projects sometimes need it, especially during releases or for US/UK clients. I plan my routine to stay productive."
- Show you manage energy: proper sleep, health, planning around shifts.
- Mention any genuine constraints politely, if they exist.
- Avoid sounding reluctant or demanding in a first conversation.`,
    { company: "TCS" },
  ),
  q(
    "time-management",
    "How do you avoid burnout?",
    "Work-Life Balance",
    "HARD",
    `Long hours of preparation or work can lead to exhaustion. How do you keep yourself productive over a long period?`,
    `- Recognise early signs: constant tiredness, irritability, loss of interest, dropping quality.
- Sustainable routine: sleep 7-8 hours, exercise, breaks.
- Plan realistically; avoid over-committing.
- Separate work and rest time; have a hobby.
- Talk to a mentor/manager when the workload is unsustainable.
- Perspective: consistent effort beats short bursts of overwork.`,
  ),
  q(
    "time-management",
    "Describe how you plan a typical week.",
    "Planning",
    "HARD",
    `Walk me through how you plan your week and how you handle the plan going wrong by Wednesday.`,
    `- Weekly review (e.g. Sunday): look at deadlines, list top 3 outcomes for the week.
- Block time in the calendar for the most important work first.
- Leave buffer time for unexpected work (20-30%).
- Daily: pick the top 1-3 tasks each morning.
- When it goes wrong: re-prioritise mid-week, drop or move low-value tasks, communicate any slips early.
- End-of-week reflection: what worked, what to change next week.`,
  ),

  // ---------------------------------------------------------------- leadership
  q(
    "leadership",
    "What does leadership mean to you?",
    "Leadership Style",
    "EASY",
    `Freshers are not managers, but interviewers still ask about leadership. What does it mean to you?`,
    `- Leadership is influence and responsibility, not a title.
- Setting direction, helping others succeed, taking ownership of outcomes.
- Leading by example: being reliable, calm under pressure, honest.
- Anyone can lead: owning a module, mentoring a junior, improving a process.
- Back it up with a short example from college (club, project, event).`,
  ),
  q(
    "leadership",
    "Tell me about a time you took initiative.",
    "Initiative",
    "EASY",
    `Describe a situation where you started something without being asked.`,
    `STAR example:
- Situation: juniors struggled with the data structures course.
- Action: started weekly doubt-solving sessions, created a problem sheet, got two friends to co-host.
- Result: 40+ regular attendees; faculty supported it the next semester.
- Show: you noticed a gap, acted, involved others, and sustained it.`,
  ),
  q(
    "leadership",
    "Have you ever led a team? Tell me about it.",
    "Leadership Style",
    "EASY",
    `Describe an experience where you led a group - in a project, club, event or sports team.`,
    `- Context: team size, goal, timeline.
- Your actions as leader: set goals, divided work based on strengths, ran regular check-ins, removed blockers, handled a conflict.
- Result with numbers if possible: event footfall, project grade, competition ranking.
- One thing you learned about leading people.
- Even small roles count (hackathon team lead, class representative).`,
  ),
  q(
    "leadership",
    "What qualities make a good leader?",
    "Leadership Style",
    "EASY",
    `List the qualities you think are most important in a leader and explain one in detail.`,
    `- Integrity and honesty.
- Clear communication and vision.
- Empathy: understanding team members' strengths and concerns.
- Accountability: takes blame, shares credit.
- Decisiveness with openness to input.
- Developing others.
Pick one and explain with an example of a leader you admire (teacher, senior, manager) and what they did.`,
  ),
  q(
    "leadership",
    "How do you motivate a team member who has lost interest?",
    "Motivating Others",
    "EASY",
    `In your project team, one person has become disengaged and is doing the bare minimum. As the team lead, what do you do?`,
    `- Talk 1:1 to understand why: boring task, personal issues, feeling unheard, skill gap.
- Connect their work to the bigger goal and its impact.
- Give them a task matching their interests or strengths, or more ownership.
- Recognise their contributions publicly.
- Set small, achievable goals and check in regularly.
- Respect personal issues and offer flexibility where possible.`,
  ),
  q(
    "leadership",
    "Tell me about a time you took ownership of a problem that was not yours.",
    "Ownership",
    "EASY",
    `Describe a situation where you saw a problem outside your responsibility and decided to fix it.`,
    `Maps to Amazon's "Ownership".
- Situation: e.g. the shared project repo had no setup instructions and new members lost days.
- Action: wrote a setup guide and a script, checked with others before changing shared files.
- Result: onboarding time dropped from 2 days to 2 hours.
- Show: acting for the long-term good of the team, not "that's not my job".`,
    { company: "Amazon" },
  ),
  q(
    "leadership",
    "How do you lead without authority?",
    "Influence",
    "EASY",
    `As a junior engineer you have no direct reports. How can you still show leadership?`,
    `- Own your work fully and deliver reliably - credibility comes first.
- Share knowledge: write docs, run a knowledge-sharing session.
- Propose improvements with evidence and do the first part yourself.
- Help teammates and new joiners.
- Influence through relationships and data, not position.
- Example: proposing and setting up a linting rule that the whole team adopted.`,
  ),
  q(
    "leadership",
    "How do you delegate tasks in a team?",
    "Delegation",
    "MEDIUM",
    `You are leading a five-member team organising a college tech fest. How do you decide who does what?`,
    `- Break the event into workstreams: sponsorship, logistics, technical events, publicity, registrations.
- Match tasks to strengths and interests, and also give growth opportunities.
- Be clear about expected outcomes, deadlines and decision authority.
- Do not micromanage; set check-in points.
- Stay available to unblock.
- Recognise good work and take responsibility if something fails.`,
  ),
  q(
    "leadership",
    "Tell me about a time you had to make an unpopular decision.",
    "Decision Making",
    "MEDIUM",
    `Describe a situation where you made a decision that your team or peers did not like. How did you handle it?`,
    `- Situation: e.g. cutting a feature the team loved to meet the submission deadline.
- Explain your reasoning: the data and trade-offs.
- Action: listened to objections, explained transparently, acknowledged the disappointment, offered a path (add it in v2).
- Result: delivered on time; the team understood afterwards.
- Show you can make tough calls while respecting people.`,
  ),
  q(
    "leadership",
    "How do you handle a team member who repeatedly misses deadlines?",
    "Motivating Others",
    "MEDIUM",
    `As a project lead, one teammate has missed three deadlines in a row. What do you do?`,
    `- Have a private, non-judgemental conversation to find the cause.
- Check whether the expectations and estimates were clear and realistic.
- Agree on smaller milestones with more frequent check-ins.
- Provide support: pairing, resources, reducing load.
- Document agreements; if there is no improvement, escalate to the mentor/manager.
- Protect the team's deadline by planning a fallback.`,
  ),
  q(
    "leadership",
    "Tell me about a time you mentored someone.",
    "Motivating Others",
    "MEDIUM",
    `Describe a time you helped someone learn a skill or grow. What approach did you take?`,
    `- Situation: e.g. helped a junior prepare for their first internship interview.
- Action: assessed their level, made a 4-week plan, did weekly mock interviews, gave specific feedback, encouraged them to solve problems themselves.
- Result: they cleared the interview.
- Key points: patience, guiding rather than doing it for them, adapting to their learning style.`,
  ),
  q(
    "leadership",
    "How do you handle failure as a leader?",
    "Ownership",
    "MEDIUM",
    `Your team's project lost in the final round of a competition partly due to your decisions as lead. How do you respond?`,
    `- Take responsibility publicly; do not blame team members.
- Acknowledge everyone's effort.
- Hold a blameless retrospective: what went well, what did not, why.
- Identify concrete changes for next time.
- Keep morale up: frame it as learning.
- Apply the lessons and show improvement in the next attempt.`,
  ),
  q(
    "leadership",
    "Tell me about a time you acted quickly without having all the information.",
    "Initiative",
    "MEDIUM",
    `Describe a situation where waiting for complete information would have been costly, so you acted. What happened?`,
    `Maps to Amazon's "Bias for Action".
- Situation: e.g. on event day, the registration site went down an hour before the start.
- Action: switched to a backup Google Form and announced it within 10 minutes while a teammate debugged the site.
- Result: registrations continued with minimal loss.
- Note why it was a calculated risk: the action was reversible.`,
    { company: "Amazon" },
  ),
  q(
    "leadership",
    "How would you convince your team to adopt a new tool or practice?",
    "Influence",
    "MEDIUM",
    `You think your team should start writing unit tests (or use Git branches properly), but they see it as extra work. How do you get buy-in?`,
    `- Understand their concerns: time, learning curve.
- Show the problem with data: bugs found late, time lost to regressions.
- Start small: a pilot on one module, do it yourself first.
- Make it easy: templates, a short demo session, CI checks.
- Share results: fewer bugs, faster reviews.
- Involve others in shaping the practice so they own it.`,
  ),
  q(
    "leadership",
    "Tell me about a time you earned the trust of a team or stakeholder.",
    "Influence",
    "HARD",
    `Describe a situation where people were initially skeptical of you, and how you earned their trust.`,
    `Maps to Amazon's "Earn Trust".
- Situation: e.g. new coordinator of a club where seniors doubted a second-year student.
- Action: listened first, kept every small promise, admitted mistakes openly, shared credit, communicated transparently about budget and decisions.
- Result: given larger responsibilities later (e.g. ran the annual fest).
- Show: trust is built through consistent behaviour over time.`,
    { company: "Amazon" },
  ),
  q(
    "leadership",
    "Tell me about a time you put the customer first.",
    "Ownership",
    "HARD",
    `Describe a situation where you went out of your way for a user or customer, even when it was inconvenient.`,
    `Maps to Amazon's "Customer Obsession".
- Situation: e.g. users of your college app complained the timetable was hard to read on small phones.
- Action: spoke to 10 users, observed how they used it, redesigned the screen, tested again with them.
- Result: complaints dropped, usage rose.
- Show: you started from the customer and worked backwards, used their feedback, not your assumptions.`,
    { company: "Amazon" },
  ),
  q(
    "leadership",
    "How would you handle conflict between two of your team members?",
    "Conflict",
    "HARD",
    `As a project lead, two team members argue constantly about technical choices and it is slowing the project. What do you do?`,
    `- Talk to each separately to understand their views and underlying concerns.
- Bring them together, set ground rules: focus on the problem, not the person.
- Define decision criteria (requirements, deadline, maintainability).
- Use data or a quick prototype to settle technical disagreements.
- Make a clear decision if they cannot agree, explain why, and ask both to commit.
- Clarify ownership boundaries to reduce future clashes.
- Follow up to ensure the relationship is working.`,
  ),
  q(
    "leadership",
    "Where do you see yourself in five years?",
    "Career Goals",
    "HARD",
    `A classic HR question. Where do you see yourself in five years, and how does this role fit?`,
    `- Show ambition that aligns with the company's path, not an exit plan.
- Example: "In five years I see myself as a strong engineer who owns significant parts of the product, mentors juniors and possibly leads a small team. I want to deepen my skills in backend systems."
- Connect: "This role gives me exposure to large-scale projects and good learning programs."
- Avoid: "I want to do an MBA/start my own company" unless asked; avoid "your job".
- Be realistic and sincere.`,
    { company: "Infosys" },
  ),
  q(
    "leadership",
    "Tell me about a time you set a high standard and held your team to it.",
    "Leadership Style",
    "HARD",
    `Describe a situation where you raised the quality bar for a project, even when others felt "good enough" was fine.`,
    `Maps to Amazon's "Insist on the Highest Standards".
- Situation: e.g. team wanted to submit a project with no tests and a buggy edge case.
- Action: explained the risk (demo failure, grade impact), set a clear checklist (test core flows, code review), helped fix the issues yourself.
- Result: smooth demo, praised for reliability.
- Balance: show you raised standards in a way that was reasonable for the deadline.`,
    { company: "Amazon" },
  ),

  // ---------------------------------------------------------------- workplace-etiquette
  q(
    "workplace-etiquette",
    "What is professionalism at the workplace?",
    "Professionalism",
    "EASY",
    `What does being professional mean to you as a fresher joining a company?`,
    `- Reliability: punctual, meets commitments, informs early when you cannot.
- Respect: for colleagues, their time and diverse backgrounds.
- Communication: clear, polite, appropriate tone in email and chat.
- Integrity: honest, follows policies, protects confidential information.
- Accountability: owns mistakes.
- Appropriate dress and behaviour for the workplace.
- Continuous learning and a positive attitude.`,
  ),
  q(
    "workplace-etiquette",
    "What is the correct etiquette for joining a video meeting?",
    "Meetings",
    "EASY",
    `Many teams work hybrid or remote. What should you do before and during an online meeting?`,
    `- Join on time (a minute early); test audio and video beforehand.
- Mute when not speaking; use headphones to avoid echo.
- Professional background and dress; camera on when expected.
- Have the agenda read and any material ready.
- Do not multitask visibly; avoid side conversations.
- Use the raise-hand feature or wait for a pause to speak.
- Follow up on action items assigned to you.`,
  ),
  q(
    "workplace-etiquette",
    "How should you address senior colleagues and managers?",
    "Professionalism",
    "EASY",
    `In Indian companies, some teams use first names and others use "Sir/Ma'am". How do you decide how to address seniors?`,
    `- Observe the team culture and follow it; many IT companies prefer first names.
- When unsure, ask politely or start formal and adjust.
- Clients: stay formal unless they invite otherwise.
- Respect is shown more through behaviour (listening, punctuality, tone) than titles.
- Be consistent in email and chat; avoid overly casual language with seniors.`,
  ),
  q(
    "workplace-etiquette",
    "What are the do's and don'ts of workplace chat (Slack/Teams)?",
    "Email Etiquette",
    "EASY",
    `How should you communicate on company chat tools?`,
    `Do:
- Write complete messages: "Hi Priya, could you review PR #42 by 4 pm? It blocks the release." rather than just "Hi".
- Use threads and the right channels.
- Respect status (DND, out of office) and working hours.
- Keep it professional; emojis in moderation per team culture.
Don't:
- Share confidential data in open channels.
- Spam @channel/@everyone.
- Discuss sensitive feedback in group chats.
- Expect instant replies to non-urgent messages.`,
  ),
  q(
    "workplace-etiquette",
    "How do you dress for an interview or the first day at work?",
    "Professionalism",
    "EASY",
    `What is the appropriate dress code for a campus interview and for your first day at an IT company?`,
    `- Interview: formal - clean, ironed shirt/formal top, formal trousers or saree/salwar, polished shoes; neat grooming.
- Video interview: formal top, plain background.
- First day: business formal or smart casual; check the joining email for the dress code.
- Many IT companies are business casual on regular days and casual on Fridays; observe and follow.
- Avoid strong perfume, flashy accessories, slogans on T-shirts.`,
  ),
  q(
    "workplace-etiquette",
    "Why should you be punctual at work?",
    "Professionalism",
    "EASY",
    `Some people think being 10 minutes late to meetings is no big deal. What is your view?`,
    `- Punctuality respects others' time; 10 minutes late in a 6-person meeting wastes an hour of total time.
- It builds trust and shows reliability.
- Late arrivals interrupt flow and often force repetition.
- If you will be late, inform in advance and catch up on notes yourself.
- The same applies to deadlines: on-time delivery is part of professionalism.`,
  ),
  q(
    "workplace-etiquette",
    "How do you respond to a colleague's email that is rude?",
    "Email Etiquette",
    "EASY",
    `A colleague sends you a sharply worded email, copying your manager, blaming you for a delay. How do you reply?`,
    `- Do not reply immediately in anger; wait and draft calmly.
- Stay factual and polite: timeline, what was agreed, current status.
- Avoid accusations or sarcasm; focus on resolving the issue.
- If it is a misunderstanding, suggest a quick call.
- Keep the same recipients (including the manager) for transparency, unless a private conversation is better.
- Talk to the person later 1:1 about how to communicate in future.`,
  ),
  q(
    "workplace-etiquette",
    "What would you do if you discovered a colleague doing something unethical?",
    "Ethics",
    "MEDIUM",
    `You notice a colleague copying customer data to a personal drive, or falsely filling timesheets. What do you do?`,
    `- Do not ignore it and do not gossip about it.
- Gather facts; avoid assumptions.
- Depending on severity: for minor matters, speak to the person; for serious ones (data leakage, fraud), report to your manager or the ethics/compliance channel.
- Follow company policy (code of conduct, whistleblower policy).
- Keep it confidential.
- Interviewers look for integrity even when it is uncomfortable.`,
  ),
  q(
    "workplace-etiquette",
    "How do you handle confidential information?",
    "Ethics",
    "MEDIUM",
    `As a developer you may access client data, source code and internal plans. What practices do you follow?`,
    `- Follow NDA and company security policies.
- Access only what you need for your task.
- Never share credentials or confidential code on personal devices, public repos or ChatGPT-like tools unless approved.
- Do not discuss client names or projects publicly or on social media.
- Lock your screen when away; use approved tools and VPN.
- Report any accidental leak immediately.`,
  ),
  q(
    "workplace-etiquette",
    "What is the right way to raise a concern with your manager?",
    "Professionalism",
    "MEDIUM",
    `You feel your workload is unfairly high compared to your teammates. How do you raise this?`,
    `- Pick the right setting: a 1:1, not a team meeting or chat.
- Prepare facts: list of tasks, hours, deadlines.
- Focus on impact and solutions, not complaints about colleagues: "To deliver X and Y with quality, I need help with Z, or a change in priorities."
- Listen to their perspective.
- Agree on next steps and follow up.`,
  ),
  q(
    "workplace-etiquette",
    "How do you run an effective meeting?",
    "Meetings",
    "MEDIUM",
    `You have to organise a meeting with five people to decide on a design. How do you make it productive?`,
    `- Ask: does this need a meeting, or can it be an email/doc?
- Send an agenda and pre-read in advance, with the decision needed.
- Invite only necessary people.
- Start and end on time; keep to the agenda; park off-topic items.
- Make sure quiet participants are heard.
- End with decisions, action items, owners and dates.
- Send short minutes afterwards.`,
  ),
  q(
    "workplace-etiquette",
    "How would you behave in a culturally diverse team?",
    "Corporate Culture",
    "MEDIUM",
    `Your team includes people from different states, countries, religions and age groups. What do you keep in mind?`,
    `- Respect differences in language, festivals, food and communication styles.
- Use a common language (usually English) in group settings so nobody is left out.
- Avoid stereotypes and jokes about region, religion, gender or caste.
- Be mindful of time zones and holidays when scheduling.
- Be curious and open; ask respectfully.
- Report harassment or discrimination through proper channels.`,
  ),
  q(
    "workplace-etiquette",
    "Are you willing to relocate to any location?",
    "Corporate Culture",
    "MEDIUM",
    `Large service companies post freshers to any of their development centres across India. Are you comfortable relocating?`,
    `- A standard question in mass-recruitment HR rounds.
- If you are flexible, say so with a reason: "Yes. I see it as a chance to experience a new city and work culture, and I adapt easily - I already lived in a hostel away from home for four years."
- If you have genuine constraints, mention them honestly but politely; do not invent them.
- Avoid conditions like "only Bengaluru" in the first round unless absolutely necessary.`,
    { company: "TCS" },
  ),
  q(
    "workplace-etiquette",
    "Why do you want to join a service-based company?",
    "Corporate Culture",
    "MEDIUM",
    `Many students prefer product companies. Why do you want to work at a service company like ours?`,
    `- Exposure to different domains, clients and technologies.
- Structured training programs for freshers.
- Large, stable organisations with clear career paths and global opportunities (onsite).
- Experience working with real enterprise clients and processes.
- Mention something specific about the company: its training program, a domain it is strong in, its values.
- Avoid sounding like it is a backup option.`,
    { company: "Infosys" },
  ),
  q(
    "workplace-etiquette",
    "How do you handle feedback from your manager in a performance review?",
    "Feedback",
    "MEDIUM",
    `In your first appraisal, your manager says you need to improve your communication with stakeholders. How do you respond?`,
    `- Listen fully without interrupting or getting defensive.
- Ask for specific examples and what "good" looks like.
- Thank them; feedback shows they invest in you.
- Agree on a concrete plan: e.g. send weekly status emails, present in sprint demos.
- Ask for a check-in after a month.
- If you disagree with parts, discuss calmly with facts.`,
  ),
  q(
    "workplace-etiquette",
    "What would you do if your manager asked you to do something you believe is wrong?",
    "Ethics",
    "HARD",
    `Your manager asks you to mark test cases as "passed" in the report even though some failed, to meet a release date. What do you do?`,
    `- Do not falsify; integrity is non-negotiable.
- Respond respectfully, not confrontationally: explain the risk to the client, the company and the team.
- Offer alternatives: report actual results with a mitigation plan, release with known issues documented, fix the critical failures quickly, or move the date.
- If pressured to proceed, escalate through proper channels (skip-level manager, ethics policy).
- Document the conversation.`,
    { role: "QA Engineer" },
  ),
  q(
    "workplace-etiquette",
    "How do you handle office politics?",
    "Corporate Culture",
    "HARD",
    `Some teams have cliques, gossip and favouritism. How do you navigate this as a new joiner?`,
    `- Focus on doing excellent, visible work.
- Stay neutral; do not take sides or spread gossip.
- Build genuine relationships across the team, not just one group.
- Communicate directly with people instead of through others.
- Keep your manager informed of your work and progress.
- If something crosses into harassment or unfairness, use formal channels.`,
  ),
  q(
    "workplace-etiquette",
    "How do you handle a situation where a client asks for something outside the agreed scope?",
    "Professionalism",
    "HARD",
    `During a client call, the client asks you directly to "quickly add" a new feature not in the contract. You are a junior developer. What do you do?`,
    `- Be polite and positive: "Thanks, that sounds useful."
- Do not commit on the spot; scope and pricing decisions belong to your manager/project lead.
- Note the request clearly and say you will discuss with the team and come back.
- Inform your manager promptly with details.
- Follow the change-request process.
- This protects the project timeline and the client relationship.`,
  ),
  q(
    "workplace-etiquette",
    "What would you do if you had a conflict with your manager?",
    "Feedback",
    "HARD",
    `You strongly disagree with how your manager is handling your project and feel your ideas are being ignored. What do you do?`,
    `- Reflect first: is it about the work or your feelings?
- Request a 1:1, come prepared with specific points and suggestions.
- Use "I" statements: "I feel my suggestions on testing are not being considered; can we discuss them?"
- Listen to their constraints; they may have information you lack.
- Find common ground on goals.
- If unresolved and serious, seek advice from HR or a mentor, using proper channels.
- Avoid complaining to colleagues or going around your manager first.`,
  ),
  q(
    "workplace-etiquette",
    "Why should we hire you?",
    "Professionalism",
    "HARD",
    `The final HR question in many campus interviews. Convince me in under a minute.`,
    `- Match your strengths to the role's needs: skills, attitude, evidence.
- Example: "You need engineers who can learn fast and deliver. I have strong DSA and Java fundamentals, built and deployed two full-stack projects, and led a 5-member hackathon team to a top-3 finish. I am adaptable, I take feedback seriously, and I am excited to grow with your team."
- Be confident, not arrogant; no comparisons with other candidates.
- Keep it concise and end with enthusiasm for the role.`,
  ),
];
