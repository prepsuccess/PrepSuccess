import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { LineIcon } from "@/components/ui/LineIcon";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { PreviewFrame } from "@/components/ui/PreviewFrame";
import { Reveal } from "@/components/motion/Reveal";
import { Annotation, HoverScribble } from "@/components/ui/Annotation";
import { RoadmapPreview } from "@/components/marketing/previews/RoadmapPreview";
import { roadmap } from "@/lib/content";

export function Roadmap() {
  return (
    <Section id="roadmap">
      <SectionTitle
        title="Built to grow with you"
        description="The assessment is the foundation. Everything that ships next builds on the same readiness data."
        note={
          <Annotation
            arrow="down-left"
            tilt="-rotate-[5deg]"
            label="coming next"
            className="top-[42%] -left-[30%]"
            labelClassName="pl-14"
            arrowClassName="h-[64px] w-[96px]"
          />
        }
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {roadmap.map((item, i) => (
          <Reveal key={item.title} offset={12} delay={0.1 * i} className="h-full">
            <article className="group card card-hover flex h-full cursor-default flex-col p-3">
              <div className="relative">
                <PreviewFrame tag={item.phase} aspect="aspect-[424/380]">
                  <RoadmapPreview kind={item.preview} />
                </PreviewFrame>

                <div className="absolute right-3 bottom-3 z-20 flex w-11 items-center justify-end overflow-clip rounded-full transition-[width] duration-400 ease-out group-hover:w-[200px]">
                  <div className="border-heading bg-surface text-heading flex h-11 flex-none items-center rounded-full border pr-14 pl-4 text-[12px] font-medium whitespace-nowrap">
                    {item.tags.join(" · ")}
                  </div>
                  <span className="bg-heading absolute right-0 z-10 grid h-11 w-11 place-items-center rounded-full text-white transition-transform duration-400 ease-in-out group-hover:rotate-[135deg]">
                    <LineIcon name="plus" className="h-5 w-5" />
                  </span>
                </div>
              </div>

              <div className="px-3 pt-6 pb-4">
                <span className="text-text-dim text-[12px] tabular-nums">{item.phase}</span>
                <h3 className="text-h5 mt-3">
                  <HoverScribble>{item.title}</HoverScribble>
                </h3>
                <p className="mt-2 text-[15px]">{item.description}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-10 flex justify-center">
        <ArrowLink href="/roadmap" label="See the full roadmap" className="group" />
      </Reveal>
    </Section>
  );
}
