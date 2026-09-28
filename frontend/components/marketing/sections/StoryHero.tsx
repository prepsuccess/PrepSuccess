import { Annotation, Circled, Underlined } from "@/components/ui/Annotation";
import { PageHero, PageIndex } from "@/components/marketing/sections/PageHero";
import { story } from "@/lib/content";

export function StoryHero() {
  return (
    <PageHero
      eyebrow="our story"
      title={
        <>
          You{" "}
          <Underlined now delay={0.2}>
            prepared
          </Underlined>
          . Nobody told you where you{" "}
          <Circled now delay={0.7}>
            stood
          </Circled>
          .
        </>
      }
      description={story.hero.body}
      note={
        <Annotation
          now
          delay={2}
          arrow="down-left"
          tilt="rotate-[5deg]"
          label={"it starts in\nthird year"}
          className="-right-[6%] -bottom-28"
          labelClassName="pl-14"
          arrowClassName="h-[60px] w-[96px]"
        />
      }
    >
      <PageIndex
        label="Chapters"
        items={story.chapters.map((c, i) => ({ href: `#chapter-${i + 1}`, label: c.label }))}
      />
    </PageHero>
  );
}
