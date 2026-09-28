import type { Metadata } from "next";
import { Annotation, Circled, Underlined } from "@/components/ui/Annotation";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { PageHero, PageIndex } from "@/components/marketing/sections/PageHero";
import { FeatureRow } from "@/components/marketing/sections/FeatureRow";
import { Pillars } from "@/components/marketing/sections/Pillars";
import { CTA } from "@/components/marketing/sections/CTA";
import {
  ProfileCard,
  ResourceCard,
  TaskCard,
  ThresholdCard,
  TopicsCard,
} from "@/components/marketing/previews/PageCards";
import { howItWorks } from "@/lib/content";

export const metadata: Metadata = {
  title: "How it works — PrepSuccess",
  description:
    "How PrepSuccess works: a chat with the AI, a check of every skill you claim, a pass mark, study material for every gap, and your dashboard.",
};

const visuals = {
  onboarding: <ProfileCard />,
  assessment: <TaskCard />,
  "pass-mark": <ThresholdCard />,
  study: <ResourceCard />,
  dashboard: <TopicsCard />,
};

export default function HowItWorksPage() {
  const { steps } = howItWorks;

  return (
    <>
      <PageHero
        eyebrow="how it works"
        title={
          <>
            From one{" "}
            <Underlined now delay={0.2}>
              chat
            </Underlined>{" "}
            to an honest{" "}
            <Circled now delay={0.7}>
              answer
            </Circled>
            .
          </>
        }
        description={howItWorks.description}
        note={
          <Annotation
            now
            delay={2}
            arrow="down-left"
            tilt="rotate-[5deg]"
            label={"no forms.\nno fixed paper."}
            className="-right-[6%] -bottom-28"
            labelClassName="pl-14"
            arrowClassName="h-[60px] w-[96px]"
          />
        }
      >
        <Reveal onLoad delay={0.5} className="mt-10 flex flex-wrap justify-center gap-4">
          <Button href="/signup" label="Get started free" />
          <Button href="/skill-tracks" label="See the skill tracks" variant="secondary" />
        </Reveal>
        <PageIndex
          label="Steps"
          items={steps.map((step) => ({
            href: `#${step.id}`,
            label: step.eyebrow.split(" · ")[1],
          }))}
        />
      </PageHero>

      {steps.map((step, i) => (
        <FeatureRow
          key={step.id}
          id={step.id}
          eyebrow={step.eyebrow}
          title={step.title}
          body={step.body}
          points={step.points}
          visual={visuals[step.id as keyof typeof visuals]}
          reverse={i % 2 === 1}
        />
      ))}

      <Pillars
        padding="120x120"
        title="What the AI will — and won't — do"
        description="So every answer it gives you is one you can trust."
        items={howItWorks.principles}
        sketches={["target", "chat", "heart"]}
      />

      <CTA />
    </>
  );
}
