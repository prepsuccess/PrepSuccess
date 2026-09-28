import { Annotation, Circled } from "@/components/ui/Annotation";
import { Taped } from "@/components/ui/Taped";
import { Bar, Chip, MiniWindow, MonoLabel, StatusGlyph } from "@/components/ui/MiniUI";
import { LineIcon, type LineIconName } from "@/components/ui/LineIcon";
import { PreviewFrame } from "@/components/ui/PreviewFrame";
import { TrackPreview } from "@/components/marketing/previews/TrackPreview";
import { RoadmapPreview } from "@/components/marketing/previews/RoadmapPreview";
import { type RoadmapVisual, type TrackPreview as TrackKind } from "@/lib/content";

/* ── How it works ─────────────────────────────────────────── */

/** What the onboarding chat leaves behind: a structured profile. */
export function ProfileCard() {
  const lines: [string, string][] = [
    ["year", '"Final"'],
    ["branch", '"BCA"'],
    ["skills_claimed", '["HTML", "CSS", "JavaScript", "SQL"]'],
    ["experience", '"1 college project"'],
    ["interests", '["Web development"]'],
    ["goal", '"Software engineer"'],
  ];
  return (
    <Taped
      tilt="rotate-[1.5deg]"
      note={
        <Annotation
          arrow="down-left"
          tilt="rotate-[4deg]"
          label={"your chat,\nsaved as a profile"}
          className="-top-24 -right-4"
          labelClassName="pl-12"
          arrowClassName="h-[56px] w-[84px]"
        />
      }
    >
      <MiniWindow title="profile.json" meta="From your chat">
        <pre className="text-text overflow-x-auto font-mono text-[12px] leading-[1.9]">
          <span className="text-text-dim">{"{"}</span>
          {lines.map(([key, value], i) => (
            <span key={key} className="block pl-4">
              <span className="text-accent-ink">&quot;{key}&quot;</span>
              <span className="text-text-dim">: </span>
              <span className="text-heading">{value}</span>
              {i < lines.length - 1 ? <span className="text-text-dim">,</span> : null}
            </span>
          ))}
          <span className="text-text-dim">{"}"}</span>
        </pre>
      </MiniWindow>
    </Taped>
  );
}

/** A small practical task, with the AI's feedback on the attempt. */
export function TaskCard() {
  return (
    <Taped
      tilt="-rotate-[1.5deg]"
      note={
        <Annotation
          arrow="down-right"
          tilt="-rotate-[4deg]"
          label={"a real task,\nnot a guess"}
          className="-top-24 left-0"
          arrowClassName="ml-20 h-[56px] w-[84px]"
        />
      }
    >
      <MiniWindow title="Practical task · JavaScript" meta="Task 2 of 3">
        <p className="text-heading text-[13px]">
          Write <code className="font-mono text-[12px]">debounce(fn, ms)</code> so a search box only
          fires after typing stops.
        </p>
        <pre className="border-border bg-bg text-heading mt-3 overflow-x-auto rounded-[6px] border p-3 font-mono text-[11.5px] leading-[1.75]">
          {`function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}`}
        </pre>
        <div className="mt-3 flex flex-col gap-1.5 text-[12px]">
          <span className="text-heading flex items-center gap-2">
            <StatusGlyph status="mastered" /> Clears the pending timer on every call
          </span>
          <span className="text-text flex items-center gap-2">
            <StatusGlyph status="revision" /> Loses <code className="font-mono">this</code> when
            used as a method
          </span>
        </div>
      </MiniWindow>
    </Taped>
  );
}

/** One skill, scored topic by topic against the pass mark. */
export function ThresholdCard() {
  const topics = [
    { topic: "Closures", score: 82 },
    { topic: "Promises", score: 64 },
    { topic: "Event loop", score: 31 },
  ];
  const passMark = 40;
  return (
    <Taped
      tilt="rotate-[1deg]"
      note={
        <Annotation
          arrow="down-left"
          tilt="rotate-[5deg]"
          label={"the pass mark"}
          className="-top-20 -right-2"
          labelClassName="pl-14"
          arrowClassName="h-[52px] w-[80px]"
        />
      }
    >
      <MiniWindow title="JavaScript · your results" meta={`Pass mark ${passMark}`}>
        <div className="flex flex-col gap-5 py-1">
          {topics.map((t) => {
            const mastered = t.score >= passMark;
            return (
              <div key={t.topic} className="flex flex-col gap-2">
                <Bar label={t.topic} value={t.score} threshold={passMark} />
                <Chip status={mastered ? "mastered" : "revision"} className="self-start">
                  {mastered ? "Mastered" : "Needs revision"}
                </Chip>
              </div>
            );
          })}
        </div>
        <p className="border-border text-text-dim mt-4 flex items-center gap-2 border-t pt-3 text-[11px]">
          <span aria-hidden className="bg-accent h-2.5 w-px" /> The tick marks the pass mark
        </p>
      </MiniWindow>
    </Taped>
  );
}

/** What a weak topic comes with: a short, ordered study plan. */
export function ResourceCard() {
  const steps: { icon: LineIconName; kind: string; label: string }[] = [
    { icon: "resume", kind: "Read", label: "A 5-minute explanation" },
    { icon: "code", kind: "Example", label: "One worked example, step by step" },
    { icon: "checklist", kind: "Practice", label: "3 short questions" },
    { icon: "gauge", kind: "Then", label: "Check the topic again" },
  ];
  return (
    <Taped
      tilt="-rotate-[1deg]"
      note={
        <Annotation
          arrow="down-right"
          tilt="-rotate-[4deg]"
          label={"study this,\nthen try again"}
          className="-top-24 left-0"
          arrowClassName="ml-20 h-[56px] w-[84px]"
        />
      }
    >
      <MiniWindow title="Event loop" meta="Study plan">
        <Chip status="revision">Scored 31 · pass mark 40</Chip>
        <ol className="divide-border border-border mt-3 flex flex-col divide-y border-y">
          {steps.map((step) => (
            <li key={step.kind} className="flex items-center gap-3 py-2.5 text-[13px]">
              <LineIcon name={step.icon} className="text-text-dim h-4 w-4 flex-none" />
              <span className="text-heading flex-1">{step.label}</span>
              <MonoLabel>{step.kind}</MonoLabel>
            </li>
          ))}
        </ol>
      </MiniWindow>
    </Taped>
  );
}

/** The dashboard as a board: what's done, what's left, what's next. */
export function TopicsCard() {
  const columns = [
    {
      title: "Mastered",
      status: "mastered" as const,
      items: ["HTML & CSS", "Closures", "Promises", "Arrays"],
    },
    { title: "To revise", status: "revision" as const, items: ["Event loop", "SQL joins"] },
  ];
  return (
    <Taped
      tilt="rotate-[1.5deg]"
      note={
        <Annotation
          arrow="down-left"
          tilt="rotate-[4deg]"
          label={"always\nup to date"}
          className="-top-24 -right-4"
          labelClassName="pl-12"
          arrowClassName="h-[56px] w-[84px]"
        />
      }
    >
      <MiniWindow title="Your topics" meta="Updated today">
        <div className="grid grid-cols-2 gap-4">
          {columns.map((col) => (
            <div key={col.title}>
              <p className="border-heading text-heading border-b pb-1.5 text-[12px] font-medium">
                {col.title} <span className="text-text-dim font-mono">{col.items.length}</span>
              </p>
              <ul className="mt-1">
                {col.items.map((item) => (
                  <li
                    key={item}
                    className="border-border text-heading flex items-center gap-2 border-b py-2 text-[12px]"
                  >
                    <StatusGlyph status={col.status} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="border-border bg-bg text-heading mt-4 rounded-[8px] border px-3 py-2.5 text-[12px]">
          <span className="text-accent-ink font-mono text-[10px] tracking-wide uppercase">
            Next ·{" "}
          </span>
          Study the event loop, then check it again
        </p>
      </MiniWindow>
    </Taped>
  );
}

/* ── Skill tracks ─────────────────────────────────────────── */

export function TrackCard({ kind, tag, tilt }: { kind: TrackKind; tag: string; tilt: string }) {
  return (
    <Taped tilt={tilt}>
      <div className="card p-3">
        <PreviewFrame tag={tag}>
          <TrackPreview kind={kind} />
        </PreviewFrame>
      </div>
    </Taped>
  );
}

/* ── Roadmap ──────────────────────────────────────────────── */

function CoreCard() {
  const rows: { icon: LineIconName; label: string }[] = [
    { icon: "person", label: "Sign up · email or Google" },
    { icon: "chat", label: "AI onboarding chat" },
    { icon: "checklist", label: "Skill checks" },
    { icon: "resume", label: "Study material for weak topics" },
    { icon: "gauge", label: "Readiness dashboard" },
  ];
  return (
    <MiniWindow title="PrepSuccess" meta="Live now">
      <ul className="divide-border flex flex-col divide-y">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center gap-3 py-2.5 text-[13px]">
            <LineIcon name={row.icon} className="text-text-dim h-4 w-4 flex-none" />
            <span className="text-heading flex-1">{row.label}</span>
            <span className="text-accent-ink inline-flex items-center gap-1.5 font-mono text-[10px] tracking-wide uppercase">
              <span className="animate-pulse-dot bg-accent h-1.5 w-1.5 rounded-full" /> live
            </span>
          </li>
        ))}
      </ul>
    </MiniWindow>
  );
}

function JobsCard() {
  const jobs = [
    { role: "Software Engineer Trainee", kind: "Full-time · Campus" },
    { role: "Frontend Intern", kind: "Internship · 6 months" },
  ];
  return (
    <MiniWindow title="Jobs & internships" meta="Coming later">
      <ul className="flex flex-col gap-2.5">
        {jobs.map((job) => (
          <li
            key={job.role}
            className="border-border bg-bg flex items-center justify-between gap-3 rounded-[8px] border px-3 py-2.5"
          >
            <span>
              <span className="text-heading block text-[13px]">{job.role}</span>
              <MonoLabel>{job.kind}</MonoLabel>
            </span>
            <span className="border-heading text-heading rounded-full border px-3 py-1 text-[11px] font-medium">
              Apply
            </span>
          </li>
        ))}
      </ul>
      <p className="text-text-dim mt-3 text-[11px]">
        Apply with the same readiness profile you built.
      </p>
    </MiniWindow>
  );
}

export function RoadmapCard({ visual, tilt }: { visual: RoadmapVisual; tilt: string }) {
  const body =
    visual === "core" ? (
      <CoreCard />
    ) : visual === "jobs" ? (
      <JobsCard />
    ) : (
      <RoadmapPreview kind={visual} />
    );
  return <Taped tilt={tilt}>{body}</Taped>;
}

/* ── Mentors ──────────────────────────────────────────────── */

/** What a mentor opens before a session: a slice, not the whole account. */
export function SessionBriefCard() {
  return (
    <Taped
      tilt="rotate-[1.5deg]"
      note={
        <Annotation
          arrow="down-left"
          tilt="rotate-[4deg]"
          label={"only what the\nsession needs"}
          className="-top-24 -right-4"
          labelClassName="pl-12"
          arrowClassName="h-[56px] w-[84px]"
        />
      }
    >
      <MiniWindow title="Session brief" meta="45 min · Thu">
        <dl className="divide-border flex flex-col divide-y text-[13px]">
          <div className="flex justify-between gap-4 py-2.5">
            <dt className="text-text-dim">Target role</dt>
            <dd className="text-heading">Software engineer</dd>
          </div>
          <div className="py-2.5">
            <dt className="text-text-dim">Key gaps</dt>
            <dd className="mt-2 flex flex-wrap gap-1.5">
              <Chip status="revision">SQL joins</Chip>
              <Chip status="revision">Dynamic programming</Chip>
            </dd>
          </div>
          <div className="py-2.5">
            <dt className="text-text-dim">Your last note</dt>
            <dd className="text-heading mt-1">
              &ldquo;Practise LEFT vs INNER joins on a real schema.&rdquo;
            </dd>
          </div>
          <div className="text-text-dim flex items-center justify-between gap-4 py-2.5">
            <dt>Full test history</dt>
            <dd className="font-mono text-[11px] uppercase">
              <Circled delay={0.5}>not shared</Circled>
            </dd>
          </div>
        </dl>
      </MiniWindow>
    </Taped>
  );
}

/** Mentor notes and AI suggestions land in the same list. */
export function MergedStepsCard() {
  const steps = [
    { text: "Revise SQL joins — 3 resources ready", from: "AI" },
    { text: "Rehearse a 60-second project walkthrough", from: "Mentor" },
    { text: "Check SQL again when you're done", from: "AI" },
  ];
  return (
    <Taped
      tilt="-rotate-[1.5deg]"
      note={
        <Annotation
          arrow="down-right"
          tilt="-rotate-[4deg]"
          label={"one list,\nnot two"}
          className="-top-24 left-0"
          arrowClassName="ml-16 h-[56px] w-[84px]"
        />
      }
    >
      <MiniWindow title="Next steps" meta="Student dashboard">
        <ol className="divide-border flex flex-col divide-y">
          {steps.map((step, i) => (
            <li key={step.text} className="flex items-center gap-3 py-3 text-[13px]">
              <span className="text-accent-ink font-mono text-[11px]">0{i + 1}</span>
              <span className="text-heading flex-1">{step.text}</span>
              <Chip status={step.from === "Mentor" ? "mastered" : "neutral"}>{step.from}</Chip>
            </li>
          ))}
        </ol>
      </MiniWindow>
    </Taped>
  );
}
