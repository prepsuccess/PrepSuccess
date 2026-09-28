"use client";

import { useEffect, useState } from "react";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Annotation } from "@/components/ui/Annotation";
import { Reveal } from "@/components/motion/Reveal";
import { LoopVisual } from "@/components/marketing/previews/LoopVisual";
import { loopSteps } from "@/lib/content";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

const ADVANCE_MS = 6000;

export function LoopWalkthrough() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (paused || reduced) return;
    const timer = window.setTimeout(() => setActive((a) => (a + 1) % loopSteps.length), ADVANCE_MS);
    return () => window.clearTimeout(timer);
  }, [active, paused, reduced]);

  return (
    <Section id="how-it-works">
      <SectionTitle
        title="Four steps to an honest answer"
        description="From signup to a dashboard that knows what you've mastered and what to revise — without a single static form or fixed quiz."
        note={
          <Annotation
            arrow="down-left"
            tilt="-rotate-[4deg]"
            label={"auto-plays.\nhover to pause"}
            className="top-[52%] -left-[34%]"
            labelClassName="pl-12"
            arrowClassName="h-[64px] w-[96px]"
          />
        }
      />

      <Reveal offset={15} delay={0.2}>
        <div
          className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <ol
            className="border-heading flex flex-col border-t"
            role="tablist"
            aria-label="How PrepSuccess works"
          >
            {loopSteps.map((step, i) => {
              const isActive = i === active;
              return (
                <li key={step.step} role="presentation" className="border-border relative border-b">
                  <button
                    type="button"
                    role="tab"
                    id={`loop-tab-${i}`}
                    aria-selected={isActive}
                    aria-controls="loop-visual"
                    onClick={() => setActive(i)}
                    className="group flex w-full cursor-pointer items-baseline gap-5 py-6 text-left"
                  >
                    <span
                      className={`w-6 flex-none font-mono text-[11px] transition-colors ${isActive ? "text-accent" : "text-text-dim"}`}
                    >
                      {step.step}
                    </span>
                    <span className="flex-1">
                      <span
                        className={`text-h5 block font-semibold tracking-[-0.022em] transition-colors duration-500 ${
                          isActive ? "text-heading" : "text-heading/35 group-hover:text-heading/70"
                        }`}
                      >
                        {step.title}
                      </span>
                      <span
                        className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[var(--ease-out-cubic)] ${
                          isActive ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <span className="overflow-hidden">
                          <span className="block max-w-[46ch] pt-3">{step.description}</span>
                          <span className="border-heading text-heading mt-4 inline-flex border-l-2 pl-3 text-sm font-medium">
                            {step.detail}
                          </span>
                        </span>
                      </span>
                    </span>
                  </button>
                  {isActive && !reduced ? (
                    <span
                      key={active}
                      aria-hidden
                      className="bg-accent absolute -bottom-px left-0 h-[2px] w-full origin-left"
                      style={{
                        animation: `progress ${ADVANCE_MS}ms linear both`,
                        animationPlayState: paused ? "paused" : "running",
                      }}
                    />
                  ) : null}
                </li>
              );
            })}
          </ol>

          <div
            id="loop-visual"
            role="tabpanel"
            aria-labelledby={`loop-tab-${active}`}
            className="bg-surface-3 relative min-h-[380px] overflow-clip rounded-[var(--radius-panel)] lg:min-h-[480px]"
          >
            <span className="text-text-dim absolute top-4 left-6 z-10 font-mono text-[10px] tracking-[0.12em] uppercase">
              Step {loopSteps[active].step} · {loopSteps[active].label}
            </span>
            {loopSteps.map((step, i) => {
              const isActive = i === active;
              return (
                <div
                  key={step.step}
                  aria-hidden={!isActive}
                  className={`absolute inset-x-6 top-12 -bottom-3 transition-[opacity,translate,filter] duration-700 ease-[var(--ease-out-cubic)] sm:inset-x-10 ${
                    isActive
                      ? "blur-0 translate-y-0 opacity-100"
                      : "pointer-events-none translate-y-4 opacity-0 blur-[6px]"
                  }`}
                >
                  <LoopVisual index={i} />
                </div>
              );
            })}
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
