import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { cancelFocusSession, completeFocusSession, createFocusSession, pauseFocusSession, projectFocusSession, resumeFocusSession } from './session-engine';
import { loadActiveSession, saveActiveSession } from './session-storage';
import type { FocusSession } from './session-types';

export function useFocusSession(durationMinutes: number, taskName?: string) {
  const initialRequest = useRef({ durationMinutes, taskName });
  const currentSession = useRef<FocusSession | null>(null);
  const [session, setSession] = useState<FocusSession | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);
  const saveRevision = useRef(0);
  const saveFault = useRef(false);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        const stored = await loadActiveSession(true);
        if (!mounted) return;
        const timestamp = Date.now();
        const next = stored ?? createFocusSession(initialRequest.current.durationMinutes, initialRequest.current.taskName, timestamp);
        projectFocusSession(next, timestamp);
        currentSession.current = next;
        setSession(next);
        setNow(timestamp);
      } catch {
        if (mounted) setError(RECOVERY_MESSAGE);
      } finally {
        if (mounted) setHydrated(true);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const projection = useMemo(() => {
    if (!session || error || saveFailed) return null;
    try { return projectFocusSession(session, now); } catch { return null; }
  }, [session, now, error, saveFailed]);
  const timerError = error ?? (saveFailed ? SAVE_FAILURE_MESSAGE : null) ?? (hydrated && session && !projection ? RECOVERY_MESSAGE : null);

  useEffect(() => {
    if (!hydrated || error || saveFault.current || !session || (session.status !== 'active' && session.status !== 'paused')) return;
    let currentEffect = true;
    const revision = ++saveRevision.current;
    void saveActiveSession(session).then(() => {
      if (currentEffect && revision === saveRevision.current) setSaveFailed(false);
    }).catch(() => {
      if (currentEffect && revision === saveRevision.current) {
        saveFault.current = true;
        setSaveFailed(true);
        // Stop the domain clock, not just the display interval. Keep this
        // snapshot in memory until explicit retry succeeds; never fabricate a
        // terminal outcome when persistence is unavailable.
        const current = currentSession.current;
        if (current?.status === 'active') {
          try {
            const timestamp = Date.now();
            const paused = pauseFocusSession(current, timestamp);
            currentSession.current = paused;
            setSession(paused);
            setNow(timestamp);
          } catch { setError(RECOVERY_MESSAGE); }
        }
      }
    });
    return () => { currentEffect = false; };
  }, [hydrated, session, error]);

  useEffect(() => {
    if (!hydrated || timerError || (session?.status !== 'active' && session?.status !== 'paused')) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') setNow(Date.now());
    });
    return () => { clearInterval(interval); subscription.remove(); };
  }, [hydrated, session?.status, timerError]);

  const update = useCallback((transition: (current: FocusSession, timestamp: number) => FocusSession) => {
    const current = currentSession.current;
    if (!hydrated || timerError || saveFault.current || !current) return false;
    try {
      const timestamp = Date.now();
      const next = transition(current, timestamp);
      currentSession.current = next;
      setNow(timestamp);
      setSession(next);
      return next !== current;
    } catch {
      setError(RECOVERY_MESSAGE);
      return false;
    }
  }, [hydrated, timerError]);
  const pause = useCallback(() => update(pauseFocusSession), [update]);
  const resume = useCallback(() => update(resumeFocusSession), [update]);
  const complete = useCallback(() => update(completeFocusSession), [update]);
  const cancel = useCallback(() => update(cancelFocusSession), [update]);
  const retrySave = useCallback(async () => {
    const current = currentSession.current;
    if (!hydrated || !saveFailed || !current || (current.status !== 'active' && current.status !== 'paused')) return false;
    const revision = ++saveRevision.current;
    try {
      await saveActiveSession(current);
      if (revision === saveRevision.current) {
        saveFault.current = false;
        setSaveFailed(false);
      }
      setNow(Date.now());
      return true;
    } catch {
      if (revision === saveRevision.current) setSaveFailed(true);
      return false;
    }
  }, [hydrated, saveFailed]);

  useEffect(() => {
    if (!hydrated || timerError || session?.status !== 'active' || projection?.remainingSeconds !== 0) return;
    const timeout = setTimeout(complete, 0);
    return () => clearTimeout(timeout);
  }, [complete, hydrated, timerError, projection?.remainingSeconds, session?.status]);

  return {
    session, projection, pause, resume, complete, cancel, hydrated,
    error: timerError,
    canRetrySave: saveFailed && (session?.status === 'active' || session?.status === 'paused'),
    retrySave,
  };
}

const RECOVERY_MESSAGE = 'This session could not be safely read or timed. Your saved data has not been reset. Return home and check your device clock before trying again.';
const SAVE_FAILURE_MESSAGE = 'This session could not be saved. The timer is paused. Retry saving before leaving; changes since the last successful save may be lost if the app closes.';
