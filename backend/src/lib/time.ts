/**
 * Date helpers with no dependencies (no env, no database), so pure modules
 * and the OpenAPI export can use them.
 */

/** Start of the current day in India (UTC+5:30), when daily limits reset. */
export function startOfIndianDay(now = new Date()): Date {
  const IST_OFFSET_MS = 330 * 60_000;
  const local = new Date(now.getTime() + IST_OFFSET_MS);
  local.setUTCHours(0, 0, 0, 0);
  return new Date(local.getTime() - IST_OFFSET_MS);
}
