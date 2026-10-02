"use client";

import { useEffect, useState } from "react";

/**
 * True only once `flag` has stayed true for `delayMs`. Used so fast responses
 * don't flash a skeleton for a split second.
 */
export function useDelayedFlag(flag: boolean, delayMs = 150) {
  const [delayed, setDelayed] = useState(false);

  useEffect(() => {
    if (!flag) return;
    const timer = window.setTimeout(() => setDelayed(true), delayMs);
    return () => {
      window.clearTimeout(timer);
      setDelayed(false);
    };
  }, [flag, delayMs]);

  return flag && delayed;
}
