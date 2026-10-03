import type { TaskDetail } from "@/lib/api/types";

export type TaskLanguage = TaskDetail["language"];

/** Name shown on the editor's tab. */
export const LANGUAGE_LABEL: Record<TaskLanguage, string> = {
  html: "HTML",
  javascript: "JavaScript",
  typescript: "TypeScript",
  jsx: "React (JSX)",
  python: "Python",
  java: "Java",
  c: "C",
  cpp: "C++",
  sql: "SQL",
  shell: "Shell",
  text: "Answer",
};

/** File name shown on the editor's tab, like a real editor. */
export const FILE_NAME: Record<TaskLanguage, string> = {
  html: "index.html",
  javascript: "main.js",
  typescript: "main.ts",
  jsx: "App.jsx",
  python: "main.py",
  java: "Main.java",
  c: "main.c",
  cpp: "main.cpp",
  sql: "query.sql",
  shell: "commands.sh",
  text: "answer.txt",
};
