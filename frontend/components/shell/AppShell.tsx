"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLayoutEffect, type ReactNode } from "react";
import { LogOut, Monitor, Moon, Sun, UserRound } from "lucide-react";
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
} from "@/components/shadcn/sidebar";
import { Toaster } from "@/components/shadcn/sonner";
import { TooltipProvider } from "@/components/shadcn/tooltip";
import { LogoMark } from "@/components/ui/Logo";
import { useSession, useSignOut } from "@/lib/auth/useSession";
import { applyTheme, useAppTheme, type ThemePreference } from "@/lib/theme/appTheme";
import { activeNavItem, navByArea, type NavArea } from "./nav";

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

/**
 * Sidebar + top bar frame shared by the student app and the admin panel
 * (shadcn/ui sidebar). Collapses to icons on desktop (Ctrl/⌘+B), becomes a
 * sheet on phones; the open state is remembered in a cookie. Owns the app's
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
  const nav = navByArea[navArea];
  const current = activeNavItem(nav, pathname);
  const home = nav[0];
  const { resolved } = useAppTheme();

  // Before paint, so switching themes or arriving from the marketing site never flashes.
  useLayoutEffect(() => applyTheme(resolved), [resolved]);

  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider defaultOpen={defaultOpen}>
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
                {current && current !== home ? (
                  <>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink asChild>
                        <Link href={home?.href ?? "/"}>{area}</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{current.label}</BreadcrumbPage>
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
              <ThemeMenu />
              <UserMenu />
            </div>
          </header>
          <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </SidebarInset>
        <Toaster theme={resolved} richColors closeButton position="bottom-right" />
      </SidebarProvider>
    </TooltipProvider>
  );
}
