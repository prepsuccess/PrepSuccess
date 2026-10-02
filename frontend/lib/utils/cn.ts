import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Tailwind-merge doesn't know this project's custom theme names, so without
 * this it would treat e.g. `text-heading` (a colour) and `text-h1` (a font
 * size) as the same utility and drop one. Keep in sync with @theme in globals.css.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      color: [
        "bg",
        "surface",
        "surface-2",
        "surface-3",
        "border-strong",
        "text",
        "text-dim",
        "heading",
        "marker",
        "brand",
        "brand-ink",
        "danger",
        "success",
        "skeleton",
        "shimmer",
      ],
      text: ["h1", "h2", "h3", "h4", "h5", "h6"],
      radius: ["card", "card-lg", "panel"],
      shadow: ["card", "card-hover", "window"],
      animate: ["marquee", "spin-slow", "float", "pulse-dot", "shimmer", "stamp"],
    },
  },
});

/**
 * Joins class names (clsx: strings, arrays, objects, conditionals) and resolves
 * Tailwind conflicts so the last class wins — `cn("px-2", "px-4")` → `"px-4"`.
 * Also the `cn` that shadcn components import (see components.json).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
