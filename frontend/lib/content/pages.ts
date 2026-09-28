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
      body: "For each skill you claim, the AI sets a quick question to test your understanding, or a small task to see you use it.",
      points: [
        "Quick questions, topic by topic",
        "Small hands-on tasks with feedback",
        "Only the skills you claim — no fixed paper",
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
      body: "Anything below the pass mark comes with study material — short explanations, worked examples and practice — so you know exactly what to do next.",
      points: [
        "Explanations, examples and practice",
        "Picked for the exact topic you missed",
        "Come back and pick up where you left off",
      ],
    },
    {
      id: "dashboard",
      eyebrow: "Step 05 · Track",
      title: "One page that shows where you stand.",
      body: "Your dashboard lists what you've mastered, what still needs work, and what to do next — and it updates every time you practise.",
      points: [
        "Topics mastered and topics to revise",
        "Your next steps, in order",
        "Updated every time you practise",
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
    { title: "Free to start", description: "Your first month is free, with everything included." },
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
    ],
    modes: ["Quick questions", "Practical tasks", "AI feedback"],
    preview: "code",
  },
  {
    id: "aptitude",
    category: "Aptitude",
    title: "Aptitude",
    description:
      "The timed, pattern-based reasoning most placement drives test before any technical round is reached.",
    topics: ["Quantitative aptitude", "Logical reasoning", "Verbal ability"],
    modes: ["Quick questions", "Revision material"],
    preview: "aptitude",
  },
  {
    id: "soft-skills",
    category: "Soft skills",
    title: "Soft skills",
    description:
      "Communication and your resume — the skills that decide whether a strong technical score actually becomes an offer.",
    topics: ["Communication", "Resume"],
    modes: ["Written responses", "AI feedback"],
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

export type RoadmapVisual = "core" | "questions" | "mentor" | "resume" | "jobs";

export const roadmapItems = [
  {
    id: "live",
    status: "live now",
    title: "Know where you stand",
    why: "Chat with the AI, prove your skills, and get a dashboard with your next steps.",
    features: [
      "Sign up with email or Google",
      "AI onboarding chat",
      "Skill checks for everything you claim",
      "Study material for weak topics",
      "Your readiness dashboard",
    ],
    visual: "core",
  },
  {
    id: "interview-prep",
    status: "next up",
    title: "Interview prep",
    why: "Practice questions aimed straight at your gaps.",
    features: [
      "Questions by company, role and topic",
      "Save and track what you've solved",
      "See your progress over time",
    ],
    visual: "questions",
  },
  {
    id: "mentors",
    status: "coming soon",
    title: "1:1 mentors",
    why: "Some gaps close faster with a real person.",
    features: [
      "Video sessions with verified developers",
      "Book a time that suits you",
      "Session notes on your dashboard",
    ],
    visual: "mentor",
  },
  {
    id: "feedback",
    status: "coming soon",
    title: "Resume & interview feedback",
    why: "Sharper AI help for the last step before an offer.",
    features: [
      "AI resume feedback",
      "A downloadable readiness report",
      "Feedback on practice interviews",
    ],
    visual: "resume",
  },
  {
    id: "jobs",
    status: "later",
    title: "Jobs & internships",
    why: "Go from ready to applying without leaving PrepSuccess.",
    features: ["Job and internship listings", "Apply with your PrepSuccess profile"],
    visual: "jobs",
  },
] satisfies {
  id: string;
  status: string;
  title: string;
  why: string;
  features: string[];
  visual: RoadmapVisual;
}[];

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

// ₹149/month is the base; the 6-month and yearly notes are worked out from it.
export const pricing = {
  plans: [
    {
      id: "free",
      name: "First month",
      price: "₹0",
      period: "for 30 days",
      note: "Everything included. Try it properly.",
      cta: "Start free",
    },
    {
      id: "monthly",
      name: "Monthly",
      price: "₹149",
      period: "per month",
      note: "Pay month by month.",
      cta: "Choose monthly",
    },
    {
      id: "half-year",
      name: "6 months",
      price: "₹500",
      period: "for 6 months",
      note: "About ₹83 a month · save 44%",
      cta: "Choose 6 months",
    },
    {
      id: "yearly",
      name: "1 year",
      price: "₹800",
      period: "for 12 months",
      note: "About ₹67 a month · save 55%",
      cta: "Choose 1 year",
      featured: true,
    },
  ] satisfies Plan[],
  includes: [
    "AI onboarding chat",
    "Skill checks for everything you claim",
    "Study material for every gap",
    "Your readiness dashboard",
    "Check any topic again, any time",
  ],
  faqs: [
    {
      question: "Is the first month really free?",
      answer:
        "Yes. Your first month includes everything, so you can see where you stand before you pay anything.",
    },
    {
      question: "What happens after the free month?",
      answer:
        "Pick a plan to keep going: ₹149 a month, ₹500 for 6 months or ₹800 for a year. Every plan includes the same features.",
    },
    {
      question: "Which plan should I choose?",
      answer:
        "If placements are a few months away, 6 months or 1 year works out far cheaper than paying monthly.",
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
