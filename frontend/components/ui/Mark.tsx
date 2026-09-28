import { type ReactNode } from "react";

/** Highlighter stroke behind a word or phrase, in the pale accent. */
export function Mark({ children }: { children: ReactNode }) {
  return <span className="marker">{children}</span>;
}
