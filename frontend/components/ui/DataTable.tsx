import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  align?: "left" | "right";
  className?: string;
};

/** Ruled table in the site's style. Renders `empty` in place of the body when there are no rows. */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  empty,
  caption,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  empty?: ReactNode;
  caption?: string;
}) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-[14px]">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr className="border-heading border-b">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn(
                  "text-text-dim px-5 py-3.5 text-[12px] font-normal tabular-nums",
                  col.align === "right" && "text-right",
                  col.className,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="p-4">
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={rowKey(row)}
                className="border-border hover:bg-surface-3/60 border-b transition-colors last:border-b-0"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "text-heading px-5 py-3.5",
                      col.align === "right" && "text-right",
                      col.className,
                    )}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
