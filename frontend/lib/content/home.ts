export const hero = {
  description:
    "Chat with an AI coach, prove the skills you claim, and get a clear plan for what to do next — built for college students heading into placements.",
};

// Illustrative sample student shown in the hero bento — product mock-up data, not user metrics.
export const bento = {
  claims: [
    { skill: "HTML / CSS", score: 88 },
    { skill: "JavaScript", score: 71 },
    { skill: "SQL", score: 34 },
  ],
  threshold: 40,
  overall: 72,
  trend: [48, 53, 51, 60, 64, 69, 72],
  rounds: [
    { label: "Resume", icon: "resume" },
    { label: "Aptitude", icon: "aptitude" },
    { label: "Technical", icon: "code" },
    { label: "Communication", icon: "chat" },
    { label: "HR", icon: "person" },
  ],
  currentRound: 2,
} as const;

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
  "Resume",
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
      "For each skill you claim, it sets a quick question or a small task, scores it, and checks it against a pass mark.",
  },
  {
    title: "A fix for every gap",
    description:
      "Anything below the pass mark comes with study material, so a weak topic is a starting point — never just a label.",
  },
] as const;

export type TrackPreview = "code" | "task" | "aptitude" | "communication";

export const tracks: {
  category: string;
  title: string;
  description: string;
  modes: [string, string];
  preview: TrackPreview;
}[] = [
  {
    category: "Technical",
    title: "Data structures & problem solving",
    description:
      "Arrays to dynamic programming — diagnosed topic by topic instead of one blended score.",
    modes: ["Quick questions", "Per-topic mastery"],
    preview: "code",
  },
  {
    category: "Technical",
    title: "Web development",
    description:
      "Claim HTML, CSS or JavaScript and prove it with a small hands-on task the AI evaluates.",
    modes: ["Practical task", "AI feedback"],
    preview: "task",
  },
  {
    category: "Aptitude",
    title: "Quantitative & logical reasoning",
    description:
      "The timed, pattern-based reasoning most placement drives test before the technical round.",
    modes: ["Quick questions", "Revision material"],
    preview: "aptitude",
  },
  {
    category: "Soft skills",
    title: "Communication & resume",
    description:
      "The skills that decide whether a strong technical score actually converts into an offer.",
    modes: ["Written responses", "AI feedback"],
    preview: "communication",
  },
];

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
    title: "Interview readiness",
    description: "Where you stand on technical, aptitude and soft skills.",
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
    title: "See where you stand",
    description:
      "Your dashboard shows completed topics, revision topics, resources and next steps — and updates every time you come back.",
    detail: "Updated as you progress",
  },
];

export const roadmap = [
  {
    phase: "Next up",
    title: "Interview question bank",
    description: "Practice questions by company, role and topic, with your progress saved.",
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
    description: "AI resume review for your target role, and a downloadable readiness report.",
    tags: ["Resume", "PDF", "Role-tuned"],
    preview: "resume",
  },
] as const;

export const faqs = [
  {
    question: "How much does it cost?",
    answer:
      "Your first month is free, with everything included. After that it's ₹149 a month, or less on a longer plan.",
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
      description: "Small hands-on tasks that the AI evaluates and feeds back on.",
    },
  ],
};
