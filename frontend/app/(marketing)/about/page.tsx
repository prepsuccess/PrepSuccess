import type { Metadata } from "next";
import { Annotation, DrawScope, SketchIcon, Underlined } from "@/components/ui/Annotation";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Button } from "@/components/ui/Button";
import { Mark } from "@/components/ui/Mark";
import { Panel } from "@/components/ui/Panel";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { PageHero } from "@/components/marketing/sections/PageHero";
import { Pillars } from "@/components/marketing/sections/Pillars";
import { about, site } from "@/lib/content";

export const metadata: Metadata = {
  title: "About us — PrepSuccess",
  description:
    "PrepSuccess is built by a small team of engineers and designers. Here's why we started, and how to reach us.",
};

const mailto = (subject: string) => `mailto:${site.email}?subject=${encodeURIComponent(subject)}`;

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="about us"
        title={
          <>
            We&apos;re the PrepSuccess{" "}
            <Underlined now delay={0.6}>
              team
            </Underlined>
            .
          </>
        }
        description={about.description}
        note={
          <Annotation
            now
            delay={2}
            arrow="down-left"
            tilt="rotate-[5deg]"
            label={"say hi —\nwe reply"}
            className="-right-[6%] -bottom-24"
            labelClassName="pl-14"
            arrowClassName="h-[60px] w-[96px]"
          />
        }
      >
        <Reveal onLoad delay={0.5} className="mt-10 flex flex-wrap justify-center gap-4">
          <Button href={mailto("Hello PrepSuccess")} label="Email the team" />
          <Button href="/story" label="Read our story" variant="secondary" />
        </Reveal>
      </PageHero>

      <Section>
        <DrawScope className="relative mx-auto flex max-w-[820px] flex-col items-center text-center">
          <SketchIcon name="question" delay={0.2} className="text-accent h-14 w-14 -rotate-6" />
          <SplitHeading className="text-h2 mt-6">
            Most students prepare hard — and <Mark>still guess</Mark>.
          </SplitHeading>
          <Reveal delay={0.2} className="mt-5 max-w-[56ch]">
            <p className="text-[17px]">
              Without a placement cell, a mentor or anyone to compare with, it&apos;s hard to know
              if you&apos;re ready. We built PrepSuccess so you can find out before the interview
              does.
            </p>
          </Reveal>
          <Reveal delay={0.3} className="mt-8">
            <ArrowLink href="/story" label="Read the full story" className="group" />
          </Reveal>
        </DrawScope>
      </Section>

      <Panel>
        <Pillars
          padding="120x120"
          title="What we care about"
          description="Three things we won't trade away."
          items={about.values}
          sketches={["target", "heart", "box"]}
        />
      </Panel>

      <Section id="contact">
        <SectionTitle
          title="Get in touch"
          description="One inbox for everything. We read every message."
        />
        <Reveal offset={10} className="text-center">
          <a
            href={mailto("Hello PrepSuccess")}
            className="group text-heading inline-block text-[clamp(1.25rem,1rem+1.6vw,2.25rem)] font-semibold tracking-[-0.02em] break-all"
          >
            <Underlined delay={0.4}>{site.email}</Underlined>
          </a>
        </Reveal>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {about.contact.map((item, i) => (
            <Reveal key={item.title} offset={10} delay={0.1 * i} className="h-full">
              <a
                href={mailto(item.subject)}
                className="group card card-hover flex h-full flex-col p-6"
              >
                <h3 className="text-h5">{item.title}</h3>
                <p className="mt-2 flex-1">{item.description}</p>
                <span className="text-heading mt-6 text-[14px] font-medium">Write to us →</span>
              </a>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}
