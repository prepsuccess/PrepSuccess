import { type CSSProperties } from "react";
import { Button } from "@/components/ui/Button";
import { Annotation, Circled } from "@/components/ui/Annotation";
import { LineIcon, type LineIconName } from "@/components/ui/LineIcon";
import { Reveal } from "@/components/motion/Reveal";
import { FocusReveal } from "@/components/motion/FocusReveal";
import { CountUp } from "@/components/motion/CountUp";
import { OnboardingChat } from "@/components/marketing/previews/OnboardingChat";
import { bento } from "@/lib/content";

// The bento lands ~0.5s after load; inner details fill in just after.
const BASE = 1.0;
const at = (seconds: number) => ({ "--d": `${BASE + seconds}s` }) as CSSProperties;

function CardHead({
  icon,
  title,
  meta,
  dark = false,
}: {
  icon: LineIconName;
  title: string;
  meta?: string;
  dark?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span
        className={`inline-flex items-center gap-2 text-[13px] font-medium ${dark ? "text-white" : "text-heading"}`}
      >
        <LineIcon name={icon} className={`h-4 w-4 ${dark ? "text-white/60" : "text-text-dim"}`} />
        {title}
      </span>
      {meta ? (
        <span className={`text-[12px] tabular-nums ${dark ? "text-white/45" : "text-text-dim"}`}>
          {meta}
        </span>
      ) : null}
    </div>
  );
}

function SkillsCard() {
  const { claims, threshold } = bento;
  return (
    <div className="card overflow-clip p-5">
      <CardHead icon="checklist" title="Skills verified" meta={`Pass mark ${threshold}`} />
      <ul className="mt-6 flex flex-col gap-5">
        {claims.map(({ skill, score }, i) => {
          const ok = score >= threshold;
          return (
            <li key={skill}>
              <div className="flex items-baseline justify-between text-[14px]">
                <span className="text-heading">
                  {skill}
                  <span className={`ml-2 text-[12px] ${ok ? "text-text-dim" : "text-accent-ink"}`}>
                    {ok ? "Mastered" : "Revise"}
                  </span>
                </span>
                <span className="text-heading tabular-nums">
                  {ok ? (
                    <CountUp value={score} delay={1.1 + 0.15 * i} />
                  ) : (
                    <Circled now delay={2}>
                      <CountUp value={score} delay={1.1 + 0.15 * i} />
                    </Circled>
                  )}
                </span>
              </div>
              <div className="bg-surface-3 relative mt-2 h-1 rounded-full">
                <div
                  className={`now h-full grow rounded-full ${ok ? "bg-heading" : "bg-heading/25"}`}
                  style={{ width: `${score}%`, ...at(0.15 * i) }}
                />
                <span
                  aria-hidden
                  className="bg-accent absolute -top-1 h-3 w-px"
                  style={{ left: `${threshold}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
      <FocusReveal />
    </div>
  );
}

function Sparkline({ values }: { values: readonly number[] }) {
  const w = 140;
  const h = 40;
  const min = Math.min(...values) - 4;
  const max = Math.max(...values) + 4;
  const pts = values.map(
    (v, i) => [(i / (values.length - 1)) * w, h - ((v - min) / (max - min)) * h] as const,
  );
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const [lx, ly] = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-10 w-[140px] overflow-visible" aria-hidden>
      <path
        d={d}
        pathLength={1}
        className="draw now"
        style={at(0.4)}
        fill="none"
        stroke="white"
        strokeOpacity="0.8"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle
        cx={lx}
        cy={ly}
        r="3.5"
        fill="var(--color-accent)"
        className="ink now"
        style={at(1.2)}
      />
    </svg>
  );
}

function ReadinessCard() {
  const gain = bento.trend[bento.trend.length - 1] - bento.trend[0];
  return (
    <div className="card bg-heading flex h-full flex-col justify-between gap-8 overflow-clip p-5 text-white">
      <CardHead icon="gauge" title="Readiness" meta={`+${gain} since first try`} dark />
      <div className="flex items-end justify-between gap-4">
        <p className="leading-none">
          <CountUp
            value={bento.overall}
            delay={1.3}
            className="text-[64px] font-semibold tracking-[-0.045em]"
          />
          <span className="ml-1 text-sm text-white/45 tabular-nums">/100</span>
        </p>
        <Sparkline values={bento.trend} />
      </div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-[14px] text-white/70">
          Technical, aptitude and soft skills in one number.
        </p>
        <Button href="#tracks" label="Explore" variant="inverse" size="sm" />
      </div>
    </div>
  );
}

function PricingCard() {
  return (
    <div className="card flex flex-col justify-between gap-6 p-5">
      <CardHead icon="receipt" title="Pricing" />
      <div>
        <p className="text-heading text-[56px] leading-none font-semibold tracking-[-0.045em]">
          ₹0
        </p>
        <p className="mt-3 max-w-[30ch] text-[14px]">
          First month free. Then from <span className="text-heading">₹67 a month</span> on the
          yearly plan.
        </p>
      </div>
      <div className="grid grid-cols-12 gap-1" aria-hidden>
        {Array.from({ length: 12 }, (_, i) => (
          <span
            key={i}
            className={`now h-1.5 grow rounded-full ${i === 0 ? "bg-accent" : "bg-[repeating-linear-gradient(135deg,var(--color-heading)_0_1px,transparent_1px_4px)]"}`}
            style={at(0.05 * i)}
          />
        ))}
      </div>
    </div>
  );
}

function RoundsCard() {
  const { rounds, currentRound } = bento;
  return (
    <div className="card flex flex-col gap-6 overflow-clip p-5">
      <CardHead
        icon="track"
        title="Placement drive"
        meta={`Round ${currentRound + 1} of ${rounds.length}`}
      />
      <div className="relative grid grid-cols-5 pb-6">
        <span aria-hidden className="bg-border-strong absolute inset-x-[10%] top-[15px] h-px" />
        <span
          aria-hidden
          className="now bg-heading absolute top-[15px] left-[10%] h-px grow"
          style={{ width: `${(currentRound / (rounds.length - 1)) * 80}%`, ...at(0.3) }}
        />
        {rounds.map(({ label, icon }, i) => {
          const state = i < currentRound ? "done" : i === currentRound ? "current" : "next";
          return (
            <div key={label} className="relative flex flex-col items-center">
              <span
                className={`relative z-10 grid h-[30px] w-[30px] place-items-center rounded-full border ${
                  state === "done"
                    ? "border-heading bg-heading text-white"
                    : state === "current"
                      ? "border-accent bg-surface text-heading"
                      : "border-border-strong bg-surface text-text-dim"
                }`}
              >
                <LineIcon name={icon} className="h-3.5 w-3.5" />
              </span>
              <span
                className={`absolute top-[38px] text-[11px] whitespace-nowrap ${state === "next" ? "text-text-dim" : "text-heading"}`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function HeroBento() {
  return (
    <Reveal
      onLoad
      delay={0.5}
      className="mt-[64px] grid gap-4 md:grid-cols-[1.03fr_1fr] lg:grid-cols-[1.03fr_1fr_1.09fr]"
    >
      <div className="flex flex-col gap-4">
        <SkillsCard />
        <ReadinessCard />
      </div>

      <div className="relative">
        <OnboardingChat />
        <Annotation
          now
          delay={3.4}
          arrow="down-left"
          layout="label-right"
          tilt="rotate-[3deg]"
          label={"the ai onboarding,\nlive"}
          className="-top-[62px] -right-[200px]"
          arrowClassName="h-[56px] w-[84px] translate-y-4"
        />
      </div>

      <div className="grid gap-4 md:col-span-2 md:grid-cols-2 lg:col-span-1 lg:grid-cols-1">
        <PricingCard />
        <RoundsCard />
      </div>
    </Reveal>
  );
}
