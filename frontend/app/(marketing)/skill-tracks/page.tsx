import type { Metadata } from "next";
import { Annotation, Circled } from "@/components/ui/Annotation";
import { Chip } from "@/components/ui/MiniUI";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { PageHero, PageIndex } from "@/components/marketing/sections/PageHero";
import { FeatureRow } from "@/components/marketing/sections/FeatureRow";
import { TopicMarquee } from "@/components/marketing/sections/TopicMarquee";
import { CTA } from "@/components/marketing/sections/CTA";
import { TrackCard } from "@/components/marketing/previews/PageCards";
import { trackGroups } from "@/lib/content";

export const metadata: Metadata = {
  title: "Skill tracks — PrepSuccess",
  description:
    "Technical skills, aptitude and soft skills — the three things placements are decided on, each checked topic by topic.",
};

const tilts = ["rotate-[1.5deg]", "-rotate-[1.5deg]", "rotate-[1deg]"];

export default function SkillTracksPage() {
  return (
    <>
      <PageHero
        eyebrow="skill tracks"
        title={
          <>
            Three skill areas. Every topic{" "}
            <Circled now delay={0.6}>
              tested
            </Circled>
            .
          </>
        }
        description="Placements test technical skills, aptitude and soft skills. PrepSuccess checks all three, because a strong score in one can't hide a gap in another."
        note={
          <Annotation
            now
            delay={2}
            arrow="down-left"
            tilt="rotate-[5deg]"
            label={"claim a skill.\nprove it."}
            className="-right-[6%] -bottom-24"
            labelClassName="pl-14"
            arrowClassName="h-[60px] w-[96px]"
          />
        }
      >
        <PageIndex
          label="Tracks"
          items={trackGroups.map((group) => ({
            href: `#${group.id}`,
            label: `${group.title} · ${group.topics.length}`,
          }))}
        />
      </PageHero>

      {trackGroups.map((group, i) => (
        <FeatureRow
          key={group.id}
          id={group.id}
          eyebrow={`${group.category} · ${group.topics.length} topics`}
          title={group.title}
          body={group.description}
          points={group.modes}
          extra={
            <div className="flex max-w-[480px] flex-wrap gap-2">
              {group.topics.map((topic) => (
                <Chip key={topic} className="px-2.5 py-1.5 text-[12px]">
                  {topic}
                </Chip>
              ))}
            </div>
          }
          visual={
            <TrackCard kind={group.preview} tag={group.category} tilt={tilts[i % tilts.length]} />
          }
          reverse={i % 2 === 1}
        />
      ))}

      <TopicMarquee />

      <div className="flex justify-center">
        <ArrowLink href="/how-it-works#pass-mark" label="How a topic is scored" className="group" />
      </div>

      <CTA />
    </>
  );
}
