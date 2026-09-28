import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { PencilAsterisk } from "@/components/ui/Annotation";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";

/** A pencil-asterisk list, ruled like notebook lines. */
export function PointList({ points }: { points: string[] }) {
  return (
    <ul className="border-border flex flex-col border-t">
      {points.map((point) => (
        <li
          key={point}
          className="border-border text-heading flex items-center gap-3 border-b py-3 text-[15px]"
        >
          <PencilAsterisk className="text-accent h-3.5 w-3.5" />
          {point}
        </li>
      ))}
    </ul>
  );
}

/** Text on one side, a taped product screen on the other. `reverse` swaps sides. */
export function FeatureRow({
  id,
  eyebrow,
  title,
  body,
  points,
  extra,
  visual,
  reverse = false,
}: {
  id?: string;
  eyebrow: string;
  title: ReactNode;
  body: string;
  points?: string[];
  extra?: ReactNode;
  visual: ReactNode;
  reverse?: boolean;
}) {
  return (
    <section id={id} className="relative scroll-mt-24 py-[60px] md:py-20 lg:py-[100px]">
      <Container>
        <div className="grid items-center gap-24 lg:grid-cols-2 lg:gap-20">
          <div className={reverse ? "lg:order-2" : ""}>
            <span className="text-text-dim text-[12px] tabular-nums">{eyebrow}</span>
            <SplitHeading className="text-h3 mt-4">{title}</SplitHeading>
            <Reveal delay={0.2} className="mt-5 max-w-[48ch]">
              <p className="text-[16px]">{body}</p>
            </Reveal>
            {points ? (
              <Reveal delay={0.3} className="mt-8 max-w-[440px]">
                <PointList points={points} />
              </Reveal>
            ) : null}
            {extra ? (
              <Reveal delay={0.35} className="mt-8">
                {extra}
              </Reveal>
            ) : null}
          </div>
          <Reveal offset={10} delay={0.1} className={reverse ? "lg:order-1" : ""}>
            {visual}
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
