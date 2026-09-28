"use client";

import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import { useDismiss } from "@/lib/hooks/useDismiss";
import { accentThemes, applyAccentTheme, DEFAULT_THEME_ID, THEME_STORAGE_KEY } from "@/lib/themes";

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function readThemeId() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) ?? DEFAULT_THEME_ID;
  } catch {
    return DEFAULT_THEME_ID;
  }
}

function chooseTheme(id: string) {
  const theme = accentThemes.find((t) => t.id === id);
  if (!theme) return;
  applyAccentTheme(theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, id);
  } catch {
    // Storage can be unavailable (private mode); the colour still applies for this visit.
  }
  listeners.forEach((listener) => listener());
}

/** Navbar swatch button that opens a dropdown for picking the site's accent colour. */
export function ThemePicker() {
  const [open, setOpen] = useState(false);
  const currentId = useSyncExternalStore(subscribe, readThemeId, () => DEFAULT_THEME_ID);
  const current = accentThemes.find((t) => t.id === currentId) ?? accentThemes[0];
  const root = useRef<HTMLDivElement>(null);

  useDismiss(
    root,
    open,
    useCallback(() => setOpen(false), []),
  );

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="theme-picker"
        aria-label={`Accent colour: ${current.name}`}
        className="border-border hover:border-border-strong grid h-9 w-9 place-items-center rounded-full border transition-colors"
      >
        <span
          className="h-5 w-5 overflow-clip rounded-full"
          style={{ backgroundColor: current.marker }}
        >
          <span className="block h-full w-1/2" style={{ backgroundColor: current.accent }} />
        </span>
      </button>

      <div
        id="theme-picker"
        role="dialog"
        aria-label="Accent colour"
        className={`border-border bg-surface absolute top-full right-0 mt-3 w-[280px] origin-top-right rounded-2xl border p-5 transition-[opacity,translate,scale] duration-300 ease-[var(--ease-out-cubic)] ${
          open
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-1 scale-[0.97] opacity-0"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-heading text-[14px] font-medium">Accent colour</p>
            <p className="text-text-dim mt-0.5 text-[12px] tabular-nums">{current.name}</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close colour picker"
            className="text-text hover:bg-surface-3 hover:text-heading grid h-8 w-8 place-items-center rounded-full transition-colors"
          >
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden>
              <path
                d="M3.5 3.5l9 9M12.5 3.5l-9 9"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div
          className="mt-5 grid grid-cols-4 gap-x-2 gap-y-4"
          role="group"
          aria-label="Choose an accent colour"
        >
          {accentThemes.map((theme) => {
            const selected = theme.id === current.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => chooseTheme(theme.id)}
                aria-pressed={selected}
                aria-label={theme.name}
                className="group flex flex-col items-center gap-1.5"
              >
                <span
                  className={`relative grid h-10 w-10 place-items-center rounded-full border-2 transition-[border-color,scale] duration-300 group-hover:scale-105 ${
                    selected ? "border-heading" : "border-transparent"
                  }`}
                >
                  <span
                    className="h-8 w-8 overflow-clip rounded-full"
                    style={{ backgroundColor: theme.marker }}
                  >
                    <span
                      className="block h-full w-1/2"
                      style={{ backgroundColor: theme.accent }}
                    />
                  </span>
                </span>
                <span
                  className={`text-[10px] ${selected ? "text-heading font-medium" : "text-text-dim"}`}
                >
                  {theme.name}
                </span>
              </button>
            );
          })}
        </div>

        <p className="border-border text-text-dim mt-5 border-t pt-3 text-[11px]">
          Changes every accent on the page. Saved in this browser.
        </p>
      </div>
    </div>
  );
}
