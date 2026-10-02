import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Panel } from "@/components/ui/Panel";
import { Section } from "@/components/ui/Section";
import { LineIcon } from "@/components/ui/LineIcon";
import { Reveal } from "@/components/motion/Reveal";
import { Pillars } from "@/components/marketing/sections/Pillars";
import { CTA } from "@/components/marketing/sections/CTA";
import { RoadmapGlance } from "@/components/marketing/roadmap/RoadmapGlance";
import { RoadmapNav } from "@/components/marketing/roadmap/RoadmapNav";
import { RoadmapPhaseSection } from "@/components/marketing/roadmap/RoadmapPhaseSection";
import { StatusLabel } from "@/components/marketing/roadmap/StatusLabel";
import { audiences, roadmapItems, site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Roadmap — PrepSuccess",
  description:
    "What's ready on PrepSuccess, what's in progress, and what comes next: interview prep, 1:1 mentors, resume feedback and jobs.",
};

export default function RoadmapPage() {
  return (
    <>
      <Panel flushTop>
        <header className="pt-[120px] pb-12 sm:pt-[140px] lg:pt-[160px] lg:pb-16">
          <Container>
            <div className="max-w-[720px]">
              <Reveal onLoad>
                <p className="text-brand-ink text-[15px] font-medium">Roadmap</p>
              </Reveal>
              <Reveal onLoad delay={0.05}>
                <h1 className="text-heading mt-4 text-[clamp(2.3rem,1.6rem+2.6vw,3.6rem)] leading-[1.06] font-semibold tracking-[-0.035em] text-balance">
                  What we&apos;re building, in the order we&apos;re building it.
                </h1>
              </Reveal>
              <Reveal onLoad delay={0.15}>
                <p className="text-text mt-5 max-w-[60ch] text-[18px] leading-[1.6]">
                  PrepSuccess launches for college students in November 2026. Every phase after that
                  builds on the same readiness results, so each one makes the next more useful.
                </p>
              </Reveal>
              <Reveal onLoad delay={0.25}>
                <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2" aria-label="Status key">
                  <li>
                    <StatusLabel status="ready" />
                  </li>
                  <li>
                    <StatusLabel status="building" />
                  </li>
                  <li>
                    <StatusLabel status="planned" />
                  </li>
                </ul>
              </Reveal>
            </div>

            <Reveal onLoad delay={0.3}>
              <RoadmapGlance phases={roadmapItems} />
            </Reveal>
          </Container>
        </header>
      </Panel>

      <Section padding="100x100">
        <div className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
          <aside className="hidden lg:block">
            <RoadmapNav phases={roadmapItems} />
          </aside>
          <div>
            {roadmapItems.map((phase) => (
              <RoadmapPhaseSection key={phase.id} phase={phase} />
            ))}

            <div className="border-border mt-4 flex max-w-[640px] flex-col gap-4 rounded-[14px] border p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-heading text-[16px] font-semibold">
                  Missing something you need?
                </p>
                <p className="text-text mt-1 text-[15px]">
                  Tell us what would help you most. We read every email.
                </p>
              </div>
              <a
                href={`mailto:${site.email}?subject=${encodeURIComponent("Roadmap idea")}`}
                className="text-heading border-border-strong hover:border-heading inline-flex min-h-11 flex-none items-center gap-2 rounded-full border px-5 text-[15px] font-medium transition-colors"
              >
                <LineIcon name="send" className="h-4 w-4" />
                Email us
              </a>
            </div>
          </div>
        </div>
      </Section>

      <Panel>
        <Pillars
          padding="120x120"
          title="Who it's for"
          description="Built for college students first. Freshers and working professionals join in Phase 4."
          items={audiences}
          sketches={["book", "target", "heart"]}
        />
      </Panel>

      <CTA />
    </>
  );
}
