import type { Metadata } from "next";
import { Annotation, Underlined } from "@/components/ui/Annotation";
import { PageHero, PageIndex } from "@/components/marketing/sections/PageHero";
import { Timeline } from "@/components/marketing/sections/Timeline";
import { PointList } from "@/components/marketing/sections/FeatureRow";
import { Pillars } from "@/components/marketing/sections/Pillars";
import { Panel } from "@/components/ui/Panel";
import { CTA } from "@/components/marketing/sections/CTA";
import { RoadmapCard } from "@/components/marketing/previews/PageCards";
import { audiences, roadmapItems } from "@/lib/content";

export const metadata: Metadata = {
  title: "Roadmap — PrepSuccess",
  description:
    "What's live on PrepSuccess today, and what's coming next: interview prep, 1:1 mentors, resume feedback and jobs.",
};

const tilts = ["rotate-[1.5deg]", "-rotate-[1.5deg]"];

export default function RoadmapPage() {
  return (
    <>
      <PageHero
        eyebrow="roadmap"
        title={
          <>
            What&apos;s{" "}
            <Underlined now delay={0.4}>
              live
            </Underlined>
            , and what&apos;s next.
          </>
        }
        description="PrepSuccess is live for college students today. Here's what we're building next."
        note={
          <Annotation
            now
            delay={2}
            arrow="down-left"
            tilt="rotate-[5deg]"
            label={"start here"}
            className="-right-[4%] -bottom-24"
            labelClassName="pl-14"
            arrowClassName="h-[60px] w-[96px]"
          />
        }
      >
        <PageIndex
          label="Roadmap"
          items={roadmapItems.map((item) => ({ href: `#${item.id}`, label: item.title }))}
        />
      </PageHero>

      <Timeline
        items={roadmapItems.map((item, i) => ({
          id: item.id,
          when: item.status,
          title: item.title,
          body: item.why,
          extra: (
            <div className="max-w-[440px]">
              <PointList points={item.features} />
            </div>
          ),
          visual: <RoadmapCard visual={item.visual} tilt={tilts[i % 2]} />,
        }))}
      />

      <Panel>
        <Pillars
          padding="120x120"
          title="Who it's for"
          description="Built for college students first. Freshers and working professionals are next."
          items={audiences}
          sketches={["book", "target", "heart"]}
        />
      </Panel>

      <CTA />
    </>
  );
}
