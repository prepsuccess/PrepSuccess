import type { Point } from "./site";
import type { TrackPreview } from "./home";

export const howItWorks = {
  description:
    "Sign up, chat with the AI, prove your skills, and get a clear plan. Here's each step.",
  steps: [
    {
      id: "onboarding",
      eyebrow: "Step 01 · Chat",
      title: "A conversation, not a form.",
      body: "The AI asks what a good senior would: your year and branch, the skills you know, your projects, and the role you want.",
      points: [
        "Your studies and background",
        "The skills you claim, in your own words",
        "Your goals and interests",
        "Saved to your profile",
      ],
    },
    {
      id: "assessment",
      eyebrow: "Step 02 · Check",
      title: "Every skill gets checked.",
      body: "Pick a skill and how many questions you want (10 to 30). The questions adapt: harder when you're right, easier when you're not.",
      points: [
        "36 skills: technical, aptitude and soft skills",
        "Adaptive difficulty, question by question",
        "Review every answer with an explanation afterwards",
      ],
    },
    {
      id: "pass-mark",
      eyebrow: "Step 03 · Score",
      title: "One pass mark: mastered, or revise.",
      body: "Each answer is scored against a pass mark. Clear it and the topic is mastered. Fall short and it's marked for revision — never hidden in an average.",
      points: [
        "Scored topic by topic",
        "Mastered or needs revision",
        "Check any topic again, any time",
      ],
    },
    {
      id: "study",
      eyebrow: "Step 04 · Improve",
      title: "Every gap comes with a fix.",
      body: "Every skill has study material, five hands-on tasks in a real code editor, and real interview questions with model answers, so you know exactly what to do next.",
      points: [
        "Study material picked for each skill",
        "Hands-on tasks marked by AI against a rubric",
        "About 700 interview questions, plus free PDF prep guides",
        "An AI coach that knows your results",
      ],
    },
    {
      id: "dashboard",
      eyebrow: "Step 05 · Track",
      title: "One page that shows where you stand.",
      body: "Your dashboard lists what you've mastered, what still needs work, and what to do next — and it updates every time you practise.",
      points: [
        "Topics mastered and topics to revise",
        "Your readiness over time and questions solved each week",
        "Your next steps, in order",
      ],
    },
  ],
  principles: [
    {
      title: "Sticks to the facts",
      description:
        "Everything the AI tells you comes from your own answers — never a skill or score you don't have.",
    },
    {
      title: "Explains, not just labels",
      description:
        "A weak topic comes with why it matters and what to do about it, in plain words.",
    },
    {
      title: "Free to start",
      description: "Free to use, and the AI coach is free for your first 4 months.",
    },
  ] satisfies Point[],
};

export const trackGroups = [
  {
    id: "technical",
    category: "Technical",
    title: "Technical skills",
    description:
      "Core computer-science subjects and the web stack, diagnosed topic by topic — so a strong JavaScript score can't hide a weak SQL one.",
    topics: [
      "Data structures",
      "Algorithms",
      "JavaScript",
      "HTML & CSS",
      "SQL & DBMS",
      "OOP",
      "Operating systems",
      "Computer networks",
      "React",
      "Node.js",
      "Python",
      "Java",
      "Git & Linux",
      "Machine learning",
    ],
    modes: ["Adaptive questions", "Practical tasks", "Interview questions"],
    preview: "code",
  },
  {
    id: "aptitude",
    category: "Aptitude",
    title: "Aptitude",
    description:
      "The timed, pattern-based reasoning most placement drives test before any technical round is reached.",
    topics: ["Quantitative aptitude", "Logical reasoning", "Verbal ability", "Data interpretation"],
    modes: ["Adaptive questions", "Worked problems", "Formula guide"],
    preview: "aptitude",
  },
  {
    id: "soft-skills",
    category: "Soft skills",
    title: "Soft skills",
    description:
      "Communication, teamwork and the HR round — the skills that decide whether a strong technical score actually becomes an offer.",
    topics: [
      "Communication",
      "Teamwork",
      "Problem solving",
      "Time management",
      "Leadership",
      "Workplace etiquette",
    ],
    modes: ["Written responses", "AI feedback", "HR interview guide"],
    preview: "communication",
  },
] satisfies {
  id: string;
  category: string;
  title: string;
  description: string;
  topics: string[];
  modes: string[];
  preview: TrackPreview;
}[];

/** Where a feature stands. Update as things ship — the roadmap page reads straight from this. */
export type RoadmapStatus = "ready" | "building" | "planned";

export type RoadmapPhase = {
  id: string;
  phase: number;
  /** Now = being built, Next = straight after, Later = planned further out. */
  stage: "now" | "next" | "later";
  /** Honest timing — a date only when one is actually set. */
  timing: string;
  title: string;
  why: string;
  /** How this phase uses what came before it (from the phase PRDs). */
  buildsOn?: string;
  features: { label: string; status: RoadmapStatus }[];
};

// Phases follow docs/project-overview.md §6. Phase 1's launch date is the end of
// Sprint 3 (Nov 5); later phases have no committed dates yet, so none are shown.
export const roadmapItems: RoadmapPhase[] = [
  {
    id: "launch",
    phase: 1,
    stage: "now",
    timing: "Live now",
    title: "Know where you stand",
    why: "Tell the AI what you know, get each skill checked, and see exactly what to revise. This is the core of PrepSuccess, and everything after it builds on the results.",
    features: [
      { label: "Sign up with email or Google", status: "ready" },
      { label: "Your profile, editable any time", status: "ready" },
      { label: "AI onboarding chat", status: "ready" },
      { label: "Adaptive skill checks for 36 skills", status: "ready" },
      { label: "Study material and hands-on tasks", status: "ready" },
      { label: "Your readiness dashboard", status: "ready" },
      { label: "AI coach that knows your results", status: "ready" },
    ],
  },
  {
    id: "interview-prep",
    phase: 2,
    stage: "now",
    timing: "Live now",
    title: "Interview prep",
    why: "Practice questions aimed straight at your gaps, with your progress tracked over time instead of a single score.",
    buildsOn:
      "Questions are tagged with the same skills you were checked on, so the ones you see first are the ones you need most.",
    features: [
      { label: "Questions by company, role and topic", status: "ready" },
      { label: "Save and track what you've solved", status: "ready" },
      { label: "Your progress over time", status: "ready" },
      { label: "Free PDF prep guides", status: "ready" },
    ],
  },
  {
    id: "mentors",
    phase: 3,
    stage: "next",
    timing: "Next",
    title: "1:1 mentors",
    why: "Some gaps close faster with a real person: book a session with a verified developer and get notes you can act on.",
    buildsOn:
      "Your mentor sees only what the session needs, your target role and key gaps, never your full test history.",
    features: [
      { label: "Video sessions with verified developers", status: "planned" },
      { label: "Book a time that suits you", status: "planned" },
      { label: "Session notes on your dashboard", status: "planned" },
    ],
  },
  {
    id: "feedback",
    phase: 4,
    stage: "later",
    timing: "Planned",
    title: "Resume & interview feedback",
    why: "Sharper AI help for the last step before an offer, and PrepSuccess opens up to freshers and working professionals.",
    buildsOn:
      "Your resume feedback, mentor notes and AI suggestions all land in the same next-steps list on your dashboard.",
    features: [
      { label: "AI resume feedback for your target role", status: "planned" },
      { label: "A personalised readiness report", status: "planned" },
      { label: "Feedback on practice interviews", status: "planned" },
      { label: "Accounts for freshers and working professionals", status: "planned" },
    ],
  },
  {
    id: "jobs",
    phase: 5,
    stage: "later",
    timing: "Exploring",
    title: "Jobs & internships",
    why: "Go from ready to applying without leaving PrepSuccess.",
    buildsOn: "Listings are filtered by the target role you already set in your profile.",
    features: [
      { label: "Job and internship listings", status: "planned" },
      { label: "Apply with your PrepSuccess profile", status: "planned" },
    ],
  },
];

export const audiences = [
  {
    title: "College students",
    description: "BCA, B.Tech and similar courses, getting ready for placements.",
  },
  {
    title: "Freshers",
    description: "Coming soon — for graduates still looking for their first role.",
  },
  {
    title: "Working professionals",
    description: "Coming soon — check your skills before a switch or promotion.",
  },
] satisfies Point[];

export type Plan = {
  id: string;
  name: string;
  price: string;
  period: string;
  /** Short line under the price: what it works out to, or what it saves. */
  note: string;
  cta: string;
  featured?: boolean;
};

// Pricing model (docs/PROJECT_CONTEXT.md §4): the platform is free; the AI coach is a
// free trial (AI_TRIAL_DAYS = 120 on the backend). No paid plan has been decided yet.
export const pricing = {
  plans: [
    {
      id: "free",
      name: "PrepSuccess",
      price: "₹0",
      period: "free to use",
      note: "The AI coach is free for your first 4 months. No card details needed.",
      cta: "Start free",
      featured: true,
    },
  ] satisfies Plan[],
  includes: [
    "AI onboarding chat",
    "Adaptive skill checks for 36 skills",
    "Study material and hands-on tasks for every skill",
    "About 700 interview questions with model answers",
    "Free PDF prep guides",
    "Your readiness dashboard",
    "AI coach, 20 messages a day",
  ],
  faqs: [
    {
      question: "Is PrepSuccess really free?",
      answer:
        "Yes. Signing up, skill checks, study material, interview questions, prep guides and your readiness dashboard are free, and we never ask for card details.",
    },
    {
      question: "What is the AI free trial?",
      answer:
        "The AI features (the onboarding chat, adaptive skill checks, task marking, the coach chat and AI next steps) are free for your first 4 months. Your dashboard shows how many days are left.",
    },
    {
      question: "What happens when the AI trial ends?",
      answer:
        "We haven't set a price yet. We'll tell you well before your trial ends, and nothing is ever charged automatically, because we don't have your card.",
    },
    {
      question: "Are mentor sessions included?",
      answer: "Mentor sessions are coming soon and will be priced separately.",
    },
  ],
};

export const mentors = {
  description:
    "Verified developers meeting students 1:1 — starting from each student's real gaps, not a blank slate.",
  sees: ["Their target role", "Their key skill gaps", "Your notes from earlier sessions"],
  hidden: ["Their full test history", "Other mentors' sessions", "Other students' data"],
  steps: [
    {
      title: "Get verified",
      description: "Every mentor is reviewed and approved before students can book them.",
    },
    { title: "Set your hours", description: "Students book sessions around the times you choose." },
    {
      title: "Meet and follow up",
      description: "1:1 video sessions, plus chat with the students who booked you.",
    },
    {
      title: "Leave notes that stick",
      description: "Your notes show up on the student's dashboard as next steps.",
    },
  ] satisfies Point[],
};

export type Access = "yes" | "no" | string;

export const trust = {
  description:
    "The AI only talks about what's real, mentors see only what a session needs, and nobody browses your account.",
  principles: [
    {
      title: "The AI sticks to facts",
      description: "Everything it tells you comes from your own answers and results.",
    },
    {
      title: "Mentors see a slice",
      description:
        "Only what a session needs: your target role, your key gaps and their own earlier notes.",
    },
    {
      title: "Our team sees totals",
      description: "We look at overall numbers, and open an account only to help with support.",
    },
  ] satisfies Point[],
  permissions: [
    { capability: "Take skill checks", student: "yes", mentor: "no", admin: "no" },
    { capability: "See your own dashboard", student: "yes", mentor: "no", admin: "no" },
    {
      capability: "See someone else's dashboard",
      student: "no",
      mentor: "Session details only",
      admin: "For support only",
    },
    { capability: "Mentor sessions", student: "Book", mentor: "Run", admin: "no" },
    { capability: "Chat", student: "yes", mentor: "yes", admin: "To keep it safe" },
    { capability: "Manage skills and questions", student: "no", mentor: "no", admin: "yes" },
    { capability: "Approve mentors", student: "no", mentor: "no", admin: "yes" },
  ] satisfies { capability: string; student: Access; mentor: Access; admin: Access }[],
  security: [
    {
      title: "Private passwords",
      description: "Your password is never stored in a readable form.",
    },
    {
      title: "Short sessions",
      description: "Sign-in keys expire quickly and are cancelled when you log out.",
    },
    {
      title: "Protected sign-in",
      description: "Too many login attempts are slowed down to stop break-ins.",
    },
    {
      title: "Private links",
      description: "Your account and results can't be found by guessing a link.",
    },
  ] satisfies Point[],
};

export const about = {
  description:
    "A small team of engineers and designers, building the placement coach we wish we'd had — one that tells students where they stand, honestly.",
  values: [
    {
      title: "Honest answers",
      description: "We show you where you really stand, even when it isn't what you hoped to hear.",
    },
    {
      title: "Students first",
      description: "Every feature starts from a question students actually ask before placements.",
    },
    {
      title: "Your data stays yours",
      description: "Your results are private. A mentor sees only what a session you book needs.",
    },
  ] satisfies Point[],
  contact: [
    {
      title: "Students",
      description: "Questions about your account, your plan or a skill check.",
      subject: "Question from a student",
    },
    {
      title: "Mentors",
      description: "Want to mentor students on PrepSuccess? Tell us about yourself.",
      subject: "Mentoring on PrepSuccess",
    },
    {
      title: "Everyone else",
      description: "Feedback, bugs, ideas — we read every message.",
      subject: "Hello PrepSuccess",
    },
  ],
};
