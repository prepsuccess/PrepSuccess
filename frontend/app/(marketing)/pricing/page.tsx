import type { Metadata } from "next";
import { Circled, DrawScope, SketchIcon } from "@/components/ui/Annotation";
import { Button } from "@/components/ui/Button";
import { MonoLabel } from "@/components/ui/MiniUI";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { PageHero } from "@/components/marketing/sections/PageHero";
import { FAQ } from "@/components/marketing/sections/FAQ";
import { CTA } from "@/components/marketing/sections/CTA";
import { faqs, pricing, type Plan } from "@/lib/content";

export const metadata: Metadata = {
  title: "Pricing — PrepSuccess",
  description:
    "PrepSuccess is free to use, and the AI coach is free for your first 4 months. No card details needed.",
};

function PlanCard({ plan }: { plan: Plan }) {
  const saving = plan.note.includes("save");
  return (
    <DrawScope className="group relative h-full">
      <article
        className={`card flex h-full flex-col p-6 ${plan.featured ? "outline-heading/80 outline-[1.5px] -outline-offset-[1.5px]" : ""}`}
      >
        <MonoLabel>{plan.name}</MonoLabel>
        <p className="text-heading mt-5 text-[44px] leading-none font-semibold tracking-[-0.045em]">
          {plan.id === "free" ? <Circled delay={0.4}>{plan.price}</Circled> : plan.price}
        </p>
        <p className="text-text-dim mt-2 text-[14px]">{plan.period}</p>
        <p
          className={`border-border mt-5 flex-1 border-t pt-4 text-[14px] ${saving ? "text-accent-ink font-medium" : "text-text"}`}
        >
          {plan.note}
        </p>
        <div className="mt-6">
          <Button
            href={`/signup?plan=${plan.id}`}
            label={plan.cta}
            size="sm"
            variant={plan.featured || plan.id === "free" ? "primary" : "secondary"}
          />
        </div>
      </article>
    </DrawScope>
  );
}

function Includes() {
  return (
    <DrawScope className="mt-16 flex flex-col items-center gap-6 text-center">
      <p className="font-marker text-accent -rotate-1 text-[22px]">what&apos;s included</p>
      <ul className="flex max-w-[900px] flex-wrap justify-center gap-x-8 gap-y-4">
        {pricing.includes.map((item, i) => {
          const delay = 0.3 + i * 0.3;
          return (
            <li key={item} className="flex items-center gap-2.5">
              <span className="relative h-6 w-6 flex-none">
                <SketchIcon
                  name="box"
                  delay={delay}
                  className="text-heading/60 absolute inset-0 h-6 w-6"
                />
                <SketchIcon
                  name="tick"
                  delay={delay + 0.25}
                  className="text-accent absolute -top-1 left-0.5 h-7 w-7"
                />
              </span>
              <span className="text-heading text-[15px]">{item}</span>
            </li>
          );
        })}
      </ul>
      <p className="text-text-dim text-[13px]">
        Mentor sessions are coming soon and will be priced separately.
      </p>
    </DrawScope>
  );
}

export default function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="pricing"
        title={
          <>
            Free to use.{" "}
            <Circled now delay={0.5}>
              No card
            </Circled>
            .
          </>
        }
        description="Everything in PrepSuccess is free, and the AI coach is free for your first 4 months. We'll tell you well before that ends if anything changes."
      />

      <Section>
        <div className="mx-auto max-w-[420px]">
          {pricing.plans.map((plan, i) => (
            <Reveal key={plan.id} offset={10} delay={0.08 * i} className="h-full">
              <PlanCard plan={plan} />
            </Reveal>
          ))}
        </div>
        <Includes />
      </Section>

      <FAQ title="Pricing, plainly" items={[...pricing.faqs, ...faqs.slice(1)]} />

      <CTA />
    </>
  );
}
