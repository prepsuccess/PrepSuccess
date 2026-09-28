import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { PreviewFrame } from "@/components/ui/PreviewFrame";
import { Chip, Line, MiniWindow } from "@/components/ui/MiniUI";
import { Reveal } from "@/components/motion/Reveal";
import { FocusReveal } from "@/components/motion/FocusReveal";
import { HoverScribble } from "@/components/ui/Annotation";
import { resources } from "@/lib/content";

function FeaturedPreview() {
  return (
    <MiniWindow title="Dynamic programming" meta="Resources" className="h-full">
      <Chip status="revision">Scored 32 · pass mark 40</Chip>
      <ul className="divide-border border-border mt-3 flex flex-col divide-y border-y">
        {resources.items.map((item) => (
          <li key={item.type} className="flex items-center justify-between py-2 text-[12px]">
            <span className="text-heading">{item.title}</span>
            <span className="text-text-dim text-[12px] tabular-nums">{item.type}</span>
          </li>
        ))}
      </ul>
    </MiniWindow>
  );
}

function Thumb({ index }: { index: number }) {
  return (
    <div className="bg-surface flex h-full flex-col justify-center gap-2 rounded-[10px] p-3 shadow-[var(--shadow-window)] transition-transform duration-700 ease-[var(--ease-out-cubic)] group-hover:-translate-y-1">
      <span className="bg-heading h-1.5 w-10" />
      <Line width="90%" />
      <Line width={index === 1 ? "60%" : "75%"} />
      {index === 2 ? (
        <span className="border-heading/40 mt-1 h-6 rounded-[4px] border border-dashed" />
      ) : (
        <Line width="45%" />
      )}
    </div>
  );
}

export function Resources() {
  const { featured, items } = resources;

  return (
    <Section>
      <SectionTitle title="A gap always comes with a fix" />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <Reveal offset={12} className="h-full">
          <article className="group card card-hover flex h-full flex-col p-3">
            <PreviewFrame tag={featured.type}>
              <FeaturedPreview />
            </PreviewFrame>
            <div className="flex flex-1 flex-col px-3 pt-6 pb-4">
              <span className="text-text-dim text-[12px] tabular-nums">
                {featured.meta[0]} · {featured.meta[1]}
              </span>
              <h3 className="text-h4 mt-3">
                <HoverScribble>{featured.title}</HoverScribble>
              </h3>
              <p className="mt-3 mb-8 flex-1">{featured.description}</p>
              <ArrowLink href="/signup" label="Find your gaps" className="self-start" />
            </div>
          </article>
        </Reveal>

        <div className="flex flex-col gap-5">
          {items.map((item, i) => (
            <Reveal key={item.type} offset={12} delay={0.1 * (i + 1)} className="flex-1">
              <article className="group card card-hover grid h-full grid-cols-1 items-center gap-6 p-3 pr-6 sm:grid-cols-[178px_1fr]">
                <div className="bg-surface-3 relative aspect-video h-full overflow-clip rounded-[10px] p-4 sm:aspect-auto sm:min-h-[140px]">
                  <Thumb index={i} />
                  <FocusReveal />
                </div>
                <div className="flex flex-col gap-2 px-3 pb-3 sm:px-0 sm:pb-0">
                  <span className="text-text-dim text-[12px] tabular-nums">{item.type}</span>
                  <h3 className="text-h5">
                    <HoverScribble>{item.title}</HoverScribble>
                  </h3>
                  <p>{item.description}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
