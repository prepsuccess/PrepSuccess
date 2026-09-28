"use client";

import { useId, useState } from "react";

/** Hairline-ruled FAQ row: height eases open, the plus turns into a minus. */
export function AccordionItem({
  question,
  answer,
  index,
}: {
  question: string;
  answer: string;
  index: number;
}) {
  const [open, setOpen] = useState(false);
  const buttonId = useId();
  const panelId = useId();

  return (
    <div className="border-border-strong border-b">
      <h3 className="text-h6">
        <button
          id={buttonId}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
          className="group flex w-full cursor-pointer items-baseline gap-5 py-6 text-left"
        >
          <span className="text-text-dim w-6 flex-none text-[12px] font-normal tracking-normal tabular-nums">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="flex-1 transition-transform duration-500 ease-[var(--ease-out-cubic)] group-hover:translate-x-1">
            {question}
          </span>
          <span
            className="relative grid h-6 w-6 flex-none place-items-center self-center"
            aria-hidden
          >
            <span className="bg-heading h-[1.5px] w-4" />
            <span
              className={`bg-heading absolute h-[1.5px] w-4 transition-transform duration-400 ease-out ${open ? "rotate-0" : "rotate-90"}`}
            />
          </span>
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className={`grid transition-[grid-template-rows] duration-400 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden" inert={!open}>
          <p className="max-w-[60ch] pb-6 pl-11">{answer}</p>
        </div>
      </div>
    </div>
  );
}
