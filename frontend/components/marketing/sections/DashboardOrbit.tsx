import { Panel } from "@/components/ui/Panel";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Mark } from "@/components/ui/Mark";
import { Chip } from "@/components/ui/MiniUI";
import { Annotation } from "@/components/ui/Annotation";
import { Reveal } from "@/components/motion/Reveal";
import { ScoreRing } from "@/components/motion/ScoreRing";
import { dashboardLeft, dashboardRight } from "@/lib/content";

type Item = { title: string; description: string };

function Column({ items, side }: { items: Item[]; side: "left" | "right" }) {
  const isLeft = side === "left";
  return (
    <div
      className={`flex flex-col gap-10 lg:my-auto lg:h-full lg:max-h-[435px] lg:justify-between ${
        isLeft ? "lg:items-end lg:text-right" : "lg:items-start lg:text-left"
      } items-center text-center`}
    >
      {items.map((item, i) => (
        <Reveal
          key={item.title}
          variant={isLeft ? "left" : "right"}
          delay={isLeft ? 0.1 * (i + 1) : 0.15 + 0.1 * i}
          className={`flex max-w-[290px] flex-col gap-3 ${i === 1 ? (isLeft ? "lg:mr-8" : "lg:ml-8") : ""}`}
        >
          <h3 className="text-h6">{item.title}</h3>
          <p>{item.description}</p>
        </Reveal>
      ))}
    </div>
  );
}

function Orbit() {
  const dots = [-60, 0, 60, 120, 180, 240];
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px]">
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="none"
          stroke="var(--color-border-strong)"
          strokeWidth="0.3"
          strokeDasharray="1.2 1.2"
        />
        {dots.map((deg) => {
          const rad = (deg * Math.PI) / 180;
          return (
            <circle
              key={deg}
              cx={50 + 48 * Math.cos(rad)}
              cy={50 + 48 * Math.sin(rad)}
              r="1.1"
              fill="var(--color-bg)"
              stroke="var(--color-text-dim)"
              strokeWidth="0.3"
            />
          );
        })}
      </svg>
      <Reveal
        variant="fade"
        delay={0.1}
        className="border-border-strong bg-surface absolute inset-[7%] flex flex-col items-center justify-center gap-5 overflow-clip rounded-full border"
      >
        <ScoreRing value={72} size={210} />
        <div className="flex flex-wrap justify-center gap-1.5 px-6">
          <Chip status="mastered">9 topics mastered</Chip>
          <Chip status="revision">3 need revision</Chip>
        </div>
      </Reveal>
      <Annotation
        delay={1.2}
        arrow="down-left"
        tilt="rotate-[6deg]"
        label={"that's you,\nhonestly"}
        className="-top-[2%] -right-[6%]"
        labelClassName="pl-12"
        arrowClassName="-mt-1 h-[58px] w-[88px]"
      />
    </div>
  );
}

export function DashboardOrbit() {
  return (
    <Panel className="mt-[60px] lg:mt-[120px]">
      <Section id="dashboard">
        <SectionTitle
          title={
            <>
              One dashboard that answers <Mark>where do I stand?</Mark>
            </>
          }
        />
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.86fr_1fr] lg:gap-0">
          <Column items={dashboardLeft} side="left" />
          <Orbit />
          <Column items={dashboardRight} side="right" />
        </div>
      </Section>
    </Panel>
  );
}
