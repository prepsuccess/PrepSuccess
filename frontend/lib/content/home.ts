export const hero = {
  eyebrow: "For BCA, B.Tech and MCA students heading into placements",
  title: "Find your weak topics before the interviewer does.",
  description:
    "Tell PrepSuccess the skills you'd put on your resume. It checks each one with adaptive questions, marks what needs revision, and gives you study material, hands-on tasks, real interview questions and an AI coach to close the gap.",
  facts: ["Free to use", "No card needed", "AI coach free for your first 4 months"],
};

// Illustrative sample shown in the hero — product mock-up data, not a real student.
// Marks are out of 100; anything below the pass mark is flagged for revision.
export const marksheet = {
  student: { name: "Asha Verma", course: "BCA · Year 3", target: "Frontend developer" },
  passMark: 40,
  subjects: [
    { name: "HTML & CSS", marks: 88 },
    { name: "JavaScript", marks: 71 },
    { name: "SQL", marks: 34 },
    { name: "Aptitude", marks: 58 },
    { name: "Communication", marks: 64 },
  ],
  next: "SQL joins and GROUP BY · 3 short lessons",
};

export const onboardingChat: { from: "agent" | "user"; text: string }[] = [
  { from: "agent", text: "Hi! Which year are you in, and what's your branch?" },
  { from: "user", text: "Final year, BCA." },
  { from: "agent", text: "Nice. Which skills would you say you already know?" },
  { from: "user", text: "HTML, CSS, JavaScript — and some SQL." },
  { from: "agent", text: "Great — let's check JavaScript first with a quick check." },
];

export const topics = [
  "Data structures",
  "Algorithms",
  "JavaScript",
  "HTML & CSS",
  "SQL & DBMS",
  "OOP",
  "Operating systems",
  "Computer networks",
  "Quantitative aptitude",
  "Logical reasoning",
  "Verbal ability",
  "Communication",
  "Python",
  "Java",
  "React",
  "Data interpretation",
];

export const pillars = [
  {
    title: "Conversational onboarding",
    description:
      "No forms. The AI asks about your studies, skills and goals, and builds your profile from the chat.",
  },
  {
    title: "Real skill checks",
    description:
      "Adaptive checks for 36 skills. Pick 10 to 30 questions; they get harder when you're right and easier when you're not, then you're scored against a pass mark.",
  },
  {
    title: "A fix for every gap",
    description:
      "Every skill comes with study material, five hands-on tasks marked by AI, and real interview questions, so a weak topic is a starting point, never just a label.",
  },
] as const;

export type TrackPreview = "code" | "task" | "aptitude" | "communication";

/** How a skill is tested. Each maps to a real assessment mode (PRD-01 §3.5). */
export type TestMethod = "questions" | "task" | "written";

export const tracks: {
  category: string;
  title: string;
  topics: string[];
  methods: TestMethod[];
}[] = [
  {
    category: "Technical",
    title: "Data structures & problem solving",
    topics: ["Arrays", "Strings", "Linked lists", "Trees", "Dynamic programming"],
    methods: ["questions", "task"],
  },
  {
    category: "Technical",
    title: "Web development",
    topics: ["HTML", "CSS", "JavaScript", "React"],
    methods: ["questions", "task"],
  },
  {
    category: "Aptitude",
    title: "Quantitative & logical reasoning",
    topics: ["Percentages", "Time & work", "Probability", "Puzzles"],
    methods: ["questions"],
  },
  {
    category: "Soft skills",
    title: "Communication & teamwork",
    topics: ["Written answers", "Emails", "STAR stories"],
    methods: ["written"],
  },
];

// One skill walked through the check, end to end. Illustrative example, not a real student.
export const skillCheck = {
  skill: "JavaScript",
  passMark: 40,
  marks: 71,
  steps: [
    {
      title: "You claim it",
      body: "“I know JavaScript.” One line in the onboarding chat, no form to fill in.",
    },
    {
      title: "Adaptive questions",
      body: "Pick 10 to 30 questions on arrays, closures and async code. Get one right and the next is harder; miss one and it eases off.",
    },
    {
      title: "Hands-on practice",
      body: "Five tasks per skill in a real code editor. Run JavaScript in the browser; the AI marks your code against a rubric.",
    },
    {
      title: "Your mark",
      body: "Scored out of 100 and compared with the pass mark, so you know if it's mastered or needs revision.",
    },
  ],
};

export const dashboardLeft = [
  {
    title: "Overall readiness score",
    description: "One number out of 100, updated as you keep going.",
  },
  { title: "Topics completed", description: "Every topic you've taken past the pass mark." },
  {
    title: "Topics needing revision",
    description: "Ranked by how far below the pass mark they are.",
  },
];

export const dashboardRight = [
  { title: "AI-recommended next steps", description: "A short plan, based only on your results." },
  { title: "Learning resources", description: "Study material for each weak topic." },
  {
    title: "Interview practice",
    description: "Questions you've solved each week, and links to practise your weak skills.",
  },
];

export const loopSteps = [
  {
    step: "01",
    label: "Sign up",
    title: "Sign up in seconds",
    description:
      "Email and password, or one click with Google. There's no long form waiting on the other side.",
    detail: "Email or Google",
  },
  {
    step: "02",
    label: "Onboard",
    title: "Talk to your AI agent",
    description:
      "It asks about your year, branch, skills, experience, interests and goals — the way a senior would — and builds your profile from the answers.",
    detail: "Saved to your profile",
  },
  {
    step: "03",
    label: "Assess",
    title: "Prove your skills",
    description:
      "For each skill you claim, a quick question or a small task. Clear the pass mark and it's mastered — fall short and it's marked for revision.",
    detail: "Mastered · Needs revision",
  },
  {
    step: "04",
    label: "Improve",
    title: "Practise and improve",
    description:
      "Study, do hands-on tasks, practise real interview questions and ask your AI coach. Your dashboard tracks it all and updates every time you come back.",
    detail: "Updated as you progress",
  },
];

export const roadmap = [
  {
    phase: "Available now",
    title: "Interview question bank",
    description:
      "About 700 interview questions by company, role and topic, with model answers, bookmarks and your progress saved.",
    tags: ["Company", "Role", "Topic"],
    preview: "questions",
  },
  {
    phase: "Coming soon",
    title: "1:1 mentor sessions",
    description:
      "Book a verified developer, meet on video, and get notes that land on your dashboard.",
    tags: ["Video", "Chat", "Notes"],
    preview: "mentor",
  },
  {
    phase: "Coming soon",
    title: "Resume feedback & report",
    description: "AI resume review for your target role, and a personalised readiness report.",
    tags: ["Resume", "PDF", "Role-tuned"],
    preview: "resume",
  },
] as const;

export const faqs = [
  {
    question: "How much does it cost?",
    answer:
      "PrepSuccess is free to use, and the AI coach is free for your first 4 months. We never ask for card details.",
  },
  {
    question: "How is this different from a mock test?",
    answer:
      "There's no fixed paper. The AI checks only the skills you claim, scores your real answers, and tells you what's mastered and what needs revision.",
  },
  {
    question: "What happens when I'm weak in a topic?",
    answer:
      "It's marked for revision and comes with study material right away. Study, then come back and check it again.",
  },
  {
    question: "Is there someone to ask when I'm stuck?",
    answer:
      "Yes. The AI coach in the corner of every page knows your results and can tell you what to study next, give hints on a task, or explain how anything works. You get 20 messages a day.",
  },
  {
    question: "Can the AI make things up about me?",
    answer:
      "No. Everything it tells you comes from your own answers and results — never a skill or score you don't have.",
  },
  {
    question: "Will there be human mentors?",
    answer:
      "Yes — 1:1 sessions with verified developers are coming soon, and your mentor will start from your real gaps.",
  },
];

export const resources = {
  featured: {
    type: "Needs revision",
    title: "Dynamic programming",
    description:
      "Below the pass mark, so your dashboard pairs it with material for exactly this gap — then lets you check it again.",
    meta: ["Flagged after a check", "Re-check anytime"],
  },
  items: [
    {
      type: "Reference",
      title: "Concise explanations",
      description: "The core idea of a topic, written to be read in one sitting.",
    },
    {
      type: "Example",
      title: "Worked examples",
      description: "Step-by-step solutions that show the reasoning, not just the answer.",
    },
    {
      type: "Practice",
      title: "Practical tasks",
      description:
        "Five hands-on tasks per skill in a real code editor, marked by AI with feedback.",
    },
  ],
};
