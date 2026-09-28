"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/** Hand-drawn arrow shapes (viewBox 120×80): a wobbly shaft plus a two-stroke head. */
const ARROWS = {
  "down-left": ["M112 8 C 96 4, 70 10, 52 30 C 40 44, 30 56, 20 68", "M34 64 L 19 69 L 21 53"],
  "down-right": ["M8 8 C 24 4, 50 10, 68 30 C 80 44, 90 56, 100 68", "M86 64 L 101 69 L 99 53"],
  right: ["M4 44 C 24 34, 46 50, 70 40 C 84 34, 96 38, 110 36", "M98 26 L 111 36 L 99 46"],
  left: ["M116 44 C 96 34, 74 50, 50 40 C 36 34, 24 38, 10 36", "M22 26 L 9 36 L 21 46"],
  "up-right": ["M8 72 C 20 50, 44 30, 70 22 C 84 18, 96 16, 108 14", "M96 6 L 109 14 L 98 24"],
} as const;

export type ArrowShape = keyof typeof ARROWS;

const PENCIL = "[filter:url(#pencil)]";

/** True once the element has scrolled ~15% into the viewport (never, if `skip`). */
function useInView<T extends HTMLElement>(skip = false) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (skip || !ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [skip]);

  return [ref, inView] as const;
}

/** Wrapper that starts every pencil stroke inside it once it scrolls into view. */
export function DrawScope({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const [ref, inView] = useInView<HTMLDivElement>();
  return (
    <div ref={ref} data-inview={inView || undefined} className={className}>
      {children}
    </div>
  );
}

function drawStyle(seconds: number, duration?: number): CSSProperties {
  return {
    "--d": `${seconds}s`,
    ...(duration ? { "--draw-dur": `${duration}s` } : {}),
  } as CSSProperties;
}

/**
 * A pencil stroke: the main line plus a lighter second pass slightly offset,
 * the way a sketch gets gone over twice. Both draw in like a pen.
 */
function SketchPath({
  d,
  delay,
  duration,
  now,
  width = 2.9,
  scaleFree = false,
}: {
  d: string;
  delay: number;
  duration: number;
  now: boolean;
  width?: number;
  scaleFree?: boolean;
}) {
  const cls = `draw ${now ? "now" : ""}`;
  const common = {
    d,
    pathLength: 1,
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    vectorEffect: scaleFree ? ("non-scaling-stroke" as const) : undefined,
  };
  return (
    <>
      <path {...common} className={cls} style={drawStyle(delay, duration)} strokeWidth={width} />
      <path
        {...common}
        className={cls}
        style={drawStyle(delay + 0.12, duration)}
        strokeWidth={width * 0.45}
        strokeOpacity={0.55}
        transform="translate(1.2 0.9)"
      />
    </>
  );
}

export function Arrow({
  shape,
  delay = 0,
  now = false,
  className = "",
}: {
  shape: ArrowShape;
  delay?: number;
  now?: boolean;
  className?: string;
}) {
  const [shaft, head] = ARROWS[shape];
  return (
    <svg
      viewBox="0 0 120 80"
      aria-hidden
      className={`text-accent overflow-visible ${PENCIL} ${className}`}
    >
      <SketchPath d={shaft} delay={delay} duration={0.7} now={now} />
      <SketchPath d={head} delay={delay + 0.6} duration={0.25} now={now} />
    </svg>
  );
}

/** A loose pencil circle around a word. CSS-only animation, so it's safe inside SplitHeading. */
export function Circled({
  children,
  delay = 0,
  now = false,
}: {
  children: ReactNode;
  delay?: number;
  now?: boolean;
}) {
  return (
    <span className="relative inline-block whitespace-nowrap">
      {children}
      <svg
        viewBox="0 0 200 80"
        preserveAspectRatio="none"
        aria-hidden
        className={`text-accent pointer-events-none absolute -top-[18%] -left-[9%] h-[136%] w-[118%] overflow-visible ${PENCIL}`}
      >
        <SketchPath
          d="M40 14 C 90 2, 168 4, 190 28 C 206 50, 160 74, 98 75 C 40 76, 4 62, 8 38 C 12 18, 60 8, 132 8"
          delay={delay}
          duration={0.9}
          now={now}
          width={3}
          scaleFree
        />
      </svg>
    </span>
  );
}

/** A quick wavy pencil underline, the second stroke trailing off to the right. */
export function Underlined({
  children,
  delay = 0,
  now = false,
}: {
  children: ReactNode;
  delay?: number;
  now?: boolean;
}) {
  return (
    <span className="relative inline-block whitespace-nowrap">
      {children}
      <svg
        viewBox="0 0 200 20"
        preserveAspectRatio="none"
        aria-hidden
        className={`text-accent pointer-events-none absolute -bottom-[0.16em] -left-[3%] h-[0.28em] w-[106%] overflow-visible ${PENCIL}`}
      >
        <SketchPath
          d="M4 12 C 40 5, 80 16, 118 9 S 170 6, 196 11"
          delay={delay}
          duration={0.6}
          now={now}
          width={3}
          scaleFree
        />
        <SketchPath
          d="M30 17 C 70 12, 120 18, 176 14"
          delay={delay + 0.35}
          duration={0.45}
          now={now}
          width={2}
          scaleFree
        />
      </svg>
    </span>
  );
}

/** Three little pencil strokes — a doodled sparkle. Position it absolutely. */
export function Sparkle({
  delay = 0,
  now = false,
  className = "",
}: {
  delay?: number;
  now?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden
      className={`text-accent pointer-events-none absolute overflow-visible ${PENCIL} ${className}`}
    >
      <SketchPath d="M20 4 L 21 15" delay={delay} duration={0.2} now={now} />
      <SketchPath d="M6 14 L 15 19" delay={delay + 0.15} duration={0.2} now={now} />
      <SketchPath d="M34 13 L 26 19" delay={delay + 0.3} duration={0.2} now={now} />
    </svg>
  );
}

/** Loose pencil doodles (viewBox 48×48), each a list of strokes drawn in order. */
const SKETCHES = {
  chat: [
    "M8 13 C 8 8, 12 6, 17 6 L 34 6 C 39 6, 42 9, 42 14 L 42 25 C 42 31, 38 34, 33 34 L 22 34 L 13 41 L 15 34 C 10 33, 8 30, 8 25 Z",
    "M16 16 L 34 15.5",
    "M16 24 L 28 24.5",
  ],
  target: [
    "M25 6 C 36 6, 43 14, 42 25 C 41 36, 32 42, 23 42 C 12 42, 5 34, 6 23 C 7 13, 14 7, 27 7",
    "M24 15 C 30 15, 33 19, 33 24 C 33 30, 29 33, 24 33 C 18 33, 15 29, 15 24 C 15 19, 19 15, 26 16",
    "M24 24 L 41 7",
    "M34 7 L 41 7 L 41 14",
  ],
  book: [
    "M24 12 C 18 8, 12 8, 6 9 L 6 38 C 12 37, 18 37, 24 41 C 30 37, 36 37, 42 38 L 42 9 C 36 8, 30 8, 24 12 Z",
    "M24 12 L 24 40",
    "M11 17 L 19 17.5",
    "M29 17.5 L 37 17",
  ],
  question: [
    "M15 17 C 15 9, 21 6, 26 7 C 32 8, 35 13, 33 18 C 31 23, 24 23, 24 30",
    "M24 37 L 24.4 38.5",
  ],
  heart: [
    "M24 40 C 12 31, 6 24, 8 16 C 10 9, 19 8, 24 16 C 29 8, 38 9, 40 16 C 42 24, 36 31, 24 40 Z",
  ],
  box: [
    "M9 10 C 20 8, 30 9.5, 40 9 C 40.5 20, 39.5 30, 40 40 C 29 41, 19 39.5, 8.5 40 C 9 30, 8 20, 9.5 8",
  ],
  tick: ["M12 25 L 21 35 C 27 23, 34 14, 44 5"],
} as const;

export type SketchName = keyof typeof SKETCHES;

/** A graphite-pencil doodle icon that sketches itself in when its scope is in view (or `now`). */
export function SketchIcon({
  name,
  delay = 0,
  now = false,
  className = "h-12 w-12 text-heading",
}: {
  name: SketchName;
  delay?: number;
  now?: boolean;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden className={`overflow-visible ${PENCIL} ${className}`}>
      {SKETCHES[name].map((d, i) => (
        <SketchPath key={d} d={d} delay={delay + i * 0.35} duration={0.6} now={now} width={2.1} />
      ))}
    </svg>
  );
}

/** A pencil underline that draws when the nearest `.group` is hovered and erases on leave. */
export function HoverScribble({
  children,
  active = false,
  className = "",
}: {
  children: ReactNode;
  active?: boolean;
  className?: string;
}) {
  return (
    <span className={`relative inline-block ${className}`}>
      {children}
      <svg
        viewBox="0 0 200 12"
        preserveAspectRatio="none"
        aria-hidden
        className={`hover-draw ${active ? "is-active" : ""} text-accent pointer-events-none absolute -bottom-1.5 left-0 h-2.5 w-full overflow-visible ${PENCIL}`}
      >
        <path
          d="M2 7 C 50 3, 100 10, 150 5 S 190 6, 198 6"
          pathLength={1}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

/** A small static pencil asterisk, for separators. */
export function PencilAsterisk({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={`flex-none ${PENCIL} ${className}`}>
      <path
        d="M12 3.5 L12.4 20.5 M4.5 8 L19.5 16 M19 7.5 L5 16.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

type Layout = "label-above" | "label-below" | "label-left" | "label-right";

const layoutClasses: Record<Layout, string> = {
  "label-above": "flex-col",
  "label-below": "flex-col-reverse",
  "label-left": "flex-row items-center",
  "label-right": "flex-row-reverse items-center",
};

/**
 * Handwritten note with a scribbled pencil arrow. Draws when scrolled into view,
 * or right away with `now` (hero). Desktop only — it points at things by position.
 */
export function Annotation({
  label,
  arrow,
  layout = "label-above",
  delay = 0,
  now = false,
  tilt = "",
  className = "",
  arrowClassName = "h-[64px] w-[96px]",
  labelClassName = "",
}: {
  label: string;
  arrow: ArrowShape;
  layout?: Layout;
  delay?: number;
  now?: boolean;
  tilt?: string;
  className?: string;
  arrowClassName?: string;
  labelClassName?: string;
}) {
  const [ref, inView] = useInView<HTMLDivElement>(now);

  return (
    <div
      ref={ref}
      aria-hidden
      data-inview={inView || undefined}
      className={`pointer-events-none absolute z-20 hidden lg:flex ${layoutClasses[layout]} ${className}`}
    >
      <span
        className={`ink ${now ? "now" : ""} font-marker text-accent block text-[17px] leading-[1.1] whitespace-pre uppercase opacity-90 ${tilt} ${labelClassName}`}
        style={drawStyle(delay + 0.75)}
      >
        {label}
      </span>
      <Arrow shape={arrow} delay={delay} now={now} className={arrowClassName} />
    </div>
  );
}
