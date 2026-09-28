import { Panel } from "@/components/ui/Panel";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Mark } from "@/components/ui/Mark";
import { DrawScope, SketchIcon } from "@/components/ui/Annotation";
import { AccordionItem } from "@/components/ui/Accordion";
import { MiniWindow } from "@/components/ui/MiniUI";
import { Reveal } from "@/components/motion/Reveal";
import { FocusReveal } from "@/components/motion/FocusReveal";
import { faqs } from "@/lib/content";

const agentBubble =
  "max-w-[90%] self-start rounded-[12px_12px_12px_3px] bg-surface-3 px-3.5 py-2.5 text-[13px] text-heading";

export function AskVisual() {
  return (
    <div className="card relative overflow-clip p-5">
      <MiniWindow title="Ask the agent" meta="JavaScript" className="h-full">
        <div className="flex h-full flex-col justify-end gap-2.5">
          <p className="bg-heading max-w-[85%] self-end rounded-[12px_12px_3px_12px] px-3.5 py-2.5 text-[13px] text-white">
            Why is the event loop marked for revision?
          </p>
          <p className={agentBubble}>
            You scored 31, <Mark>under the pass mark of 40</Mark>. Two answers mixed up the
            microtask and macrotask queues.
          </p>
          <p className={agentBubble}>
            I&apos;ve added a worked example. Try it again when you&apos;re ready.
          </p>
        </div>
      </MiniWindow>
      <FocusReveal />
    </div>
  );
}

export function FAQ({
  items = faqs,
  title = "Answers, plainly",
}: {
  items?: { question: string; answer: string }[];
  title?: string;
}) {
  return (
    <Panel>
      <Section id="faq">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <div>
            <div className="lg:sticky lg:top-24">
              <SectionTitle
                align="split"
                title={title}
                note={
                  <DrawScope className="pointer-events-none absolute -top-8 right-[6%] hidden lg:block">
                    <SketchIcon
                      name="question"
                      delay={0.6}
                      className="text-accent h-16 w-16 rotate-12"
                    />
                  </DrawScope>
                }
              />
              <Reveal className="mt-10">
                <AskVisual />
              </Reveal>
            </div>
          </div>
          <div className="border-heading border-t">
            {items.map((faq, i) => (
              <Reveal key={faq.question} delay={0.1 + 0.08 * i}>
                <AccordionItem index={i} question={faq.question} answer={faq.answer} />
              </Reveal>
            ))}
          </div>
        </div>
      </Section>
    </Panel>
  );
}
