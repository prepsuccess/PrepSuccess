/** Pure helpers for admin analytics — testable without a database. */

const DAY_MS = 86_400_000;
const IST_OFFSET_MS = 330 * 60_000;

/** The India-time calendar date (YYYY-MM-DD) of an instant. */
export const indianDate = (at: Date) =>
  new Date(at.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);

/** Counts per India-time day for the last `days` days, oldest first, zero-filled. */
export function countByDay(dates: Date[], now = new Date(), days = 30) {
  const counts = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--)
    counts.set(indianDate(new Date(now.getTime() - i * DAY_MS)), 0);
  for (const date of dates) {
    const key = indianDate(date);
    if (counts.has(key)) counts.set(key, counts.get(key)! + 1);
  }
  return [...counts].map(([date, count]) => ({ date, count }));
}

/** Whole-number percentage, or null when there's nothing to divide by. */
export const percentOrNull = (part: number, whole: number) =>
  whole > 0 ? Math.round((part / whole) * 100) : null;

export const averageOrNull = (values: number[]) =>
  values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null;
