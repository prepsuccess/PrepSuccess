import type { Metadata } from "next";
import { StoryHero } from "@/components/marketing/sections/StoryHero";
import { StoryTimeline } from "@/components/marketing/sections/StoryTimeline";
import { StoryPivot } from "@/components/marketing/sections/StoryPivot";
import { CTA } from "@/components/marketing/sections/CTA";
import { story } from "@/lib/content";

export const metadata: Metadata = {
  title: "Our story — PrepSuccess",
  description:
    "One placement season, told screen by screen: why students prepare hard and still guess — and how PrepSuccess tells them where they stand.",
};

export default function StoryPage() {
  return (
    <>
      <StoryHero />
      <StoryTimeline chapters={story.chapters.slice(0, 4)} start={0} />
      <StoryPivot />
      <StoryTimeline chapters={story.chapters.slice(4)} start={4} />
      <CTA />
    </>
  );
}
