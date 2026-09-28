"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";

export type TimelineItem = {
  id: string;
  /** Handwritten marker note beside the node, e.g. "final year\naugust". */
  when: string;
  eyebrow?: string;
  title: string;
  body: string;
  visual: ReactNode;
  /** Optional content under the body, such as a feature list. */
  extra?: ReactNode;
};

/**
 * Entries hung on a pencil rail that draws down the page as you read; each node
 * fills in as it's reached. Text and screen swap sides from one entry to the next.
 */
export function Timeline({ items, offset = 0 }: { items: TimelineItem[]; offset?: number }) {
  const root = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el || !fill.current) return;
      const nodes = el.querySelectorAll<HTMLElement>("[data-node]");

      if (prefersReducedMotion()) {
        gsap.set(fill.current, { scaleY: 1 });
        nodes.forEach((node) => node.classList.add("is-reached"));
        return;
      }

      gsap.fromTo(
        fill.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top 60%", end: "bottom 60%", scrub: 0.6 },
        },
      );
      nodes.forEach((node) =>
        ScrollTrigger.create({
          trigger: node,
          start: "top 60%",
          toggleClass: { targets: node, className: "is-reached" },
        }),
      );
    },
    { scope: root },
  );

  return (
    <Section padding="100x100" className="!pt-6 lg:!pt-10">
      <div ref={root} className="relative pl-10 lg:pl-0">
        <div
          aria-hidden
          className="bg-border absolute top-16 bottom-16 left-[11px] w-[2px] [filter:url(#pencil)]"
        >
          <div ref={fill} className="bg-accent h-full w-full origin-top scale-y-0" />
        </div>

        {items.map((item, i) => {
          const visualFirst = (offset + i) % 2 === 1;
          return (
            <article
              key={item.id}
              id={item.id}
              className="relative scroll-mt-24 py-16 lg:grid lg:grid-cols-[150px_minmax(0,1fr)] lg:py-24"
            >
              <span
                data-node
                aria-hidden
                className="border-border-strong bg-bg [&.is-reached]:border-accent [&.is-reached]:bg-accent absolute top-[66px] -left-[36px] z-10 h-4 w-4 rounded-full border-2 transition-colors duration-500 lg:top-[98px] lg:left-[4px]"
              />

              <p className="font-marker text-accent -rotate-2 text-[15px] leading-[1.15] whitespace-pre-line uppercase lg:pl-9">
                {item.when}
              </p>

              <div className="mt-5 grid items-center gap-24 lg:mt-0 lg:grid-cols-2 lg:gap-16">
                <div className={visualFirst ? "lg:order-2" : ""}>
                  {item.eyebrow ? (
                    <span className="text-text-dim mb-4 block font-mono text-[11px] tracking-[0.12em] uppercase">
                      {item.eyebrow}
                    </span>
                  ) : null}
                  <SplitHeading className="text-h3">{item.title}</SplitHeading>
                  <Reveal delay={0.2} className="mt-5 max-w-[46ch]">
                    <p className="text-[16px]">{item.body}</p>
                  </Reveal>
                  {item.extra ? (
                    <Reveal delay={0.3} className="mt-6">
                      {item.extra}
                    </Reveal>
                  ) : null}
                </div>
                <Reveal offset={10} delay={0.1} className={visualFirst ? "lg:order-1" : ""}>
                  {item.visual}
                </Reveal>
              </div>
            </article>
          );
        })}
      </div>
    </Section>
  );
}
