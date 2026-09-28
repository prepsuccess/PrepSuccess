import { Panel } from "@/components/ui/Panel";
import { Hero } from "@/components/marketing/sections/Hero";
import { TopicMarquee } from "@/components/marketing/sections/TopicMarquee";
import { Pillars } from "@/components/marketing/sections/Pillars";
import { Tracks } from "@/components/marketing/sections/Tracks";
import { DashboardOrbit } from "@/components/marketing/sections/DashboardOrbit";
import { LoopWalkthrough } from "@/components/marketing/sections/LoopWalkthrough";
import { Roadmap } from "@/components/marketing/sections/Roadmap";
import { FAQ } from "@/components/marketing/sections/FAQ";
import { Resources } from "@/components/marketing/sections/Resources";
import { CTA } from "@/components/marketing/sections/CTA";

export default function Home() {
  return (
    <>
      <Panel flushTop>
        <Hero />
        <TopicMarquee />
        <Pillars />
      </Panel>
      <Tracks />
      <DashboardOrbit />
      <LoopWalkthrough />
      <Roadmap />
      <FAQ />
      <Resources />
      <CTA />
    </>
  );
}
