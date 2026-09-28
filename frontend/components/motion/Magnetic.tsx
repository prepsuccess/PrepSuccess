"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

/** Leans its child toward the cursor, then springs back on leave. */
export function Magnetic({
  children,
  strength = 0.28,
  className = "",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    (_context, contextSafe) => {
      const el = ref.current;
      if (!el || prefersReducedMotion() || !window.matchMedia("(hover: hover)").matches) return;

      const onMove = contextSafe!((e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        gsap.to(el, {
          x: (e.clientX - (r.left + r.width / 2)) * strength,
          y: (e.clientY - (r.top + r.height / 2)) * strength,
          duration: 0.35,
          ease: "power2.out",
        });
      });
      const onLeave = contextSafe!(() => {
        gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.45)" });
      });

      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      return () => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
      };
    },
    { dependencies: [strength] },
  );

  return (
    <div ref={ref} className={`inline-block will-change-transform ${className}`}>
      {children}
    </div>
  );
}
