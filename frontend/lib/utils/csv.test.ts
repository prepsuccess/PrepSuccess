import { describe, expect, it } from "vitest";
import { CsvError, csvToObjects, parseCsv, toCsv } from "./csv";

describe("parseCsv", () => {
  it("splits plain rows and cells", () => {
    expect(parseCsv("a,b,c\n1,2,3\n")).toEqual([
      ["a", "b", "c"],
      ["1", "2", "3"],
    ]);
  });

  it("keeps commas, line breaks and doubled quotes inside quoted cells", () => {
    const text = 'title,body\r\n"Joins, explained","Line one\r\n\r\nSay ""hi"""\r\nlast,row';
    expect(parseCsv(text)).toEqual([
      ["title", "body"],
      ["Joins, explained", 'Line one\n\nSay "hi"'],
      ["last", "row"],
    ]);
  });

  it("keeps empty cells, including a trailing one", () => {
    expect(parseCsv("a,,c,\n")).toEqual([["a", "", "c", ""]]);
  });

  it("ignores a byte-order mark and a missing final line break", () => {
    expect(parseCsv("﻿a,b\n1,2")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });

  it("rejects a quote that is never closed", () => {
    expect(() => parseCsv('a,"b\n1,2')).toThrow(CsvError);
  });
});

describe("csvToObjects", () => {
  const columns = ["skill", "title", "answer", "company"];

  it("keys rows by the header, leaving out blank cells, blank lines and unknown columns", () => {
    const text = "Skill,Title,Answer,Company,Notes\nsql, WHERE vs HAVING ,,TCS,ignore me\n\n,,,,\n";
    expect(csvToObjects(text, columns)).toEqual([
      { skill: "sql", title: "WHERE vs HAVING", company: "TCS" },
    ]);
  });

  it("needs a header row it recognises", () => {
    expect(() => csvToObjects("sql,WHERE vs HAVING\n", columns)).toThrow(/first row/);
    expect(csvToObjects("", columns)).toEqual([]);
  });
});

describe("toCsv", () => {
  it("quotes only cells that need it, and reads back the same", () => {
    const rows = [
      ["title", "body"],
      ['Say "hi"', "a, b\nc"],
    ];
    expect(toCsv(rows)).toBe('title,body\r\n"Say ""hi""","a, b\nc"\r\n');
    expect(parseCsv(toCsv(rows))).toEqual(rows);
  });
});
