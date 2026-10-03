"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils/cn";
import { ContentManager } from "./ContentManager";
import { PrepPdfsManager } from "./PrepPdfsManager";
import { QuestionsManager } from "./QuestionsManager";

const TABS = [
  { id: "skills", label: "Skills & content", panel: ContentManager },
  { id: "questions", label: "Interview questions", panel: QuestionsManager },
  { id: "guides", label: "Prep guides", panel: PrepPdfsManager },
] as const;

/**
 * /admin/content — one tab per kind of content. Only the open tab is mounted,
 * so each list loads when the admin first opens it. Arrow keys move between tabs.
 */
export function ContentTabs() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();
  const Panel = TABS[active]!.panel;

  function onKeyDown(e: KeyboardEvent) {
    const last = TABS.length - 1;
    const next =
      e.key === "ArrowRight"
        ? active === last
          ? 0
          : active + 1
        : e.key === "ArrowLeft"
          ? active === 0
            ? last
            : active - 1
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? last
              : null;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  }

  return (
    <div className="space-y-6">
      <div
        role="tablist"
        aria-label="Content type"
        onKeyDown={onKeyDown}
        className="flex gap-1 overflow-x-auto border-b"
      >
        {TABS.map((tab, i) => (
          <button
            key={tab.id}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${baseId}-${tab.id}-tab`}
            aria-selected={active === i}
            aria-controls={`${baseId}-${tab.id}-panel`}
            tabIndex={active === i ? 0 : -1}
            onClick={() => setActive(i)}
            className={cn(
              "focus-visible:ring-ring/50 -mb-px h-10 shrink-0 rounded-t-lg border-b-2 px-3 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-3 motion-reduce:transition-none pointer-coarse:h-11",
              active === i
                ? "border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground border-transparent",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`${baseId}-${TABS[active]!.id}-panel`}
        aria-labelledby={`${baseId}-${TABS[active]!.id}-tab`}
      >
        <Panel />
      </div>
    </div>
  );
}
