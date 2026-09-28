"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDismiss } from "@/lib/hooks/useDismiss";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { HoverScribble } from "@/components/ui/Annotation";
import { LineIcon, type LineIconName } from "@/components/ui/LineIcon";
import { ThemePicker } from "@/components/ui/ThemePicker";
import { navLinks, overviewLink, productLinks } from "@/lib/content";
import { homeFor } from "@/lib/auth/session";
import { useSession } from "@/lib/auth/useSession";

const productIcons: Record<string, LineIconName> = {
  "/how-it-works": "checklist",
  "/skill-tracks": "code",
  "/mentors": "person",
  "/trust": "shield",
};

/** Tracks whether the page has scrolled, and hides the bar on a deliberate scroll down. */
function useScrollState() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // Hide only after the hero, and only after a deliberate scroll: 80px down to hide, 24px up to show.
    const HIDE_AFTER = 520;
    let lastY = window.scrollY;
    let travel = 0;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY;
        travel = Math.sign(delta) === Math.sign(travel) ? travel + delta : delta;
        lastY = y;
        setScrolled(y > 24);
        if (y <= HIDE_AFTER || travel < -24) setHidden(false);
        else if (travel > 80) setHidden(true);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return { scrolled, hidden };
}

function NavItem({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`group hover:text-heading text-[15px] transition-colors duration-300 ${active ? "text-heading" : "text-text"}`}
    >
      <HoverScribble active={active}>{label}</HoverScribble>
    </Link>
  );
}

/** "Product ▾" — opens on hover or click; closes on Escape, outside click, or navigation. */
function ProductMenu({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLLIElement>(null);
  const closeTimer = useRef<number>(undefined);
  const active = productLinks.some((link) => link.href === pathname);

  // Navigating away should never leave the menu hanging open.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useDismiss(
    root,
    open,
    useCallback(() => setOpen(false), []),
  );

  const show = () => {
    window.clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const hideSoon = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), 160);
  };

  return (
    <li ref={root} className="relative" onPointerEnter={show} onPointerLeave={hideSoon}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="product-menu"
        className={`group hover:text-heading inline-flex items-center gap-1 text-[15px] transition-colors duration-300 ${
          active || open ? "text-heading" : "text-text"
        }`}
      >
        <HoverScribble active={active}>Product</HoverScribble>
        <LineIcon
          name="chevron"
          className={`h-3.5 w-3.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* pt-4 bridges the gap so the pointer can travel from the button into the panel. */}
      <div
        id="product-menu"
        className={`absolute top-full left-1/2 w-[560px] -translate-x-1/2 pt-4 transition-[opacity,translate] duration-300 ease-[var(--ease-out-cubic)] ${
          open ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0"
        }`}
      >
        <div className="border-border bg-surface rounded-2xl border p-2.5">
          <ul className="grid grid-cols-2 gap-1">
            {productLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={link.href === pathname ? "page" : undefined}
                  className="group hover:bg-surface-3 flex gap-3 rounded-[12px] p-3 transition-colors duration-300"
                >
                  <span className="border-border bg-surface text-heading grid h-9 w-9 flex-none place-items-center rounded-[8px] border">
                    <LineIcon name={productIcons[link.href] ?? "track"} />
                  </span>
                  <span className="min-w-0">
                    <span className="text-heading block text-[14px] font-medium">
                      <HoverScribble active={link.href === pathname}>{link.label}</HoverScribble>
                    </span>
                    <span className="text-text-dim mt-1 block text-[12px] leading-snug">
                      {link.description}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/story"
            className="group border-border mt-1.5 flex items-center justify-between rounded-[12px] border-t px-3 pt-3 pb-1.5"
          >
            <span className="font-marker text-accent -rotate-1 text-[18px]">why we built it →</span>
            <span className="text-text group-hover:text-heading text-[13px] transition-colors">
              <HoverScribble>Read our story</HoverScribble>
            </span>
          </Link>
        </div>
      </div>
    </li>
  );
}

const pillLink =
  "hidden rounded-full border border-heading px-5 py-2 text-[14px] font-medium text-heading transition-colors duration-300 hover:bg-heading hover:text-white sm:block";

export function Navbar() {
  const pathname = usePathname() ?? "/";
  const session = useSession();
  const [open, setOpen] = useState(false);
  const { scrolled, hidden } = useScrollState();
  const tucked = hidden && !open;

  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  const mobileGroups = [
    { title: null, links: [overviewLink] },
    { title: "Product", links: productLinks },
    { title: null, links: navLinks },
  ];

  return (
    <header
      className={`fixed inset-x-0 z-50 mx-auto w-[92%] max-w-[1160px] transition-[top,translate,opacity] duration-[700ms] ease-[cubic-bezier(0.65,0,0.35,1)] ${
        scrolled ? "top-3" : "top-4 sm:top-6"
      } ${tucked ? "pointer-events-none -translate-y-[130%] opacity-0" : "translate-y-0 opacity-100"}`}
    >
      <div
        className={`grid grid-cols-2 items-center rounded-full border py-2 pr-2 pl-6 backdrop-blur-md transition-[background-color,border-color,padding] duration-500 lg:grid-cols-[auto_1fr_auto] ${
          scrolled ? "border-border bg-surface/80 py-1.5" : "bg-surface/50 border-transparent"
        }`}
      >
        <Logo className="justify-self-start" />

        <nav className="hidden justify-self-center lg:block" aria-label="Primary">
          <ul className="flex items-center gap-7 whitespace-nowrap">
            <li>
              <NavItem
                href={overviewLink.href}
                label={overviewLink.label}
                active={pathname === "/"}
              />
            </li>
            <ProductMenu pathname={pathname} />
            {navLinks.map((link) => (
              <li key={link.href}>
                <NavItem href={link.href} label={link.label} active={pathname === link.href} />
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1 justify-self-end">
          <ThemePicker />
          {session.status === "authenticated" ? (
            <Link href={homeFor(session.user.role)} className={pillLink}>
              Open dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="group text-text hover:text-heading hidden px-4 py-2 text-[15px] transition-colors sm:block"
              >
                <HoverScribble>Log in</HoverScribble>
              </Link>
              <Link href="/signup" className={pillLink}>
                Sign up
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid h-11 w-11 place-items-center rounded-full lg:hidden"
          >
            <span className="flex w-6 flex-col gap-1.5">
              <span
                className={`bg-heading h-0.5 transition-transform duration-300 ${open ? "translate-y-1 rotate-45" : ""}`}
              />
              <span
                className={`bg-heading h-0.5 transition-transform duration-300 ${open ? "-translate-y-1 -rotate-45" : ""}`}
              />
            </span>
          </button>
        </div>
      </div>

      <div
        className={`bg-heading absolute inset-x-0 top-full mt-3 max-h-[calc(100dvh-110px)] origin-top overflow-y-auto rounded-[12px] px-8 py-8 transition-[opacity,scale] duration-400 lg:hidden ${
          open ? "scale-y-100 opacity-100" : "pointer-events-none scale-y-95 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-6">
          {mobileGroups.map((group, i) => (
            <div key={i} className={i ? "border-t border-white/15 pt-6" : ""}>
              {group.title ? (
                <p className="mb-3 text-[12px] text-white/50 tabular-nums">{group.title}</p>
              ) : null}
              <ul className="flex flex-col gap-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      aria-current={pathname === link.href ? "page" : undefined}
                      className="hover:decoration-marker aria-[current=page]:decoration-marker text-lg font-medium text-white underline decoration-transparent underline-offset-4 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-5 border-t border-white/15 pt-6 sm:hidden">
            {session.status === "authenticated" ? (
              <Button href={homeFor(session.user.role)} label="Open dashboard" variant="inverse" />
            ) : (
              <>
                <Button href="/signup" label="Sign up free" variant="inverse" />
                <Link
                  href="/login"
                  className="text-[15px] font-medium text-white underline underline-offset-4"
                >
                  Log in
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
