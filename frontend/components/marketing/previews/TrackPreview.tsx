import { Chip, Line, MiniWindow } from "@/components/ui/MiniUI";
import { type TrackPreview as Kind } from "@/lib/content";

function Code() {
  return (
    <MiniWindow title="Quick check · Arrays" meta="Q 2 of 4" className="h-full">
      <p className="text-heading text-[12px]">
        Find the length of the longest subarray whose sum equals k.
      </p>
      <pre className="bg-surface-3 text-text mt-3 rounded-[6px] p-3 font-mono text-[11px] leading-relaxed">
        <span className="text-brand-ink">function</span> longest(nums, k) {"{"}
        {"\n"} <span className="text-brand-ink">const</span> seen ={" "}
        <span className="text-brand-ink">new</span> Map();
        {"\n"} <span className="text-text-dim">{"// your approach…"}</span>
        {"\n"}
        {"}"}
      </pre>
      <div className="mt-3 flex gap-2">
        <Chip status="mastered">Arrays</Chip>
        <Chip status="revision">Hashing</Chip>
      </div>
    </MiniWindow>
  );
}

function Task() {
  return (
    <MiniWindow title="Practical task · CSS layout" meta="Submitted" className="h-full">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Line width="70%" />
          <Line width="90%" />
          <Line width="55%" />
          <span className="text-text-dim mt-2 text-[11px]">Build a responsive card grid</span>
        </div>
        <div className="border-border bg-surface grid grid-cols-2 gap-1.5 rounded-[6px] border p-2">
          {[0, 1, 2, 3].map((cell) => (
            <span
              key={cell}
              className={`h-8 rounded-[3px] ${cell === 0 ? "bg-heading" : "bg-surface-3"}`}
            />
          ))}
        </div>
      </div>
      <div className="border-heading bg-surface-3 text-heading mt-3 border-l-2 px-3 py-2 text-[11px]">
        <span className="text-text-dim text-[12px] tabular-nums">AI feedback</span>
        <p className="mt-0.5">Grid works. Add a breakpoint under 480px.</p>
      </div>
    </MiniWindow>
  );
}

function Aptitude() {
  return (
    <MiniWindow title="Aptitude · Time & work" meta="00:42" className="h-full">
      <div className="flex items-center justify-between">
        <span className="text-text-dim text-[11px]">Question 3</span>
        <span className="text-text-dim text-[12px] tabular-nums">Timed</span>
      </div>
      <p className="text-heading mt-2 text-[12px]">
        A finishes a job in 12 days and B in 18. Working together, how many days?
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {["6.2", "7.2", "8", "9"].map((option) => (
          <span
            key={option}
            className={`rounded-[6px] border px-3 py-1.5 text-[12px] ${option === "7.2" ? "border-heading text-heading" : "border-border text-text"}`}
          >
            {option === "7.2" ? <span className="marker">{option} days</span> : `${option} days`}
          </span>
        ))}
      </div>
    </MiniWindow>
  );
}

function Communication() {
  return (
    <MiniWindow title="Communication · Written response" meta="Draft" className="h-full">
      <p className="text-heading text-[12px]">
        Explain a project you built to a non-technical interviewer.
      </p>
      <div className="border-border bg-surface mt-3 flex flex-col gap-2 rounded-[6px] border p-3">
        <Line width="95%" />
        <Line width="88%" />
        <Line width="60%" />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Chip status="mastered">Clarity</Chip>
        <Chip status="revision">Structure</Chip>
      </div>
    </MiniWindow>
  );
}

const previews: Record<Kind, () => React.JSX.Element> = {
  code: Code,
  task: Task,
  aptitude: Aptitude,
  communication: Communication,
};

export function TrackPreview({ kind }: { kind: Kind }) {
  const Preview = previews[kind];
  return <Preview />;
}
