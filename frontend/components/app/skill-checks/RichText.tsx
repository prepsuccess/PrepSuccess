import { Fragment } from "react";
import { cn } from "@/lib/utils/cn";

/** Renders `inline code` from AI text as <code>; everything else stays plain text. */
export function InlineText({ text }: { text: string }) {
  const parts = text.split(/(`[^`\n]+`)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("`") && part.endsWith("`") && part.length > 2 ? (
          <code key={i} className="bg-muted rounded px-1 py-0.5 font-mono text-[0.9em]">
            {part.slice(1, -1)}
          </code>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

/**
 * AI question text: ``` fenced blocks become scrollable code blocks, the rest
 * keeps its line breaks. Never renders HTML from the model.
 */
export function RichText({ text, className }: { text: string; className?: string }) {
  const segments = text.split(/```[a-zA-Z0-9+#-]*\n?/);
  return (
    <div className={cn("space-y-3", className)}>
      {segments.map((segment, i) => {
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
        const prose = segment.trim();
        return prose ? (
          <p key={i} className="whitespace-pre-wrap">
            <InlineText text={prose} />
          </p>
        ) : null;
      })}
    </div>
  );
}
