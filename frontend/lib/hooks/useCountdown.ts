import { useEffect, useState } from "react";

/** Seconds left on a countdown, and a function that (re)starts it. */
export function useCountdown(seconds: number) {
  const [until, setUntil] = useState(0);
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (!until) return;
    const timer = window.setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= until) window.clearInterval(timer);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [until]);

  const start = () => {
    const t = Date.now();
    setNow(t);
    setUntil(t + seconds * 1000);
  };

  return [until ? Math.max(0, Math.ceil((until - now) / 1000)) : 0, start] as const;
}
