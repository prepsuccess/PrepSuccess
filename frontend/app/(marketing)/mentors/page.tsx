import type { Metadata } from "next";
import { Annotation, DrawScope, SketchIcon, Underlined } from "@/components/ui/Annotation";
import { Button } from "@/components/ui/Button";
import { Mark } from "@/components/ui/Mark";
import { StatusGlyph } from "@/components/ui/MiniUI";
import { Panel } from "@/components/ui/Panel";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { PageHero } from "@/components/marketing/sections/PageHero";
import { FeatureRow } from "@/components/marketing/sections/FeatureRow";
import { Pillars } from "@/components/marketing/sections/Pillars";
import { MergedStepsCard, SessionBriefCard } from "@/components/marketing/previews/PageCards";
import { mentors } from "@/lib/content";

export const metadata: Metadata = {
  title: "For mentors — PrepSuccess",
  description:
    "Mentor on PrepSuccess: meet students 1:1, starting from their real skill gaps. Coming soon.",
};

function Visibility() {
  const columns = [
    { title: "You see", items: mentors.sees, status: "mastered" as const },
    { title: "You don't", items: mentors.hidden, status: "revision" as const },
  ];
  return (
    <div className="grid max-w-[480px] gap-6 sm:grid-cols-2">
      {columns.map((column) => (
        <div key={column.title}>
          <p className="border-heading text-heading border-b pb-2 font-mono text-[11px] tracking-[0.12em] uppercase">
            {column.title}
          </p>
          <ul className="mt-1 flex flex-col">
            {column.items.map((item) => (
              <li
                key={item}
                className="border-border text-heading flex items-center gap-2.5 border-b py-2.5 text-[14px]"
              >
                <StatusGlyph status={column.status} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default function MentorsPage() {
  return (
    <>
      <PageHero
        eyebrow="for mentors"
        title={
          <>
            Your experience, pointed at a{" "}
            <Underlined now delay={0.6}>
              real
            </Underlined>{" "}
            gap.
          </>
        }
        description={mentors.description}
        meta="Coming soon"
        note={
          <Annotation
            now
            delay={2}
            arrow="down-left"
            tilt="rotate-[5deg]"
            label={"no blank-slate\nsessions"}
            className="-right-[6%] -bottom-24"
            labelClassName="pl-14"
            arrowClassName="h-[60px] w-[96px]"
          />
        }
      >
        <Reveal onLoad delay={0.5} className="mt-10 flex flex-wrap justify-center gap-4">
          <Button href="/signup?as=mentor" label="Register interest" />
          <Button href="/roadmap#mentors" label="See the roadmap" variant="secondary" />
        </Reveal>
      </PageHero>

      <FeatureRow
        eyebrow="Before the call"
        title="Walk in knowing the gap."
        body="Before a session you get a short brief: the student's target role, their key gaps and your earlier notes. Enough to use the hour well — nothing more."
        extra={<Visibility />}
        visual={<SessionBriefCard />}
      />

      <Panel>
        <Pillars
          padding="120x120"
          title="How mentoring works"
          description="Four steps, from approval to the notes a student acts on."
          items={mentors.steps}
          sketches={["tick", "box", "chat", "book"]}
        />
      </Panel>

      <FeatureRow
        reverse
        eyebrow="After the call"
        title="Your notes become their next steps."
        body="What you recommend lands on the student's dashboard, in the same list as the AI's suggestions — so they work from one plan, not two."
        points={[
          "Notes stay with that student",
          "Follow-ups show up as next steps",
          "Their updated gaps are in your next brief",
        ]}
        visual={<MergedStepsCard />}
      />

      <Panel className="mb-4">
        <Section>
          <DrawScope className="relative mx-auto flex max-w-[760px] flex-col items-center text-center">
            <SketchIcon name="heart" delay={0.2} className="text-accent h-14 w-14 -rotate-6" />
            <SplitHeading className="text-h2 mt-6">
              Be the senior you <Mark>wish you&apos;d had</Mark>.
            </SplitHeading>
            <Reveal delay={0.2} className="mt-5 max-w-[52ch]">
              <p className="text-[17px]">
                Mentoring opens soon. Every mentor is verified by our team before students can book
                them.
              </p>
            </Reveal>
            <Reveal delay={0.3} className="mt-10">
              <Button href="/signup?as=mentor" label="Register interest" />
            </Reveal>
          </DrawScope>
        </Section>
      </Panel>
    </>
  );
}
