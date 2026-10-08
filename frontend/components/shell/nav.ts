import {
  BarChart3,
  BookOpen,
  FileText,
  MessagesSquare,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  MessageSquareText,
  ShieldCheck,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";

export type ShellNavItem = { href: string; label: string; icon: LucideIcon };

export const studentNav: ShellNavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/assessment", label: "Skill checks", icon: ListChecks },
  { href: "/learn", label: "Learn", icon: GraduationCap },
  { href: "/questions", label: "Interview prep", icon: MessagesSquare },
  { href: "/prep-guides", label: "Prep guides", icon: FileText },
  { href: "/profile", label: "Profile", icon: UserRound },
];

export const adminNav: ShellNavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/mentors", label: "Mentor approvals", icon: ShieldCheck },
  { href: "/admin/content", label: "Skills & content", icon: BookOpen },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/feedback", label: "Feedback", icon: MessageSquareText },
];

/**
 * Navigation per app area. Layouts are server components and can't pass these
 * (they hold icon components) to the client shell, so they pass the key instead.
 */
export const navByArea = { student: studentNav, admin: adminNav } as const;
export type NavArea = keyof typeof navByArea;

// Pages without a nav item of their own, shown under the one they belong to.
const NAV_PARENTS: [prefix: string, href: string][] = [
  ["/tasks", "/learn"],
  ["/onboarding", "/dashboard"],
  // Reached from the dashboard's feedback card (and the notification bell).
  ["/feedback", "/dashboard"],
];

// Pages that highlight a parent in the sidebar but name themselves in the breadcrumb.
const PAGE_LABELS: [prefix: string, label: string][] = [
  ["/onboarding", "Getting started"],
  ["/feedback", "Feedback"],
];

/** The breadcrumb name for a page that has its own, or undefined to use its nav item's label. */
export function pageLabel(pathname: string): string | undefined {
  return PAGE_LABELS.find(
    ([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )?.[1];
}

/** The nav item a path belongs to; the first item (the area's home) only matches exactly. */
export function activeNavItem(items: ShellNavItem[], pathname: string): ShellNavItem | undefined {
  const parent = NAV_PARENTS.find(
    ([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (parent) {
    const item = items.find((candidate) => candidate.href === parent[1]);
    if (item) return item;
  }
  const [home, ...rest] = items;
  const nested = rest.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  return nested ?? (home && pathname === home.href ? home : undefined);
}
