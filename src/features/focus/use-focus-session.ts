import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';

import { cancelFocusSession, completeFocusSession, createFocusSession, pauseFocusSession, projectFocusSession, resumeFocusSession } from './session-engine';
import { loadActiveSession, saveActiveSession } from './session-storage';
import type { FocusSession } from './session-types';

export function useFocusSession(durationMinutes: number, taskName?: string) {
  const [session, setSession] = useState<FocusSession>(() => createFocusSession(durationMinutes, taskName));
  const [now, setNow] = useState(() => Date.now());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    loadActiveSession().then((stored) => {
      if (!mounted) return;
      if (stored) setSession(stored);
      setHydrated(true);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (session.status === 'active' || session.status === 'paused') void saveActiveSession(session);
  }, [hydrated, session]);

  useEffect(() => {
    if (session.status !== 'active') return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') setNow(Date.now());
    });
    return () => { clearInterval(interval); subscription.remove(); };
  }, [session.status]);

  const projection = useMemo(() => projectFocusSession(session, now), [session, now]);
  const update = useCallback((transition: (current: FocusSession, timestamp: number) => FocusSession) => {
    const timestamp = Date.now();
    setNow(timestamp);
    setSession((current) => transition(current, timestamp));
  }, []);
  const pause = useCallback(() => update(pauseFocusSession), [update]);
  const resume = useCallback(() => update(resumeFocusSession), [update]);
  const complete = useCallback(() => update(completeFocusSession), [update]);
  const cancel = useCallback(() => update(cancelFocusSession), [update]);

  useEffect(() => {
    if (session.status !== 'active' || projection.remainingSeconds !== 0) return;
    const timeout = setTimeout(complete, 0);
    return () => clearTimeout(timeout);
  }, [complete, projection.remainingSeconds, session.status]);

  return { session, projection, pause, resume, complete, cancel, hydrated };
}
