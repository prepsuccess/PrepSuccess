"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { usePingCoachMutation } from "@/lib/api/endpoints/coach";

/** How often the app tells the server the student is here, while the tab is visible. */
export const PING_MS = 3 * 60_000;
/** Never ping more often than this (tab switching back and forth). */
const MIN_GAP_MS = 60_000;

/** Pages where the coach stays out of the way: the onboarding chat and a skill check in progress. */
export function coachHiddenOn(pathname: string) {
  return pathname.startsWith("/onboarding") || /^\/assessment\/[^/]+/.test(pathname);
}

/** What the student is looking at, sent with each message while set. */
export interface CoachPageContext {
  /** The interview question open on the page. */
  questionId: string;
  /** Shown in the chat as "About: <label>". */
  label: string;
}

interface CoachContextValue {
  open: boolean;
  /** True on pages where the coach isn't shown (see coachHiddenOn). */
  hidden: boolean;
  setOpen: (open: boolean) => void;
  /** Opens the chat panel, e.g. from the coach's check-in notification. No-op while hidden. */
  openCoach: () => void;
  /** The page the student is on, e.g. an interview question; null when there's none. */
  context: CoachPageContext | null;
  /** Set by a page on mount and cleared on unmount; the chat's × also clears it. Stable. */
  setContext: (context: CoachPageContext | null) => void;
}

const CoachContext = createContext<CoachContextValue | null>(null);

/** The coach panel's state, or null outside the student app (e.g. the admin panel). */
export const useCoach = () => useContext(CoachContext);

/**
 * Student app only: holds whether the coach chat is open, and pings the server
 * while the tab is visible so the coach can check in after 30 active minutes.
 * No pings on pages where the coach is hidden, so a check-in never lands there.
 */
export function CoachProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [context, setContext] = useState<CoachPageContext | null>(null);
  const [ping] = usePingCoachMutation();
  const last = useRef(0);
  const hidden = coachHiddenOn(usePathname() ?? "/");

  useEffect(() => {
    if (hidden) return;
    const beat = () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - last.current < MIN_GAP_MS) return;
      last.current = Date.now();
      void ping();
    };
    beat();
    const timer = window.setInterval(beat, PING_MS);
    document.addEventListener("visibilitychange", beat);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", beat);
    };
  }, [ping, hidden]);

  const value = useMemo(
    () => ({
      open,
      hidden,
      setOpen,
      openCoach: () => {
        if (!hidden) setOpen(true);
      },
      context,
      setContext,
    }),
    [open, hidden, context],
  );
  return <CoachContext.Provider value={value}>{children}</CoachContext.Provider>;
}
