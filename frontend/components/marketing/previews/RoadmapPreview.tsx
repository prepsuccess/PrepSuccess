import { Chip, Line, MiniWindow, StatusGlyph } from "@/components/ui/MiniUI";

type Kind = "questions" | "mentor" | "resume";

function Questions() {
  return (
    <MiniWindow title="Question bank" meta="SDE" className="h-full">
      <div className="flex gap-1.5">
        <Chip>SDE</Chip>
        <Chip>Arrays</Chip>
      </div>
      <ul className="mt-3 flex flex-col gap-2">
        {[
          "Two-pointer on sorted input",
          "Detect a cycle in a list",
          "Top-k frequent elements",
          "Merge overlapping intervals",
        ].map((q, i) => (
          <li
            key={q}
            className="border-border bg-surface text-heading flex items-center justify-between gap-2 rounded-[6px] border px-2.5 py-2 text-[11px]"
          >
            <span className="truncate">{q}</span>
            <span className="text-text-dim text-[12px] tabular-nums">
              {i < 2 ? "solved" : "saved"}
            </span>
          </li>
        ))}
      </ul>
    </MiniWindow>
  );
}

function Mentor() {
  return (
    <MiniWindow title="Mentor session" meta="45 min" className="h-full">
      <div className="border-border bg-surface grid h-24 place-items-center rounded-[6px] border">
        <span className="text-text flex items-center gap-2 text-[11px]">
          <span className="animate-pulse-dot bg-accent h-2 w-2 rounded-full" />
          Join opens 10 min before
        </span>
      </div>
      <p className="text-text-dim mt-3 text-[11px]">Mentor sees only</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        <Chip>Target role</Chip>
        <Chip status="revision">Key gaps</Chip>
      </div>
    </MiniWindow>
  );
}

function Resume() {
  return (
    <MiniWindow title="resume.pdf" meta="Feedback" className="h-full">
      <div className="border-border bg-surface flex flex-col gap-2 rounded-[6px] border p-3">
        <Line width="45%" className="bg-heading" />
        <Line width="90%" />
        <Line width="80%" />
        <Line width="65%" />
      </div>
      <ul className="mt-3 flex flex-col gap-1.5 text-[11px]">
        <li className="text-heading flex items-center gap-2">
          <StatusGlyph status="mastered" /> Projects section found
        </li>
        <li className="text-text flex items-center gap-2">
          <StatusGlyph status="revision" /> Quantify impact in bullet 2
        </li>
        <li className="text-text flex items-center gap-2">
          <StatusGlyph status="revision" /> Skills list misses SQL
        </li>
      </ul>
    </MiniWindow>
  );
}

const previews: Record<Kind, () => React.JSX.Element> = {
  questions: Questions,
  mentor: Mentor,
  resume: Resume,
};

export function RoadmapPreview({ kind }: { kind: Kind }) {
  const Preview = previews[kind];
  return <Preview />;
}
