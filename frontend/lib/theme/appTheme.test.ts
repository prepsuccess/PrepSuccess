import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { applyTheme, useAppTheme } from "./appTheme";
import { appThemeBootScript } from "./themeScript";

// jsdom has no matchMedia; simulate the OS colour-scheme setting.
let osDark = false;
const mediaListeners = new Set<() => void>();
function setOsDark(value: boolean) {
  osDark = value;
  mediaListeners.forEach((listener) => listener());
}

beforeEach(() => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("dark") ? osDark : false,
    media: query,
    addEventListener: (_: string, listener: () => void) => mediaListeners.add(listener),
    removeEventListener: (_: string, listener: () => void) => mediaListeners.delete(listener),
  }));
});
afterEach(() => {
  vi.unstubAllGlobals();
  osDark = false;
  mediaListeners.clear();
  document.documentElement.classList.remove("dark");
});

describe("useAppTheme", () => {
  it("defaults to light and remembers the choice", () => {
    const { result } = renderHook(() => useAppTheme());
    expect(result.current).toMatchObject({ preference: "light", resolved: "light" });

    act(() => result.current.setPreference("dark"));
    expect(result.current).toMatchObject({ preference: "dark", resolved: "dark" });
    expect(localStorage.getItem("ps-app-theme")).toBe("dark");
  });

  it("follows the OS when set to system", () => {
    const { result } = renderHook(() => useAppTheme());
    act(() => result.current.setPreference("system"));
    expect(result.current.resolved).toBe("light");

    act(() => setOsDark(true));
    expect(result.current.resolved).toBe("dark");
  });
});

describe("applyTheme", () => {
  it("adds .dark and its cleanup removes it, so the marketing site stays light", () => {
    const cleanup = applyTheme("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    cleanup();
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});

describe("appThemeBootScript", () => {
  afterEach(() => window.history.replaceState(null, "", "/"));

  it("sets .dark before paint on app pages for a saved dark preference", () => {
    localStorage.setItem("ps-app-theme", "dark");
    window.history.replaceState(null, "", "/dashboard");
    new Function(appThemeBootScript)();
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("never darkens the marketing site, even with dark saved", () => {
    localStorage.setItem("ps-app-theme", "dark");
    window.history.replaceState(null, "", "/pricing");
    new Function(appThemeBootScript)();
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("leaves light alone when nothing is saved", () => {
    window.history.replaceState(null, "", "/admin/users");
    new Function(appThemeBootScript)();
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});
