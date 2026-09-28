import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Button } from "@/components/ui/Button";
import { Annotation, HoverScribble } from "@/components/ui/Annotation";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { PreviewFrame } from "@/components/ui/PreviewFrame";
import { Reveal } from "@/components/motion/Reveal";
import { TrackPreview } from "@/components/marketing/previews/TrackPreview";
import { tracks } from "@/lib/content";

export function Tracks() {
  return (
    <Section id="tracks" padding="120x0">
      <SectionTitle
        align="split"
        title="Every skill you claim, tested properly"
        description="Tracks follow the three axes placements are decided on — technical, aptitude and soft skills — each diagnosed topic by topic."
        action={<Button href="/signup" label="Start assessing" />}
        note={
          <Annotation
            arrow="right"
            layout="label-left"
            tilt="-rotate-[3deg]"
            label={"start with any\nskill you claim"}
            className="right-[220px] bottom-[2px]"
            arrowClassName="h-[50px] w-[92px]"
          />
        }
      />

      <div className="mt-[60px] grid gap-5 md:grid-cols-2">
        {tracks.map((track, i) => (
          <Reveal key={track.title} offset={12} delay={0.1 * (i % 2)} className="h-full">
            <article className="group card card-hover flex h-full flex-col p-3">
              <PreviewFrame tag={track.category}>
                <TrackPreview kind={track.preview} />
              </PreviewFrame>

              <div className="flex flex-1 flex-col px-3 pt-6 pb-4">
                <span className="text-text-dim text-[12px] tabular-nums">
                  {track.modes[0]} · {track.modes[1]}
                </span>
                <h3 className="text-h4 mt-3">
                  <HoverScribble>{track.title}</HoverScribble>
                </h3>
                <p className="mt-3 mb-8 flex-1">{track.description}</p>
                <ArrowLink href="/signup" label="Start this track" className="self-start" />
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-10 flex justify-center">
        <ArrowLink href="/skill-tracks" label="Explore every track and topic" className="group" />
      </Reveal>
    </Section>
  );
}
