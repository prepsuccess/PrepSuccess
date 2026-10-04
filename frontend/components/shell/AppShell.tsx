"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLayoutEffect, useState, type ReactNode } from "react";
import { LogOut, Monitor, Moon, ShieldCheck, Sun, UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shadcn/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/shadcn/breadcrumb";
import { Button } from "@/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import { Separator } from "@/components/shadcn/separator";
import { cn } from "@/lib/utils/cn";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  writeSidebarCookie,
} from "@/components/shadcn/sidebar";
import { AppToaster } from "@/components/ui/AppToaster";
import { TooltipProvider } from "@/components/shadcn/tooltip";
import { LogoMark } from "@/components/ui/Logo";
import { useSession, useSignOut } from "@/lib/auth/useSession";
import { applyTheme, useAppTheme, type ThemePreference } from "@/lib/theme/appTheme";
import { EmptyPanel } from "@/components/app/EmptyPanel";
import { activeNavItem, navByArea, pageLabel, type NavArea } from "./nav";
import { NotificationBell } from "./NotificationBell";
import { CoachProvider } from "@/components/app/coach/CoachProvider";
import { CoachWidget } from "@/components/app/coach/CoachWidget";

function initialsOf(first: string, last: string | null) {
  return `${first[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
}

const THEMES: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

/** Light / Dark / System picker in the top bar. */
function ThemeMenu() {
  const { preference, resolved, setPreference } = useAppTheme();
  const Icon = resolved === "dark" ? Moon : Sun;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Theme">
          <Icon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={preference}
          onValueChange={(value) => setPreference(value as ThemePreference)}
        >
          {THEMES.map(({ value, label, icon: ItemIcon }) => (
            <DropdownMenuRadioItem key={value} value={value}>
              <ItemIcon />
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Avatar at the top-right of the top bar; opens the account menu downward. */
function UserMenu() {
  const session = useSession();
  const signOut = useSignOut();
  const router = useRouter();
  if (session.status !== "authenticated") return null;
  const { user } = session;
  const name = [user.first_name, user.last_name].filter(Boolean).join(" ");

  const avatar = (size: string) => (
    <Avatar className={`${size} rounded-full`}>
      {user.profile_image_url ? <AvatarImage src={user.profile_image_url} alt="" /> : null}
      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
        {initialsOf(user.first_name, user.last_name)}
      </AvatarFallback>
    </Avatar>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="Account menu">
          {avatar("size-8")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6} className="w-64">
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2.5 px-2 py-2 text-left text-sm">
            {avatar("size-9")}
            <div className="grid min-w-0 flex-1 leading-tight">
              <span className="truncate font-medium">{name}</span>
              <span className="text-muted-foreground truncate text-xs">{user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <UserRound />
              Profile
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            signOut();
            router.replace("/login");
          }}
        >
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** What a mentor sees in the student area until mentor tools exist. */
function MentorComingSoon() {
  return (
    <EmptyPanel
      icon={ShieldCheck}
      title="Mentor tools are coming soon"
      description="Your mentor account is active. Tools for following your students' progress are on the way."
    />
  );
}

/**
 * Sidebar + top bar frame shared by the student app and the admin panel
 * (shadcn/ui sidebar). Collapses to icons on desktop (Ctrl/⌘+B), becomes a
 * sheet on phones; the open state is remembered in a cookie. Practice task
 * pages are a workspace: the sidebar starts collapsed there and the page uses
 * the full width, without changing the saved state elsewhere. Owns the app's
 * dark mode: applied while mounted, removed when leaving for the marketing site.
 */
export function AppShell({
  area,
  navArea,
  defaultOpen = true,
  children,
}: {
  /** Label under the logo and first breadcrumb, e.g. "Admin". */
  area: string;
  /** Which nav to show; a key, because icons can't cross the server/client boundary. */
  navArea: NavArea;
  /** From the sidebar_state cookie, so the first render matches the saved state. */
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const pathname = usePathname() ?? "/";
  const session = useSession();
  const nav = navByArea[navArea];
  const current = activeNavItem(nav, pathname);
  const home = nav[0];
  // The page's own name after the area, unless it's the area's home page.
  const crumb = pageLabel(pathname) ?? (current && current !== home ? current.label : undefined);
  const { resolved } = useAppTheme();

  // Task pages (task + editor side by side) get their own sidebar state, closed on arrival.
  const workspace = pathname.startsWith("/tasks/");
  const [savedOpen, setSavedOpen] = useState(defaultOpen);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    if (workspace) setWorkspaceOpen(false);
  }

  // RequireAuth lets mentors into the student area, but every student endpoint
  // refuses them: the coach and the student pages are for students only.
  const role = session.status === "authenticated" ? session.user.role : null;
  const student = navArea === "student" && role === "student";
  const mentorInStudentArea = navArea === "student" && role === "mentor";

  const saveOpen = (open: boolean) => {
    setSavedOpen(open);
    writeSidebarCookie(open);
  };

  // Before paint, so switching themes or arriving from the marketing site never flashes.
  useLayoutEffect(() => applyTheme(resolved), [resolved]);

  const shell = (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider
        open={workspace ? workspaceOpen : savedOpen}
        onOpenChange={workspace ? setWorkspaceOpen : saveOpen}
      >
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" asChild tooltip="PrepSuccess">
                  <Link href={home?.href ?? "/"}>
                    <span className="flex aspect-square size-8 items-center justify-center">
                      <LogoMark className="size-7" />
                    </span>
                    <span className="grid flex-1 text-left leading-tight">
                      <span className="text-foreground truncate text-sm font-semibold">
                        PrepSuccess
                      </span>
                      <span className="text-muted-foreground truncate text-xs">{area}</span>
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>{area}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {nav.map((item) => {
                    const active = item === current;
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                          <Link href={item.href} aria-current={active ? "page" : undefined}>
                            <item.icon />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarRail />
        </Sidebar>

        <SidebarInset>
          <header className="bg-background/90 sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b px-4 backdrop-blur">
            <SidebarTrigger className="-ml-1 size-9" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-center"
            />
            <Breadcrumb>
              <BreadcrumbList>
                {crumb ? (
                  <>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink asChild>
                        <Link href={home?.href ?? "/"}>{area}</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{crumb}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                ) : (
                  <BreadcrumbItem>
                    <BreadcrumbPage>{current?.label ?? area}</BreadcrumbPage>
                  </BreadcrumbItem>
                )}
              </BreadcrumbList>
            </Breadcrumb>
            <div className="ml-auto flex items-center gap-1">
              <NotificationBell />
              <ThemeMenu />
              <UserMenu />
            </div>
          </header>
          <div
            className={cn(
              "mx-auto w-full flex-1 px-4 py-6 sm:px-6 lg:px-8",
              workspace ? "max-w-screen-2xl lg:py-6" : "max-w-6xl lg:py-8",
            )}
          >
            {mentorInStudentArea ? <MentorComingSoon /> : children}
          </div>
        </SidebarInset>
        {student ? <CoachWidget /> : null}
        <AppToaster aboveCoach={student} />
      </SidebarProvider>
    </TooltipProvider>
  );
  // The coach (chat + activity pings) is for students only.
  return student ? <CoachProvider>{shell}</CoachProvider> : shell;
}
