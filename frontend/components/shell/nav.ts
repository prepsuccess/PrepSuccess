import type { LineIconName } from "@/components/ui/LineIcon";

export type ShellNavItem = { href: string; label: string; icon: LineIconName };

export const studentNav: ShellNavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "gauge" },
  { href: "/assessment", label: "Skill checks", icon: "checklist" },
  { href: "/profile", label: "Profile", icon: "person" },
];

export const adminNav: ShellNavItem[] = [
  { href: "/admin", label: "Overview", icon: "grid" },
  { href: "/admin/users", label: "Users", icon: "person" },
  { href: "/admin/mentors", label: "Mentor approvals", icon: "shield" },
  { href: "/admin/content", label: "Skills & questions", icon: "resume" },
  { href: "/admin/analytics", label: "Analytics", icon: "track" },
];
