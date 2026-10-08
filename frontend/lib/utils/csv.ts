/**
 * Small CSV reader/writer (RFC 4180): commas, quoted cells with commas or
 * line breaks inside, and "" for a quote. Enough for admin imports without
 * pulling in a library.
 */

export class CsvError extends Error {}

/** Splits CSV text into rows of cells. Line breaks inside quoted cells are kept as "\n". */
export function parseCsv(text: string): string[][] {
  const src = text.replace(/^﻿/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = false;
      } else if (ch === "\r" && src[i + 1] === "\n") {
        // Windows line break inside a cell: keep one "\n".
      } else cell += ch;
    } else if (ch === '"' && cell === "") {
      quoted = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  if (quoted) throw new CsvError("A quoted cell is never closed.");
  if (cell !== "" || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

/**
 * Rows as objects keyed by the header row (lower-cased). Only `columns` are
 * kept, blank cells are left out and blank lines are skipped.
 */
export function csvToObjects(text: string, columns: readonly string[]) {
  const [header, ...rows] = parseCsv(text).filter((row) => row.some((cell) => cell.trim()));
  if (!header) return [];
  const keys = header.map((name) => name.trim().toLowerCase());
  if (!keys.some((key) => columns.includes(key))) {
    throw new CsvError(`The first row must name the columns: ${columns.join(", ")}.`);
  }
  return rows.map((row) => {
    const record: Record<string, string> = {};
    keys.forEach((key, index) => {
      const value = row[index]?.trim();
      if (columns.includes(key) && value) record[key] = value;
    });
    return record;
  });
}

/** One CSV cell, quoted when it needs to be. */
const cell = (value: string) => (/[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

/** Rows of cells back to CSV text. */
export function toCsv(rows: string[][]) {
  return rows.map((row) => row.map(cell).join(",")).join("\r\n") + "\r\n";
}
