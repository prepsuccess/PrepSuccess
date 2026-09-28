"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import {
  gsap,
  useGSAP,
  isCompactScreen,
  prefersReducedMotion,
  revealPresets,
  type RevealVariant,
} from "@/lib/gsap";

type RevealProps = {
  children: ReactNode;
  variant?: RevealVariant;
  delay?: number;
  /** How far into the viewport (percent from the bottom) before playing. */
  offset?: number;
  onLoad?: boolean;
  as?: ElementType;
  className?: string;
};

export function Reveal({
  children,
  variant = "up",
  delay = 0,
  offset = 0,
  onLoad = false,
  as: Tag = "div",
  className = "",
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;

    // Phones get content straight away — no scroll-in fades to wait for.
    if (prefersReducedMotion() || isCompactScreen()) {
      gsap.set(el, { autoAlpha: 1 });
      return;
    }

    const scrollTrigger = onLoad
      ? undefined
      : { trigger: el, start: `top ${100 - offset}%`, once: true };

    if (variant === "drop") {
      const tl = gsap.timeline({ delay, scrollTrigger });
      tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1, ease: "power4.out" }, 0);
      tl.fromTo(el, { y: -500 }, { y: 0, duration: 1, ease: "bounce.out" }, 0);
      return;
    }

    const preset = revealPresets[variant];
    gsap.fromTo(el, preset.from, {
      x: 0,
      y: 0,
      scale: 1,
      autoAlpha: 1,
      duration: preset.duration,
      ease: preset.ease,
      delay,
      scrollTrigger,
    });
  });

  return (
    <Tag ref={ref} data-reveal="" className={className}>
      {children}
    </Tag>
  );
}
