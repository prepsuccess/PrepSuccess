import {
  Braces,
  BrainCircuit,
  Calculator,
  Cpu,
  Database,
  Globe,
  Server,
  Shapes,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";

/**
 * Each topic's identity colour and icon (Duolingo-style: every area is
 * instantly recognisable). Green and red are left out on purpose — they mean
 * "mastered" and "needs revision" on this page. Icons sit on a soft tint in
 * 700 (light) / 300 (dark) ink, so they stay readable in both themes.
 * Class names are literal so Tailwind can see them.
 */
export interface TopicStyle {
  icon: LucideIcon;
  /** Soft background for icon chips. */
  tint: string;
  /** Icon/text colour on the tint. */
  ink: string;
}

const STYLES: Record<string, TopicStyle> = {
  "Web development": {
    icon: Globe,
    tint: "bg-sky-500/12",
    ink: "text-sky-700 dark:text-sky-300",
  },
  "Backend development": {
    icon: Server,
    tint: "bg-violet-500/12",
    ink: "text-violet-700 dark:text-violet-300",
  },
  "Programming languages": {
    icon: Braces,
    tint: "bg-orange-500/12",
    ink: "text-orange-700 dark:text-orange-300",
  },
  "CS fundamentals": {
    icon: Cpu,
    tint: "bg-indigo-500/12",
    ink: "text-indigo-700 dark:text-indigo-300",
  },
  Databases: {
    icon: Database,
    tint: "bg-cyan-500/12",
    ink: "text-cyan-700 dark:text-cyan-300",
  },
  Tools: {
    icon: Wrench,
    tint: "bg-slate-500/12",
    ink: "text-slate-700 dark:text-slate-300",
  },
  "Data & AI": {
    icon: BrainCircuit,
    tint: "bg-fuchsia-500/12",
    ink: "text-fuchsia-700 dark:text-fuchsia-300",
  },
  Aptitude: {
    icon: Calculator,
    tint: "bg-teal-500/12",
    ink: "text-teal-700 dark:text-teal-300",
  },
  "Soft skills": {
    icon: Users,
    tint: "bg-pink-500/12",
    ink: "text-pink-700 dark:text-pink-300",
  },
};

const FALLBACK: TopicStyle = {
  icon: Shapes,
  tint: "bg-zinc-500/12",
  ink: "text-zinc-700 dark:text-zinc-300",
};

export const topicStyle = (topic: string | null | undefined) =>
  (topic && STYLES[topic]) || FALLBACK;
