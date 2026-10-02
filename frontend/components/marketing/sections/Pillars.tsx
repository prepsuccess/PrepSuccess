import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { DrawScope, HoverScribble, SketchIcon, type SketchName } from "@/components/ui/Annotation";
import { Reveal } from "@/components/motion/Reveal";
import { pillars, type Point } from "@/lib/content";

// 3 items sit in a row from `sm`; 4 need `lg` before they fit side by side.
const layouts = {
  sm: {
    grid: "sm:grid-cols-3",
    divider: "border-t border-border sm:border-t-0 sm:border-l",
    first: "sm:pl-0",
    pad: "sm:px-7",
  },
  lg: {
    grid: "lg:grid-cols-4",
    divider: "border-t border-border lg:border-t-0 lg:border-l",
    first: "lg:pl-0",
    pad: "lg:px-7",
  },
};

/** Numbered, ruled columns with a pencil doodle each. Defaults to the home page's three pillars. */
export function Pillars({
  title = "A diagnosis, not a generic quiz",
  description = "One AI agent runs the whole loop — it gets to know you, tests what you claim, and points every gap at a fix.",
  items = pillars,
  sketches = ["chat", "target", "book"],
  padding = "100x120",
}: {
  title?: string;
  description?: string;
  items?: readonly Point[];
  sketches?: SketchName[];
  padding?: "100x120" | "120x120";
}) {
  const layout = items.length >= 4 ? layouts.lg : layouts.sm;

  return (
    <Section padding={padding}>
      <SectionTitle title={title} description={description} />
      <DrawScope className={`border-heading grid border-t ${layout.grid}`}>
        {items.map((item, i) => (
          <Reveal key={item.title} offset={15} delay={0.1 * (i + 1)} className="h-full">
            <article
              className={`group relative h-full pt-7 pb-2 ${layout.pad} ${i ? layout.divider : ""} ${i === 0 ? layout.first : ""}`}
            >
              <span
                aria-hidden
                className="bg-brand absolute -top-px left-0 h-[3px] w-full origin-left scale-x-0 transition-transform duration-500 ease-[var(--ease-out-cubic)] group-hover:scale-x-100"
              />
              <div className="flex items-start justify-between">
                <span className="text-text-dim text-[12px] tabular-nums">
                  {String(i + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
                </span>
                <SketchIcon
                  name={sketches[i % sketches.length]}
                  delay={0.4 + 0.3 * i}
                  className="text-heading/75 h-14 w-14 -rotate-3 transition-transform duration-500 ease-[var(--ease-out-cubic)] group-hover:rotate-3"
                />
              </div>
              <h3 className="text-h5 mt-6 lg:mt-10">
                <HoverScribble>{item.title}</HoverScribble>
              </h3>
              <p className="mt-3 max-w-[34ch]">{item.description}</p>
            </article>
          </Reveal>
        ))}
      </DrawScope>
    </Section>
  );
}
