"use client";

import { useCallback, useSyncExternalStore } from "react";
import { DARK_QUERY, DEFAULT_THEME, THEME_STORAGE_KEY } from "./themeScript";

/**
 * Dark mode for the logged-in app only. The marketing site has no dark
 * palette, so instead of a site-wide theme provider the `.dark` class goes on
 * <html> while the app shell is mounted and comes off when it unmounts
 * (see AppShell). The preference is per browser.
 */
export type ThemePreference = "light" | "dark" | "system";

const STORAGE_KEY = THEME_STORAGE_KEY;
const DEFAULT: ThemePreference = DEFAULT_THEME;

const listeners = new Set<() => void>();

function readPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "dark" || stored === "light" || stored === "system" ? stored : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const media = window.matchMedia(DARK_QUERY);
  media.addEventListener("change", listener);
  // Another tab changed the theme.
  const onStorage = (event: StorageEvent) => event.key === STORAGE_KEY && listener();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    media.removeEventListener("change", listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Light or dark after resolving "system" against the OS setting. */
export function resolveTheme(preference: ThemePreference): "light" | "dark" {
  if (preference === "system") return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
  return preference;
}

export function useAppTheme() {
  const preference = useSyncExternalStore(subscribe, readPreference, () => DEFAULT);
  const resolved = useSyncExternalStore(
    subscribe,
    () => resolveTheme(readPreference()),
    () => "light" as const,
  );
  const setPreference = useCallback((next: ThemePreference) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage blocked: the choice lasts for this page only.
    }
    listeners.forEach((listener) => listener());
  }, []);
  return { preference, resolved, setPreference };
}

/** Applies the theme to <html>. Returns a cleanup that restores light (for the marketing site). */
export function applyTheme(resolved: "light" | "dark") {
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  return () => root.classList.remove("dark");
}
