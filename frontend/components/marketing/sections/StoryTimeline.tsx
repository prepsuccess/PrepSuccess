import { Timeline } from "@/components/marketing/sections/Timeline";
import { StoryScreen } from "@/components/marketing/previews/StoryCards";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { story } from "@/lib/content";

type Chapter = (typeof story.chapters)[number];

export function StoryTimeline({ chapters, start }: { chapters: Chapter[]; start: number }) {
  return (
    <Timeline
      offset={start}
      items={chapters.map((chapter, i) => {
        const n = String(start + i + 1).padStart(2, "0");
        return {
          id: `chapter-${start + i + 1}`,
          when: chapter.when,
          eyebrow: `Chapter ${n} · ${chapter.label}`,
          title: chapter.title,
          body: chapter.body,
          visual: <StoryScreen card={chapter.card} />,
          extra:
            chapter.card === "ready" ? (
              <ArrowLink href="/how-it-works" label="See how PrepSuccess works" className="group" />
            ) : undefined,
        };
      })}
    />
  );
}
