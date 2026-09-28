import type { ReactNode } from "react";
import { Annotation, Circled } from "@/components/ui/Annotation";
import { Taped } from "@/components/ui/Taped";
import { MiniWindow, MonoLabel, StatusGlyph } from "@/components/ui/MiniUI";
import { LineIcon, type LineIconName } from "@/components/ui/LineIcon";
import { type StoryCard } from "@/lib/content";

const ROLL = "21BCA023";

function PrepCard() {
  const rows: { icon: LineIconName; label: string; meta: string }[] = [
    { icon: "code", label: "DSA sheet (from a senior)", meta: "212 / 450" },
    { icon: "aptitude", label: "Aptitude tricks playlist", meta: "ep 14 / 60" },
    { icon: "resume", label: "resume_final_v3.docx", meta: "edited 2d ago" },
    { icon: "chat", label: "Communication course", meta: "not started" },
  ];
  return (
    <Taped
      tilt="rotate-[1.5deg]"
      note={
        <Annotation
          arrow="down-left"
          tilt="rotate-[4deg]"
          label={"three plans.\nzero picture."}
          className="-top-24 -right-4"
          labelClassName="pl-12"
          arrowClassName="h-[56px] w-[84px]"
        />
      }
    >
      <MiniWindow title="Placement prep" meta="Notes">
        <ul className="divide-border flex flex-col divide-y">
          {rows.map((row) => (
            <li key={row.label} className="flex items-center gap-3 py-3 text-[13px]">
              <LineIcon name={row.icon} className="text-text-dim h-4 w-4 flex-none" />
              <span className="text-heading flex-1 truncate">{row.label}</span>
              <span className="text-text-dim flex-none font-mono text-[11px]">{row.meta}</span>
            </li>
          ))}
        </ul>
        <p className="border-border-strong text-text-dim mt-3 border-t border-dashed pt-3 text-[12px]">
          Am I ready? — ?
        </p>
      </MiniWindow>
    </Taped>
  );
}

function ApplicationCard() {
  const fields = [
    ["Roll no.", ROLL],
    ["Branch", "BCA"],
    ["CGPA", "7.8"],
    ["Backlogs", "0"],
  ];
  return (
    <Taped
      tilt="-rotate-[1.5deg]"
      note={
        <Annotation
          arrow="down-right"
          tilt="-rotate-[4deg]"
          label={"asks for marks.\nnever for skills."}
          className="-top-24 left-0"
          arrowClassName="ml-24 h-[56px] w-[84px]"
        />
      }
    >
      <MiniWindow title="Campus placement portal" meta="Drive 2026">
        <MonoLabel>Software Engineer Trainee · Application</MonoLabel>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
          {fields.map(([key, value]) => (
            <div key={key}>
              <dt className="text-text-dim text-[11px]">{key}</dt>
              <dd className="border-border bg-bg text-heading mt-1 rounded-[6px] border px-2.5 py-1.5 font-mono text-[12px]">
                {value}
              </dd>
            </div>
          ))}
        </dl>
        <div className="border-border mt-4 flex items-center justify-between gap-3 border-t pt-3">
          <span className="text-heading inline-flex items-center gap-1.5 text-[12px] font-medium">
            <LineIcon name="check" className="h-3.5 w-3.5" /> Application submitted
          </span>
          <MonoLabel>Awaiting shortlist</MonoLabel>
        </div>
      </MiniWindow>
    </Taped>
  );
}

function ShortlistCard() {
  const rows = ["21BCA014", "21BCA017", "21BCA019", "21BCA027", "21BCA031", "21BCA036"];
  return (
    <Taped
      tilt="rotate-[1deg]"
      note={
        <Annotation
          arrow="down-left"
          tilt="rotate-[5deg]"
          label={"not on it."}
          className="-top-20 -right-6"
          labelClassName="pl-14"
          arrowClassName="h-[56px] w-[84px]"
        />
      }
    >
      <MiniWindow title="shortlist_round1.pdf" meta="Page 1 / 3">
        <div className="border-border-strong bg-bg flex items-center gap-2 rounded-[6px] border px-2.5 py-1.5 text-[12px]">
          <span className="text-text-dim">Find</span>
          <span className="text-heading flex-1 font-mono">{ROLL}</span>
          <span className="text-heading font-mono text-[11px]">
            <Circled delay={0.5}>0 of 0</Circled>
          </span>
        </div>
        <p className="text-heading mt-4 text-center text-[11px] font-semibold tracking-[0.08em] uppercase">
          Shortlisted for technical round
        </p>
        <table className="mt-3 w-full text-left text-[12px]">
          <thead>
            <tr className="border-heading/70 border-y">
              <th className="text-heading py-1.5 font-medium">S.No</th>
              <th className="text-heading py-1.5 font-medium">Roll no.</th>
              <th className="text-heading py-1.5 text-right font-medium">Branch</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((roll, i) => (
              <tr key={roll} className="border-border border-b">
                <td className="text-text-dim py-1.5 font-mono">{i + 1}</td>
                <td className="text-heading py-1.5 font-mono">{roll}</td>
                <td className="text-text py-1.5 text-right">BCA</td>
              </tr>
            ))}
          </tbody>
        </table>
      </MiniWindow>
    </Taped>
  );
}

function ResultCard() {
  const rows = [
    ["Role", "Software Engineer Trainee"],
    ["Round", "Technical interview"],
  ];
  return (
    <div className="relative pt-16">
      <div
        aria-hidden
        className="card absolute inset-x-8 top-0 -rotate-[3deg] px-4 py-3 opacity-80 transition-transform duration-700 ease-[var(--ease-out-cubic)] sm:inset-x-12"
      >
        <div className="flex items-center justify-between">
          <MonoLabel>Mail · Placement cell</MonoLabel>
          <MonoLabel>Mon</MonoLabel>
        </div>
        <p className="text-heading mt-1.5 text-[13px] font-medium">
          Interview invitation — technical round
        </p>
      </div>
      <Taped
        tilt="-rotate-[1deg]"
        note={
          <Annotation
            arrow="up-right"
            layout="label-below"
            tilt="-rotate-[3deg]"
            label={"but… why?"}
            className="-bottom-24 left-2"
            labelClassName="pl-2"
            arrowClassName="h-[52px] w-[80px]"
          />
        }
      >
        <MiniWindow title="Application status" meta="Updated Wed">
          <dl className="divide-border flex flex-col divide-y text-[13px]">
            {rows.map(([key, value]) => (
              <div key={key} className="flex justify-between gap-4 py-2.5">
                <dt className="text-text-dim">{key}</dt>
                <dd className="text-heading text-right">{value}</dd>
              </div>
            ))}
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-text-dim">Status</dt>
              <dd className="text-heading inline-flex items-center gap-2 font-semibold">
                <StatusGlyph status="revision" /> Not selected
              </dd>
            </div>
            <div className="py-2.5">
              <dt className="text-text-dim">Feedback</dt>
              <dd className="border-border-strong bg-bg mt-2 h-12 rounded-[6px] border border-dashed" />
            </div>
          </dl>
        </MiniWindow>
      </Taped>
    </div>
  );
}

function ReadyCard() {
  const rows: { topic: string; state: string; ok: boolean }[] = [
    { topic: "Data structures", state: "Mastered", ok: true },
    { topic: "JavaScript", state: "Mastered", ok: true },
    { topic: "SQL joins", state: "Revised · checked again", ok: true },
    { topic: "Aptitude", state: "Mastered", ok: true },
    { topic: "Communication", state: "Revise this week", ok: false },
  ];
  return (
    <Taped
      tilt="rotate-[1.5deg]"
      note={
        <Annotation
          arrow="down-left"
          tilt="rotate-[4deg]"
          label={"no more\nguessing."}
          className="-top-24 -right-4"
          labelClassName="pl-12"
          arrowClassName="h-[56px] w-[84px]"
        />
      }
    >
      <MiniWindow title="Before the next drive" meta="Your checklist">
        <ul className="divide-border flex flex-col divide-y">
          {rows.map((row) => (
            <li key={row.topic} className="flex items-center gap-3 py-3 text-[13px]">
              <StatusGlyph status={row.ok ? "mastered" : "revision"} />
              <span className="text-heading flex-1">{row.topic}</span>
              <span
                className={`text-[12px] ${row.ok ? "text-text-dim" : "text-accent-ink font-medium"}`}
              >
                {row.state}
              </span>
            </li>
          ))}
        </ul>
      </MiniWindow>
    </Taped>
  );
}

const cards: Record<StoryCard, () => ReactNode> = {
  prep: PrepCard,
  application: ApplicationCard,
  shortlist: ShortlistCard,
  result: ResultCard,
  ready: ReadyCard,
};

export function StoryScreen({ card }: { card: StoryCard }) {
  const Card = cards[card];
  return <Card />;
}
