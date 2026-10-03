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
import { usePingCoachMutation } from "@/lib/api/endpoints/coach";

/** How often the app tells the server the student is here, while the tab is visible. */
export const PING_MS = 3 * 60_000;
/** Never ping more often than this (tab switching back and forth). */
const MIN_GAP_MS = 60_000;

interface CoachContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  /** Opens the chat panel, e.g. from the coach's check-in notification. */
  openCoach: () => void;
}

const CoachContext = createContext<CoachContextValue | null>(null);

/** The coach panel's state, or null outside the student app (e.g. the admin panel). */
export const useCoach = () => useContext(CoachContext);

/**
 * Student app only: holds whether the coach chat is open, and pings the server
 * while the tab is visible so the coach can check in after 30 active minutes.
 */
export function CoachProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [ping] = usePingCoachMutation();
  const last = useRef(0);

  useEffect(() => {
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
  }, [ping]);

  const value = useMemo(() => ({ open, setOpen, openCoach: () => setOpen(true) }), [open]);
  return <CoachContext.Provider value={value}>{children}</CoachContext.Provider>;
}
