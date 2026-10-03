import { cn } from "@/lib/utils/cn";
import { InlineText } from "@/components/app/skill-checks/RichText";

/**
 * Hosted notes and task briefs: blank lines separate paragraphs, lines that
 * start with "- " become a list, ``` fences become code blocks and `code`
 * stays inline. Plain text in, React elements out — never HTML.
 */
export function Prose({ text, className }: { text: string; className?: string }) {
  const segments = text.split(/```[a-zA-Z0-9+#-]*\n?/);
  return (
    <div className={cn("space-y-3 text-sm leading-relaxed", className)}>
      {segments.flatMap((segment, i) => {
        if (i % 2 === 1) {
          return (
            <pre
              key={i}
              className="bg-muted overflow-x-auto rounded-lg p-3 font-mono text-[13px] leading-relaxed"
            >
              <code>{segment.replace(/\n$/, "")}</code>
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

function Block({ text }: { text: string }) {
  const lines = text.split("\n");
  const items = lines.filter((line) => line.startsWith("- "));
  // A paragraph that leads into a list ("Good examples:\n- …") keeps its lead line.
  const lead = lines.filter((line) => !line.startsWith("- ")).join(" ");
  if (!items.length) {
    return (
      <p>
        <InlineText text={text} />
      </p>
    );
  }
  return (
    <div className="space-y-2">
      {lead ? (
        <p>
          <InlineText text={lead} />
        </p>
      ) : null}
      <ul className="list-disc space-y-1.5 pl-5">
        {items.map((item, k) => (
          <li key={k}>
            <InlineText text={item.slice(2)} />
          </li>
        ))}
      </ul>
    </div>
  );
}
