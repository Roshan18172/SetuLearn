import { useCallback, useEffect, useRef, useState } from "react";

/** Seconds since mount (stops when `running` is false). */
export function useElapsed(running = true) {
  const [sec, setSec] = useState(0);
  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => setSec((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  return sec;
}

/**
 * Countdown with 100 ms resolution. `restart()` begins a new countdown; `stop()` freezes it.
 * onExpire is called once per countdown.
 */
export function useCountdown(seconds, onExpire) {
  const [left, setLeft] = useState(seconds);
  const deadline = useRef(null);
  const expired = useRef(false);
  const cb = useRef(onExpire);
  cb.current = onExpire;

  const stop = useCallback(() => {
    deadline.current = null;
  }, []);

  const restart = useCallback(() => {
    expired.current = false;
    deadline.current = Date.now() + seconds * 1000;
    setLeft(seconds);
  }, [seconds]);

  useEffect(() => {
    const id = setInterval(() => {
      if (!deadline.current) return;
      const remaining = Math.max(0, (deadline.current - Date.now()) / 1000);
      setLeft(remaining);
      if (remaining <= 0 && !expired.current) {
        expired.current = true;
        deadline.current = null;
        cb.current?.();
      }
    }, 100);
    return () => clearInterval(id);
  }, []);

  return { left, fraction: Math.max(0, Math.min(1, left / seconds)), restart, stop };
}
