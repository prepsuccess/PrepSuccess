"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

/** A number that counts up from zero (expo ease) after `delay` seconds. */
export function CountUp({
  value,
  delay = 0,
  className = "",
}: {
  value: number;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      const counter = { v: 0 };
      el.textContent = "0";
      gsap.to(counter, {
        v: value,
        duration: 1.6,
        delay,
        ease: "expo.out",
        onUpdate: () => {
          el.textContent = String(Math.round(counter.v));
        },
      });
    },
    { dependencies: [value, delay] },
  );

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {value}
    </span>
  );
}
