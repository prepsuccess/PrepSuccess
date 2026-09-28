"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

if (typeof document !== "undefined") {
  // Web fonts shift layout after first paint; re-measure trigger positions once they land.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

export { gsap, ScrollTrigger, SplitText, useGSAP };

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Phones and tablets get a lighter, simpler version of the motion. */
export function isCompactScreen() {
  return window.matchMedia("(max-width: 1023px), (pointer: coarse)").matches;
}

// Timings lifted from LearnEdge's Webflow interaction lists.
export type RevealVariant = "up" | "grow" | "drop" | "left" | "right" | "fade";

export const revealPresets: Record<
  RevealVariant,
  { from: gsap.TweenVars; duration: number; ease: string }
> = {
  up: { from: { y: 40, autoAlpha: 0 }, duration: 0.5, ease: "power1.out" },
  grow: { from: { scale: 0.75, autoAlpha: 0 }, duration: 1, ease: "power4.out" },
  drop: { from: { y: -500, autoAlpha: 0 }, duration: 1, ease: "bounce.out" },
  left: { from: { x: -100, autoAlpha: 0 }, duration: 1, ease: "power4.out" },
  right: { from: { x: 100, autoAlpha: 0 }, duration: 1, ease: "power4.out" },
  fade: { from: { autoAlpha: 0 }, duration: 1, ease: "power4.out" },
};
