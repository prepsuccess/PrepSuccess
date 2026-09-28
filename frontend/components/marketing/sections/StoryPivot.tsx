import { Panel } from "@/components/ui/Panel";
import { Section } from "@/components/ui/Section";
import { Mark } from "@/components/ui/Mark";
import { Annotation, DrawScope, SketchIcon } from "@/components/ui/Annotation";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { story } from "@/lib/content";

/** The turn in the story: the problem named, before the product enters. */
export function StoryPivot() {
  return (
    <Panel>
      <Section>
        <DrawScope className="relative mx-auto flex max-w-[880px] flex-col items-center text-center">
          <SketchIcon name="question" delay={0.2} className="text-accent h-16 w-16 -rotate-6" />
          <SplitHeading className="text-h2 mt-6">
            It was never a lack of effort. It was a lack of <Mark>information</Mark>.
          </SplitHeading>
          <Reveal delay={0.2} className="mt-6 max-w-[58ch]">
            <p className="text-[17px]">{story.pivot.body}</p>
          </Reveal>
          <Reveal delay={0.35} className="relative mt-12">
            <p className="font-marker text-heading -rotate-1 text-[29px] leading-snug">
              so we built the thing we wished we&apos;d had.
            </p>
          </Reveal>
          <Annotation
            delay={0.9}
            arrow="down-right"
            tilt="-rotate-[4deg]"
            label={"here's how\nit goes"}
            className="-bottom-24 left-[4%]"
            arrowClassName="ml-16 h-[58px] w-[90px]"
          />
        </DrawScope>
      </Section>
    </Panel>
  );
}
