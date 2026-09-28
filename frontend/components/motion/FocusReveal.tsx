"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

/**
 * Frosted-glass layer that clears in place once its parent scrolls into view,
 * so the content comes into focus rather than sliding in from any direction.
 * Parent must be `relative overflow-clip`.
 */
export function FocusReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      gsap.set(el, { autoAlpha: 0 });
      return;
    }

    gsap.fromTo(
      el,
      { autoAlpha: 1, backdropFilter: "blur(14px)" },
      {
        autoAlpha: 0,
        backdropFilter: "blur(0px)",
        duration: 1.1,
        delay: 0.25,
        ease: "power2.out",
        scrollTrigger: { trigger: el.parentElement, start: "top 90%", once: true },
      },
    );
  });

  return (
    <div
      ref={ref}
      aria-hidden
      className="bg-surface-3/55 pointer-events-none absolute inset-0 z-10 backdrop-blur-[14px] max-lg:hidden"
    />
  );
}
