import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { LineIcon, type LineIconName } from "@/components/ui/LineIcon";
import { Reveal } from "@/components/motion/Reveal";
import { skillCheck, tracks, type TestMethod } from "@/lib/content";

const METHODS: Record<TestMethod, { label: string; icon: LineIconName }> = {
  questions: { label: "Adaptive questions", icon: "checklist" },
  task: { label: "Hands-on task", icon: "code" },
  written: { label: "Written answer", icon: "chat" },
};

/** One skill walked through the check, step by step, ending in its mark. */
function SkillCheckExample() {
  const { skill, steps, marks, passMark } = skillCheck;
  const mastered = marks >= passMark;
  return (
    <div className="card p-6 sm:p-7">
      <h3 className="text-text text-[14px] font-normal">
        How a skill gets checked · <span className="text-heading font-medium">{skill}</span>
      </h3>
      <ol className="mt-6">
        {steps.map((step, i) => (
          <li key={step.title} className="relative flex gap-4 pb-6 last:pb-0">
            {/* The connecting rule makes the four steps read as one flow. */}
            {i < steps.length - 1 ? (
              <span aria-hidden className="bg-border absolute top-8 bottom-0 left-[13px] w-px" />
            ) : null}
            <span className="border-heading text-heading relative grid h-7 w-7 flex-none place-items-center rounded-full border bg-white text-[13px] font-medium tabular-nums">
              {i + 1}
            </span>
            <div className="pt-0.5">
              <h4 className="text-heading text-[16px] font-semibold">{step.title}</h4>
              <p className="text-text mt-1 text-[15px] leading-[1.6]">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="border-heading/70 mt-6 flex items-center justify-between gap-4 border-t pt-4">
        <span className="text-heading text-[15px]">{skill}</span>
        <span className="flex items-center gap-4">
          <span className="text-heading font-mono text-[15px] tabular-nums">
            {marks}
            <span className="text-text"> / 100</span>
          </span>
          <span className="text-success inline-flex items-center gap-1.5 text-[14px] font-medium">
            <LineIcon name="check" className="h-4 w-4" />
            {mastered ? "Mastered" : "Revise"}
          </span>
        </span>
      </div>
      <p className="text-text mt-2 text-[13px]">Example result · pass mark {passMark}</p>
    </div>
  );
}

export function Tracks() {
  return (
    <Section id="tracks" padding="120x0">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-16">
        <div className="max-w-[640px]">
          <h2 className="text-h2 text-heading font-semibold tracking-[-0.035em]">
            Every skill you claim, tested properly
          </h2>
          <p className="text-text mt-5 text-[18px] leading-[1.6]">
            Not one blended mock-test score. Each skill is checked on its own, with the kind of test
            that suits it, and marked against a pass mark of {skillCheck.passMark}.
          </p>
        </div>
        <Button href="/signup" label="Check my skills, free" className="self-start lg:self-end" />
      </div>

      <div className="mt-12 grid items-start gap-6 lg:mt-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-8">
        <Reveal offset={12}>
          <SkillCheckExample />
        </Reveal>

        <Reveal offset={12} delay={0.1}>
          <section aria-labelledby="tracks-list-title" className="card p-6 sm:p-7">
            <h3 id="tracks-list-title" className="text-text text-[14px] font-normal">
              What you can get checked on
            </h3>
            <ul className="divide-border mt-2 divide-y">
              {tracks.map((track) => (
                <li key={track.title} className="py-5 last:pb-0">
                  <p className="text-text text-[13px]">{track.category}</p>
                  <h4 className="text-heading mt-1 text-[17px] font-semibold">{track.title}</h4>
                  <p className="text-text mt-1.5 text-[15px]">{track.topics.join(" · ")}</p>
                  <ul className="mt-3 flex flex-wrap gap-2" aria-label="How it's tested">
                    {track.methods.map((method) => (
                      <li
                        key={method}
                        className="border-border text-heading inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[13px]"
                      >
                        <LineIcon name={METHODS[method].icon} className="text-text h-3.5 w-3.5" />
                        {METHODS[method].label}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </section>
        </Reveal>
      </div>

      <div className="mt-10 flex justify-center">
        <span className="group">
          <ArrowLink
            href="/skill-tracks"
            label="Explore every track and topic"
            className="min-h-11"
          />
        </span>
      </div>
    </Section>
  );
}
