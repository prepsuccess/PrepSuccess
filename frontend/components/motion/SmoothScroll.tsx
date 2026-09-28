"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap, ScrollTrigger, isCompactScreen, prefersReducedMotion } from "@/lib/gsap";

/** Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger reveals stay in sync. */
export function SmoothScroll() {
  useEffect(() => {
    // Touch devices already scroll smoothly; Lenis only adds work on low-end phones.
    if (prefersReducedMotion() || isCompactScreen()) return;

    const lenis = new Lenis({
      lerp: 0.075,
      wheelMultiplier: 0.9,
      anchors: { offset: -24, duration: 1.4 },
    });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return null;
}
