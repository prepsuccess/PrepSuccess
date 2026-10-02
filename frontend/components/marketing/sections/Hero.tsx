import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Annotation } from "@/components/ui/Annotation";
import { LineIcon } from "@/components/ui/LineIcon";
import { Reveal } from "@/components/motion/Reveal";
import { Marksheet } from "@/components/marketing/sections/Marksheet";
import { hero } from "@/lib/content";

/**
 * Left: who it's for, what it does, one action. Right: the result itself — a
 * sample readiness marksheet. One hand-drawn note on the page, pointing at the
 * subject that needs revision; everything else is plain.
 */
export function Hero() {
  return (
    <header className="relative pt-[120px] pb-8 sm:pt-[140px] lg:pt-[160px]">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,500px)] lg:gap-16">
          <div className="max-w-[620px]">
            <Reveal onLoad>
              <p className="text-accent-ink text-[15px] font-medium">{hero.eyebrow}</p>
            </Reveal>
            <Reveal onLoad delay={0.05}>
              <h1 className="text-heading mt-4 text-[clamp(2.4rem,1.55rem+3.1vw,4rem)] leading-[1.04] font-semibold tracking-[-0.035em] text-balance">
                {hero.title}
              </h1>
            </Reveal>
            <Reveal onLoad delay={0.15}>
              <p className="text-text mt-6 max-w-[54ch] text-[18px] leading-[1.6]">
                {hero.description}
              </p>
            </Reveal>

            <Reveal
              onLoad
              delay={0.25}
              className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4"
            >
              <Button href="/signup" label="Check my skills, free" />
              <span className="group">
                <ArrowLink href="/how-it-works" label="See how it works" className="min-h-11" />
              </span>
            </Reveal>

            <Reveal onLoad delay={0.35}>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
                {hero.facts.map((fact) => (
                  <li key={fact} className="text-text inline-flex items-center gap-2 text-[14px]">
                    <LineIcon name="check" className="text-success h-4 w-4" />
                    {fact}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <Reveal onLoad delay={0.2} className="relative">
            <Marksheet />
            {/* Points at the REVISE stamp on the SQL row. Only on wide screens, where the
                gutter beside the sheet has room for it. */}
            <div className="hidden min-[1400px]:block">
              <Annotation
                now
                delay={1.4}
                arrow="left"
                layout="label-right"
                tilt="-rotate-[3deg]"
                label={"start\nhere"}
                className="top-[300px] -right-[92px]"
                arrowClassName="h-[40px] w-[56px]"
              />
            </div>
          </Reveal>
        </div>
      </Container>
    </header>
  );
}
