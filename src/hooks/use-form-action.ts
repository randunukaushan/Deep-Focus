import { useEffect, useRef, useState } from 'react';

/** One in-flight form action, including taps before the busy render arrives. */
export function useFormAction(onUnexpectedError: () => void) {
  const lock = useRef(false);
  const mounted = useRef(true);
  const [busy, setBusy] = useState(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  function run<T>(work: () => Promise<T>, receive: (result: T) => void) {
    if (!mounted.current || lock.current) return;
    lock.current = true;
    setBusy(true);
    void (async () => {
      try {
        const result = await work();
        if (mounted.current) receive(result);
      } catch {
        // Raw provider/transport exceptions must never become user-visible copy.
        if (mounted.current) onUnexpectedError();
      } finally {
        lock.current = false;
        if (mounted.current) setBusy(false);
      }
    })();
  }
  return { busy, run };
}
