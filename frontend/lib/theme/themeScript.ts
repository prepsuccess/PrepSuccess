// Shared by the client hook (appTheme.ts) and server layouts — no "use client",
// so layouts receive the real string rather than a client reference.
export const THEME_STORAGE_KEY = "ps-app-theme";
export const DARK_QUERY = "(prefers-color-scheme: dark)";
export const DEFAULT_THEME = "light";

/** Paths rendered inside the app shell — the only places dark mode applies. */
export const APP_PATH_PATTERN = "^/(dashboard|profile|assessment|admin)(/|$)";

/**
 * Runs before first paint (from the root layout's boot script) so a dark-mode
 * user never sees a white flash. Acts only on app paths; the marketing site
 * stays light. Mirrors readPreference/resolveTheme in appTheme.ts.
 */
export const appThemeBootScript = `(function(){try{if(!new RegExp(${JSON.stringify(APP_PATH_PATTERN)}).test(location.pathname))return;var p=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)})||${JSON.stringify(DEFAULT_THEME)};var d=p==="dark"||(p==="system"&&matchMedia(${JSON.stringify(
  DARK_QUERY,
)}).matches);document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;
