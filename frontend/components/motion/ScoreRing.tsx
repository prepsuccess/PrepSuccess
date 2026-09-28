"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

/** Readiness ring that fills and counts up to `value` when scrolled into view. */
export function ScoreRing({
  value,
  size = 220,
  stroke = 14,
  label = "Overall readiness",
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const arc = useRef<SVGCircleElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const target = circumference * (1 - value / 100);

  useGSAP(() => {
    if (!arc.current || !num.current) return;
    const numEl = num.current;

    if (prefersReducedMotion()) {
      gsap.set(arc.current, { strokeDashoffset: target });
      numEl.textContent = String(value);
      return;
    }

    const counter = { v: 0 };
    const tl = gsap.timeline({
      scrollTrigger: { trigger: root.current, start: "top 85%", once: true },
      defaults: { duration: 1.8, ease: "power3.out" },
    });
    tl.fromTo(arc.current, { strokeDashoffset: circumference }, { strokeDashoffset: target }, 0);
    tl.to(
      counter,
      { v: value, onUpdate: () => void (numEl.textContent = String(Math.round(counter.v))) },
      0,
    );
  });

  return (
    <div
      ref={root}
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-surface-3)"
          strokeWidth={stroke}
        />
        <circle
          ref={arc}
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={stroke}
          strokeLinecap="butt"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-text-dim text-[12px] tabular-nums">{label}</span>
        <span className="mt-1 flex items-baseline gap-1">
          <span
            ref={num}
            className="text-heading text-6xl font-semibold tracking-[-0.035em] tabular-nums"
          >
            0
          </span>
          <span className="text-text-dim text-sm tabular-nums">/100</span>
        </span>
      </div>
    </div>
  );
}
