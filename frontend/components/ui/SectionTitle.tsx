import { type ReactNode } from "react";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { Reveal } from "@/components/motion/Reveal";

export function SectionTitle({
  title,
  description,
  align = "center",
  action,
  note,
  className = "",
}: {
  title: ReactNode;
  description?: string;
  align?: "center" | "split";
  action?: ReactNode;
  /** An absolutely positioned hand-drawn Annotation pinned to the title block. */
  note?: ReactNode;
  className?: string;
}) {
  if (align === "split") {
    return (
      <div className={`relative flex flex-wrap items-end justify-between gap-8 ${className}`}>
        <div className="max-w-[766px]">
          <SplitHeading className="text-h2">{title}</SplitHeading>
          {description ? (
            <Reveal delay={0.2} className="mt-4 max-w-[500px]">
              <p>{description}</p>
            </Reveal>
          ) : null}
        </div>
        {action ? <Reveal delay={0.3}>{action}</Reveal> : null}
        {note}
      </div>
    );
  }

  return (
    <div
      className={`relative mx-auto mb-12 flex max-w-[620px] flex-col items-center text-center lg:mb-[60px] ${className}`}
    >
      <SplitHeading className="text-h2">{title}</SplitHeading>
      {description ? (
        <Reveal delay={0.2} className="mt-4 max-w-[510px]">
          <p>{description}</p>
        </Reveal>
      ) : null}
      {note}
    </div>
  );
}
