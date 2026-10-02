"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { ChevronsUpDown, LogOut, UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shadcn/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/shadcn/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import { Separator } from "@/components/shadcn/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
  useSidebar,
} from "@/components/shadcn/sidebar";
import { Toaster } from "@/components/shadcn/sonner";
import { TooltipProvider } from "@/components/shadcn/tooltip";
import { LogoMark } from "@/components/ui/Logo";
import { useSession, useSignOut } from "@/lib/auth/useSession";
import { activeNavItem, navByArea, type NavArea } from "./nav";

function initialsOf(first: string, last: string | null) {
  return `${first[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
}

/** Avatar + name at the foot of the sidebar; opens the account menu. */
function NavUser() {
  const session = useSession();
  const signOut = useSignOut();
  const router = useRouter();
  const { isMobile } = useSidebar();
  if (session.status !== "authenticated") return null;
  const { user } = session;
  const name = [user.first_name, user.last_name].filter(Boolean).join(" ");

  const avatar = (
    <Avatar className="size-8 rounded-lg">
      {user.profile_image_url ? <AvatarImage src={user.profile_image_url} alt="" /> : null}
      <AvatarFallback className="bg-primary text-primary-foreground rounded-lg text-xs">
        {initialsOf(user.first_name, user.last_name)}
      </AvatarFallback>
    </Avatar>
  );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              aria-label="Account menu"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {avatar}
              <span className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{name}</span>
                <span className="text-muted-foreground truncate text-xs">{user.email}</span>
              </span>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                {avatar}
                <div className="grid flex-1 leading-tight">
                  <span className="truncate font-medium">{name}</span>
                  <span className="text-muted-foreground truncate text-xs capitalize">
                    {user.role}
                  </span>
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
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

/**
 * Sidebar + top bar frame shared by the student app and the admin panel
 * (shadcn/ui sidebar). Collapses to icons on desktop (Ctrl/⌘+B), becomes a
 * sheet on phones; the open state is remembered in a cookie.
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

          <SidebarFooter>
            <NavUser />
          </SidebarFooter>
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
          </header>
          <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </SidebarInset>
        {/* Light-only until dark mode ships; otherwise sonner follows the OS theme. */}
        <Toaster theme="light" richColors closeButton position="bottom-right" />
      </SidebarProvider>
    </TooltipProvider>
  );
}
