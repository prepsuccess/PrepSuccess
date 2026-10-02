import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { Marquee } from "@/components/motion/Marquee";
import { topics } from "@/lib/content";
import { PencilAsterisk } from "@/components/ui/Annotation";

export function TopicMarquee() {
  return (
    <Section padding="100x100" className="overflow-clip">
      <div className="flex flex-col gap-8">
        <Reveal offset={15} className="text-center text-lg">
          Diagnoses the topics placement drives actually test
        </Reveal>
        <Marquee duration={30}>
          {topics.map((topic) => (
            <span
              key={topic}
              className="text-heading/45 mr-12 flex items-center gap-3 text-2xl font-medium tracking-[-0.03em] whitespace-nowrap"
            >
              <PencilAsterisk className="text-brand/80 h-4 w-4" />
              {topic}
            </span>
          ))}
        </Marquee>
      </div>
    </Section>
  );
}
