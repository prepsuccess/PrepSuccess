import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Annotation, Circled, Sparkle, Underlined } from "@/components/ui/Annotation";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { HeroBento } from "@/components/marketing/sections/HeroBento";
import { Magnetic } from "@/components/motion/Magnetic";
import { hero } from "@/lib/content";

export function Hero() {
  return (
    <header className="relative pt-[140px] sm:pt-[160px] lg:pt-[190px]">
      <Container>
        <div className="relative mx-auto flex max-w-[820px] flex-col items-center text-center">
          <SplitHeading as="h1" onLoad className="text-h1 mb-6">
            Know where you{" "}
            <Circled now delay={0.1}>
              stand
            </Circled>
            . Know what&apos;s{" "}
            <Underlined now delay={0.6}>
              next
            </Underlined>
            .
          </SplitHeading>
          <Sparkle
            now
            delay={2.6}
            className="-top-7 left-[2%] hidden h-10 w-10 -rotate-12 lg:block"
          />

          <Reveal onLoad delay={0.3} className="mb-10 max-w-[560px]">
            <p className="text-[17px]">{hero.description}</p>
          </Reveal>

          <Reveal onLoad delay={0.4} className="flex flex-wrap items-center justify-center gap-4">
            <Magnetic>
              <Button href="/signup" label="Get started free" />
            </Magnetic>
            <Magnetic strength={0.2}>
              <Button href="/how-it-works" label="See how it works" variant="secondary" />
            </Magnetic>
          </Reveal>

          <Annotation
            now
            delay={2.2}
            arrow="down-left"
            tilt="rotate-[5deg]"
            label={"your real level,\nnot a guess"}
            className="-top-[32px] -right-[19%]"
            arrowClassName="-ml-20 h-[64px] w-[120px]"
          />
          <Annotation
            now
            delay={2.8}
            arrow="right"
            layout="label-left"
            tilt="-rotate-[4deg]"
            label={"one chat.\nno forms."}
            className="bottom-[-2px] -left-[5%]"
            arrowClassName="h-[56px] w-[120px]"
          />
        </div>

        <HeroBento />
      </Container>
    </header>
  );
}
