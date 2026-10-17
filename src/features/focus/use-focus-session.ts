import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { cancelFocusSession, completeFocusSession, createFocusSession, pauseFocusSession, projectFocusSession, resumeFocusSession } from './session-engine';
import { loadActiveSession, loadFocusableTask, saveActiveSession } from './session-storage';
import type { FocusSession } from './session-types';

export type FocusSessionRuntimeMessages = {
  recoveryError: string;
  taskUnavailable: string;
  saveFailure: string;
};

export function useFocusSession(durationMinutes: number, taskName: string | undefined, taskId: string | undefined, messages: FocusSessionRuntimeMessages) {
  const initialRequest = useRef({ durationMinutes, taskName, taskId });
  const currentSession = useRef<FocusSession | null>(null);
  const [session, setSession] = useState<FocusSession | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);
  const saveRevision = useRef(0);
  const saveFault = useRef(false);
  const messagesRef = useRef(messages);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        const stored = await loadActiveSession(true);
        if (!mounted) return;
        const timestamp = Date.now();
        let next = stored;
        if (!next) {
          const task = initialRequest.current.taskId ? await loadFocusableTask(initialRequest.current.taskId) : null;
          if (initialRequest.current.taskId && !task) throw new Error('TASK_NOT_AVAILABLE');
          const created = createFocusSession(initialRequest.current.durationMinutes, task?.title ?? initialRequest.current.taskName, timestamp);
          next = task ? { ...created, taskId: task.id } : created;
        }
        projectFocusSession(next, timestamp);
        currentSession.current = next;
        setSession(next);
        setNow(timestamp);
      } catch (cause) {
        if (mounted) setError(cause instanceof Error && cause.message === 'TASK_NOT_AVAILABLE' ? messagesRef.current.taskUnavailable : messagesRef.current.recoveryError);
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
  const timerError = error ?? (saveFailed ? messages.saveFailure : null) ?? (hydrated && session && !projection ? messages.recoveryError : null);

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
          } catch { setError(messagesRef.current.recoveryError); }
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
      setError(messagesRef.current.recoveryError);
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
