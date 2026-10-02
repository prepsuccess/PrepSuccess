import { Panel } from "@/components/ui/Panel";
import { Section } from "@/components/ui/Section";
import { Annotation, Circled, DrawScope, SketchIcon } from "@/components/ui/Annotation";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";

const checklist = [
  "sign up · it's free",
  "chat with the AI agent",
  "take your first skill check",
  "see where you stand",
];

/** A handwritten to-do that ticks itself off in pencil once the sheet is in view. */
function Checklist() {
  return (
    <div className="-rotate-1">
      <p className="font-marker text-text-dim text-[20px]">before placements:</p>
      <ul className="mt-5 flex flex-col gap-[14px]">
        {checklist.map((item, i) => {
          const delay = 0.5 + i * 0.55;
          return (
            <li key={item} className="flex items-center gap-3">
              <span className="relative h-7 w-7 flex-none">
                <SketchIcon
                  name="box"
                  delay={delay}
                  className="text-heading/70 absolute inset-0 h-7 w-7"
                />
                <SketchIcon
                  name="tick"
                  delay={delay + 0.35}
                  className="text-accent absolute -top-1.5 left-0.5 h-8 w-8"
                />
              </span>
              <span className="font-marker text-heading/85 text-[25px] leading-none">{item}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Closing call-to-action set on a taped-down sheet of ruled notebook paper. */
export function CTA() {
  return (
    <Panel className="mt-[60px] mb-4 lg:mt-[120px]">
      <Section className="z-10">
        <DrawScope className="relative mx-auto max-w-[1040px]">
          <span
            aria-hidden
            className="bg-accent/20 absolute -top-3.5 left-1/2 z-20 h-8 w-32 -translate-x-1/2 -rotate-3"
          />
          <div className="border-border bg-surface relative -rotate-[0.4deg] overflow-clip rounded-[6px] border bg-[repeating-linear-gradient(to_bottom,transparent_0,transparent_35px,var(--color-border)_35px,var(--color-border)_36px)] bg-[position:0_22px]">
            <span
              aria-hidden
              className="bg-accent/40 absolute inset-y-0 left-10 w-px sm:left-[72px]"
            />
            <span
              aria-hidden
              className="bg-accent/25 absolute inset-y-0 left-[42px] w-px sm:left-[75px]"
            />
            {[18, 50, 82].map((top) => (
              <span
                key={top}
                aria-hidden
                className="border-border bg-surface-3 absolute left-3 hidden h-4 w-4 rounded-full border sm:left-6 sm:block"
                style={{ top: `${top}%` }}
              />
            ))}

            <div className="grid items-center gap-12 py-12 pr-6 pl-16 sm:py-16 sm:pr-12 sm:pl-[112px] lg:grid-cols-[1.25fr_0.75fr] lg:gap-10">
              <div>
                <SplitHeading className="text-h2">
                  Stop guessing. Start knowing your <Circled delay={0.1}>readiness</Circled>.
                </SplitHeading>
                <Reveal delay={0.2} className="mt-5 max-w-[46ch]">
                  <p>PrepSuccess is free, and the AI coach is free for your first 4 months.</p>
                </Reveal>
                <div className="relative mt-10 inline-flex">
                  <Reveal delay={0.3}>
                    <Button href="/signup" label="Get started free" />
                  </Reveal>
                  <Annotation
                    delay={0.9}
                    arrow="left"
                    layout="label-right"
                    tilt="rotate-[3deg]"
                    label={"free for\nstudents"}
                    className="top-1/2 left-[calc(100%+8px)] -translate-y-1/2"
                    arrowClassName="h-[46px] w-[80px]"
                  />
                </div>
              </div>

              <Checklist />
            </div>
          </div>
        </DrawScope>
      </Section>
    </Panel>
  );
}
