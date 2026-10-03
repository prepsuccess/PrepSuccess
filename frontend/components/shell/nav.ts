import {
  BarChart3,
  BookOpen,
  FileText,
  MessagesSquare,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
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
];

/**
 * Navigation per app area. Layouts are server components and can't pass these
 * (they hold icon components) to the client shell, so they pass the key instead.
 */
export const navByArea = { student: studentNav, admin: adminNav } as const;
export type NavArea = keyof typeof navByArea;

/** The nav item a path belongs to; the first item (the area's home) only matches exactly. */
export function activeNavItem(items: ShellNavItem[], pathname: string) {
  const [home, ...rest] = items;
  const nested = rest.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  return nested ?? (home && pathname === home.href ? home : undefined);
}
