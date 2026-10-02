"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useRef, useState, type ReactNode } from "react";
import { Logo } from "@/components/ui/Logo";
import { LineIcon } from "@/components/ui/LineIcon";
import { ThemePicker } from "@/components/ui/ThemePicker";
import { useDismiss } from "@/lib/hooks/useDismiss";
import { useSession, useSignOut } from "@/lib/auth/useSession";
import { cn } from "@/lib/utils/cn";
import type { ShellNavItem } from "./nav";

function isActive(pathname: string, href: string, rootHref: string) {
  return href === rootHref
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

function NavList({
  items,
  pathname,
  onNavigate,
}: {
  items: ShellNavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  const rootHref = items[0]?.href ?? "/";
  return (
    <ul className="flex flex-col gap-1">
      {items.map((item) => {
        const active = isActive(pathname, item.href, rootHref);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[14px] transition-colors duration-300",
                active
                  ? "bg-surface text-heading font-medium shadow-[inset_0_0_0_1px_var(--color-border)]"
                  : "text-text hover:bg-surface/60 hover:text-heading",
              )}
            >
              <LineIcon
                name={item.icon}
                className={cn("h-4 w-4 flex-none", active ? "text-accent" : "text-text-dim")}
              />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function UserMenu() {
  const session = useSession();
  const signOut = useSignOut();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useDismiss(
    root,
    open,
    useCallback(() => setOpen(false), []),
  );

  if (session.status !== "authenticated") return null;
  const { user } = session;
  const initials = `${user.first_name[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase();

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="user-menu"
        aria-label="Account menu"
        className="border-border bg-surface hover:border-border-strong flex items-center gap-2.5 rounded-full border py-1 pr-3 pl-1 transition-colors"
      >
        <span className="bg-heading grid h-7 w-7 place-items-center rounded-full text-[12px] text-white tabular-nums">
          {initials}
        </span>
        <span className="text-heading hidden text-[14px] sm:block">{user.first_name}</span>
        <LineIcon name="chevron" className="text-text-dim h-3.5 w-3.5" />
      </button>
      <div
        id="user-menu"
        className={cn(
          "border-border bg-surface absolute top-full right-0 z-40 mt-2 w-[240px] rounded-2xl border p-2 transition-[opacity,translate] duration-200",
          open ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0",
        )}
      >
        <div className="border-border border-b px-3 pt-2 pb-3">
          <p className="text-heading truncate text-[14px] font-medium">
            {user.first_name} {user.last_name}
          </p>
          <p className="text-text-dim truncate text-[12px]">{user.email}</p>
          <p className="text-accent-ink mt-2 text-[12px] tabular-nums">{user.role}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            signOut();
            router.replace("/login");
          }}
          className="text-text hover:bg-surface-3 hover:text-heading mt-1 flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-left text-[14px] transition-colors"
        >
          <LineIcon name="logout" className="h-4 w-4" />
          Log out
        </button>
      </div>
    </div>
  );
}

/** Sidebar + top bar frame shared by the student app and the admin panel. */
export function AppShell({
  area,
  nav,
  children,
}: {
  /** Small label under the logo, e.g. "Admin". */
  area: string;
  nav: ShellNavItem[];
  children: ReactNode;
}) {
  const pathname = usePathname() ?? "/";
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setDrawerOpen(false);
  }

  const brand = (
    <div className="flex items-end gap-3 px-3">
      <Logo />
      <span className="text-text-dim mb-0.5 text-[12px] tabular-nums">{area}</span>
    </div>
  );

  return (
    <div className="bg-bg min-h-screen lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="panel sticky top-0 hidden h-screen flex-col gap-8 border-y-0 border-l-0 px-3 py-6 lg:flex">
        {brand}
        <nav aria-label={`${area} navigation`}>
          <NavList items={nav} pathname={pathname} />
        </nav>
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn(
          "bg-heading/30 fixed inset-0 z-50 transition-opacity lg:hidden",
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setDrawerOpen(false)}
        aria-hidden
      />
      <aside
        className={cn(
          "panel fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col gap-8 border-y-0 border-l-0 px-3 py-6 transition-transform duration-300 lg:hidden",
          drawerOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-hidden={!drawerOpen}
        inert={!drawerOpen}
      >
        <div className="flex items-center justify-between pr-1">
          {brand}
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
            className="text-text hover:bg-surface grid h-9 w-9 place-items-center rounded-full"
          >
            <LineIcon name="close" className="h-4 w-4" />
          </button>
        </div>
        <nav aria-label={`${area} navigation`}>
          <NavList items={nav} pathname={pathname} onNavigate={() => setDrawerOpen(false)} />
        </nav>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="border-border bg-bg/85 sticky top-0 z-30 flex items-center justify-between gap-4 border-b px-4 py-3 backdrop-blur-md sm:px-8">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            aria-expanded={drawerOpen}
            className="border-border grid h-10 w-10 place-items-center rounded-full border lg:hidden"
          >
            <LineIcon name="menu" className="h-4 w-4" />
          </button>
          <span className="hidden lg:block" />
          <div className="flex items-center gap-2">
            <ThemePicker />
            <UserMenu />
          </div>
        </header>
        <main className="flex-1 px-4 py-8 sm:px-8 lg:py-10">
          <div className="mx-auto w-full max-w-[1120px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
