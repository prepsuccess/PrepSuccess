import { cn } from "@/lib/utils/cn";
import { InlineText } from "@/components/app/skill-checks/RichText";

/**
 * Hosted notes and task briefs: blank lines separate paragraphs, lines that
 * start with "- " become a list, ``` fences become code blocks and `code`
 * stays inline. Plain text in, React elements out — never HTML.
 */
export function Prose({ text, className }: { text: string; className?: string }) {
  // The whole fence line is the fence, so "```py title" never leaks into the
  // code; the language is its first word. split() interleaves the captured
  // fence info with the text, and odd segments are code.
  const parts = text.split(/```([^\n`]*)\n?/);
  const segments = parts.filter((_, i) => i % 2 === 0);
  const fenceInfo = parts.filter((_, i) => i % 2 === 1);
  const language = (i: number) => fenceInfo[i - 1]?.trim().split(/\s+/)[0] || undefined;
  return (
    <div className={cn("space-y-3 text-sm leading-relaxed", className)}>
      {segments.flatMap((segment, i) => {
        if (i % 2 === 1) {
          return (
            <pre
              key={i}
              className="bg-muted overflow-x-auto rounded-lg p-3 font-mono text-[13px] leading-relaxed"
            >
              <code data-language={language(i)}>{segment.replace(/\n$/, "")}</code>
            </pre>
          );
        }
        return segment
          .split(/\n\s*\n/)
          .map((block) => block.trim())
          .filter(Boolean)
          .map((block, j) => <Block key={`${i}-${j}`} text={block} />);
      })}
    </div>
  );
}

type Run = { kind: "p" | "ul"; lines: string[] };

/** Splits a block's lines into consecutive runs of paragraph lines and list items, in order. */
function toRuns(lines: string[]): Run[] {
  const runs: Run[] = [];
  for (const line of lines) {
    const kind = line.startsWith("- ") ? "ul" : "p";
    const last = runs[runs.length - 1];
    if (last?.kind === kind) last.lines.push(line);
    else runs.push({ kind, lines: [line] });
  }
  return runs;
}

function Block({ text }: { text: string }) {
  const runs = toRuns(text.split("\n"));
  if (runs.length === 1 && runs[0]!.kind === "p") {
    return (
      <p>
        <InlineText text={text} />
      </p>
    );
  }
  // "Intro\n- a\n- b\nOutro" keeps its order: the intro, the list, then the outro.
  return (
    <div className="space-y-2">
      {runs.map((run, k) =>
        run.kind === "p" ? (
          <p key={k}>
            <InlineText text={run.lines.join(" ")} />
          </p>
        ) : (
          <ul key={k} className="list-disc space-y-1.5 pl-5">
            {run.lines.map((item, m) => (
              <li key={m}>
                <InlineText text={item.slice(2)} />
              </li>
            ))}
          </ul>
        ),
      )}
    </div>
  );
}
