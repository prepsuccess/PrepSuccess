/**
 * Accent palettes the visitor can pick from. Each has a pale tone (highlighter,
 * fills), a main tone (pencil strokes, rings, status marks) and a deeper ink
 * tone for small accent text so it stays readable on white.
 */
export type AccentTheme = { id: string; name: string; marker: string; accent: string; ink: string };

export const accentThemes: AccentTheme[] = [
  { id: "sky", name: "Sky", marker: "#cde9ff", accent: "#2e8fe0", ink: "#1f6fb5" },
  { id: "periwinkle", name: "Periwinkle", marker: "#d9deff", accent: "#5b6cf0", ink: "#4150c9" },
  { id: "lilac", name: "Lilac", marker: "#e6ddff", accent: "#8465eb", ink: "#6848cf" },
  { id: "plum", name: "Plum", marker: "#f3d7f6", accent: "#a24bb0", ink: "#7f3389" },
  { id: "rose", name: "Rose", marker: "#ffd6e3", accent: "#e0487a", ink: "#b8325e" },
  { id: "coral", name: "Coral", marker: "#ffd9d3", accent: "#ef6555", ink: "#c44a3c" },
  { id: "sunflower", name: "Sunflower", marker: "#fff0b3", accent: "#d9a300", ink: "#946f00" },
  { id: "lime", name: "Lime", marker: "#e2f5c6", accent: "#6aa815", ink: "#4d7c0f" },
  { id: "mint", name: "Mint", marker: "#c9f1e0", accent: "#2fa57a", ink: "#1f7f5d" },
  { id: "teal", name: "Teal", marker: "#c8eef0", accent: "#1a9aa5", ink: "#127880" },
  { id: "cyan", name: "Cyan", marker: "#cdf2fa", accent: "#0ea5c6", ink: "#0b7f99" },
  { id: "graphite", name: "Graphite", marker: "#e3e6ea", accent: "#3d4450", ink: "#2a2f38" },
];

export const DEFAULT_THEME_ID = "sky";
export const THEME_STORAGE_KEY = "ps-accent";

export function applyAccentTheme(theme: AccentTheme) {
  const root = document.documentElement.style;
  root.setProperty("--color-marker", theme.marker);
  root.setProperty("--color-brand", theme.accent);
  root.setProperty("--color-brand-ink", theme.ink);
}

/** Inline script run before paint so a saved accent never flashes the default first. */
export const accentBootScript = `(function(){try{var t=${JSON.stringify(
  Object.fromEntries(accentThemes.map((t) => [t.id, [t.marker, t.accent, t.ink]])),
)}[localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)})];if(t){var s=document.documentElement.style;s.setProperty('--color-marker',t[0]);s.setProperty('--color-brand',t[1]);s.setProperty('--color-brand-ink',t[2]);}}catch(e){}})();`;
