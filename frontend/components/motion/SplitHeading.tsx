"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP, SplitText, isCompactScreen, prefersReducedMotion } from "@/lib/gsap";

type HeadingTag = "h1" | "h2" | "h3";

/**
 * LearnEdge's headline reveal: masked lines flip up from rotateX(90deg), 1.2s each,
 * 0.2s apart. Splits once fonts are ready and restores the plain text when done,
 * so nothing re-splits later and the heading reflows naturally on resize.
 */
export function SplitHeading({
  as: Tag = "h2",
  children,
  onLoad = false,
  className = "",
}: {
  as?: HeadingTag;
  children: ReactNode;
  onLoad?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);

  useGSAP((_context, contextSafe) => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      gsap.set(el, { visibility: "visible" });
      el.setAttribute("data-split-done", "");
      return;
    }

    if (isCompactScreen()) {
      gsap.set(el, { visibility: "visible" });
      el.setAttribute("data-split-done", "");
      return;
    }

    let split: SplitText | undefined;

    const play = contextSafe!(() => {
      if (!el.isConnected) return;
      split = SplitText.create(el, { type: "lines", mask: "lines" });
      gsap.set(el, { visibility: "visible" });
      gsap.fromTo(
        split.lines,
        { autoAlpha: 0, rotationX: 90, transformPerspective: 800, transformOrigin: "50% 100%" },
        {
          autoAlpha: 1,
          rotationX: 0,
          duration: 1.2,
          stagger: 0.2,
          ease: "power3.out",
          delay: onLoad ? 0.1 : 0,
          scrollTrigger: onLoad ? undefined : { trigger: el, start: "top 80%", once: true },
          onComplete: () => {
            // Hand the DOM back to React untouched; pencil marks inside wait for this flag.
            split?.revert();
            el.setAttribute("data-split-done", "");
          },
        },
      );
    });

    document.fonts.ready.then(play);
    return () => split?.revert();
  });

  return (
    <Tag ref={ref} data-split="" className={className}>
      {children}
    </Tag>
  );
}
