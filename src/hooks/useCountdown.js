import { useCallback, useEffect, useState } from "react";

/** Counts down from `start()` seconds to 0. Used for the "Resend code in 42s" button. */
export default function useCountdown(initial = 0) {
  const [seconds, setSeconds] = useState(initial);

  useEffect(() => {
    if (seconds <= 0) return undefined;
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  const start = useCallback((s) => setSeconds(s), []);
  return [seconds, start];
}
