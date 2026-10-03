"use client";

import { useMemo } from "react";
import { useAppTheme } from "@/lib/theme/appTheme";
import CodeMirror, { EditorView, type Extension } from "@uiw/react-codemirror";
import { StreamLanguage } from "@codemirror/language";
import { cpp } from "@codemirror/lang-cpp";
import { html } from "@codemirror/lang-html";
import { java } from "@codemirror/lang-java";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { sql } from "@codemirror/lang-sql";
import { shell } from "@codemirror/legacy-modes/mode/shell";
import { c as cLang } from "@codemirror/legacy-modes/mode/clike";
import type { TaskLanguage } from "./languages";

function languageExtension(language: TaskLanguage): Extension[] {
  switch (language) {
    case "html":
      return [html()];
    case "javascript":
      return [javascript()];
    case "jsx":
      return [javascript({ jsx: true })];
    case "typescript":
      return [javascript({ typescript: true })];
    case "python":
      return [python()];
    case "java":
      return [java()];
    case "c":
      return [StreamLanguage.define(cLang)];
    case "cpp":
      return [cpp()];
    case "sql":
      return [sql()];
    case "shell":
      return [StreamLanguage.define(shell)];
    default:
      return [EditorView.lineWrapping];
  }
}

/** Tailwind-token-friendly frame so the editor sits in the card like any other field. */
const frame = EditorView.theme({
  "&": { fontSize: "13px", height: "100%" },
  "&.cm-focused": { outline: "none" },
  ".cm-scroller": {
    fontFamily: "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)",
    lineHeight: "1.6",
  },
  ".cm-gutters": { borderRight: "1px solid var(--border)" },
});

export interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: TaskLanguage;
  id?: string;
  label: string;
  describedBy?: string;
  disabled?: boolean;
  onRun?: () => void;
}

/**
 * A real code editor (CodeMirror 6): syntax colours, line numbers, auto-indent,
 * bracket matching and closing, folding, search, multiple cursors. Tab indents;
 * press Esc then Tab to move focus out. Ctrl/Cmd+Enter runs the code.
 */
export default function CodeEditor({
  value,
  onChange,
  language,
  id,
  label,
  describedBy,
  disabled,
  onRun,
}: CodeEditorProps) {
  // The app's own light/dark setting (not next-themes), so the editor matches the page.
  const { resolved } = useAppTheme();
  const extensions = useMemo(
    () => [
      ...languageExtension(language),
      frame,
      EditorView.contentAttributes.of({
        "aria-label": label,
        ...(id ? { id } : {}),
        ...(describedBy ? { "aria-describedby": describedBy } : {}),
      }),
      EditorView.domEventHandlers({
        keydown: (event) => {
          if (onRun && event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            onRun();
            return true;
          }
          return false;
        },
      }),
    ],
    [language, label, id, describedBy, onRun],
  );

  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      extensions={extensions}
      theme={resolved === "dark" ? "dark" : "light"}
      editable={!disabled}
      readOnly={disabled}
      indentWithTab
      height="100%"
      minHeight="18rem"
      basicSetup={{
        lineNumbers: language !== "text",
        foldGutter: language !== "text",
        highlightActiveLine: true,
        highlightActiveLineGutter: true,
        bracketMatching: true,
        closeBrackets: true,
        autocompletion: language !== "text",
        indentOnInput: true,
        tabSize: 2,
      }}
      className="h-full"
    />
  );
}
