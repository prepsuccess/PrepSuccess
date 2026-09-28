import type { CSSProperties, ReactNode } from "react";
import { Panel } from "@/components/ui/Panel";
import { Container } from "@/components/ui/Container";
import { HoverScribble, Sparkle } from "@/components/ui/Annotation";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";

/**
 * Top of every inner page, in the home hero's language: a marker-hand eyebrow,
 * a line-by-line headline carrying pencil marks, and a grey panel behind it all.
 */
export function PageHero({
  eyebrow,
  title,
  description,
  meta,
  note,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
  /** Small mono line under the description. */
  meta?: string;
  /** An absolutely positioned hand-drawn Annotation beside the headline. */
  note?: ReactNode;
  /** Extra content below the text block, such as buttons or a section index. */
  children?: ReactNode;
}) {
  return (
    <Panel flushTop>
      <header className="relative pt-[140px] pb-12 sm:pt-[160px] lg:pt-[190px] lg:pb-16">
        <Container>
          <div className="relative mx-auto flex max-w-[860px] flex-col items-center text-center">
            <p
              className="ink now font-marker text-accent -rotate-2 text-[23px]"
              style={{ "--d": "0.1s" } as CSSProperties}
            >
              {eyebrow}
            </p>
            <SplitHeading as="h1" onLoad className="text-h1 mt-5 mb-6">
              {title}
            </SplitHeading>
            <Sparkle
              now
              delay={2.4}
              className="-top-2 right-[4%] hidden h-10 w-10 rotate-12 lg:block"
            />

            <Reveal onLoad delay={0.3} className="max-w-[580px]">
              <p className="text-[17px]">{description}</p>
            </Reveal>
            {meta ? (
              <Reveal onLoad delay={0.45} className="mt-6">
                <p className="text-text-dim text-[12px] tabular-nums">{meta}</p>
              </Reveal>
            ) : null}
            {note}
          </div>

          {children}
        </Container>
      </header>
    </Panel>
  );
}

/** A ruled row of jump links under a page hero. */
export function PageIndex({
  items,
  label,
}: {
  items: { href: string; label: string }[];
  label: string;
}) {
  const cols: Record<number, string> = {
    3: "sm:grid-cols-3",
    4: "sm:grid-cols-4",
    5: "sm:grid-cols-3 lg:grid-cols-5",
    7: "sm:grid-cols-4 lg:grid-cols-7",
  };
  return (
    <Reveal onLoad delay={0.6} className="mt-24 lg:mt-28">
      <nav aria-label={label}>
        <ol
          className={`border-heading grid grid-cols-2 border-t ${cols[items.length] ?? "sm:grid-cols-4"}`}
        >
          {items.map((item, i) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="group border-border flex items-baseline gap-2.5 border-b py-4 pr-3"
              >
                <span className="text-text-dim text-[12px] tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-heading text-[15px]">
                  <HoverScribble>{item.label}</HoverScribble>
                </span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </Reveal>
  );
}
