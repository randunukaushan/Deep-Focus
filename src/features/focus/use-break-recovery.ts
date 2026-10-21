import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { createBreakTimer, projectBreakTimer } from './break-engine';
import { createBreakRecoveryStorage } from './break-storage';
import type { ActiveBreak, FocusRecovery } from './break-recovery';

export function useBreakRecovery() {
  const [storage] = useState(createBreakRecoveryStorage);
  const [record, setRecord] = useState<FocusRecovery | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const [now, setNow] = useState(Date.now);
  const mounted = useRef(false);
  const locked = useRef(false);
  const pending = useRef<ActiveBreak | null>(null);

  const load = useCallback(async () => {
    if (locked.current) return;
    locked.current = true;
    setLoading(true);
    try {
      const next = await storage.load();
      if (!mounted.current || !storage.isCurrent()) return;
      setRecord(next);
      setNow(Date.now());
      setFailed(false);
    } catch {
      if (mounted.current && storage.isCurrent()) setFailed(true);
    } finally {
      locked.current = false;
      if (mounted.current && storage.isCurrent()) setLoading(false);
    }
  }, [storage]);

  useEffect(() => {
    mounted.current = true;
    void Promise.resolve().then(() => { if (mounted.current) return load(); });
    return () => { mounted.current = false; };
  }, [load]);

  useEffect(() => {
    const update = () => setNow(Date.now());
    const interval = setInterval(update, 1000);
    const subscription = AppState.addEventListener('change', state => { if (state === 'active') update(); });
    return () => { clearInterval(interval); subscription.remove(); };
  }, []);

  const start = useCallback(async (duration: number) => {
    if (!record?.session || record.session.status !== 'paused' || loading || locked.current || !storage.isCurrent()) return;
    locked.current = true;
    setSaving(true);
    try {
      // Preserve the original intent across failed/unknown writes and retry.
      const intent = pending.current ?? {
        ...createBreakTimer(duration, Date.now()),
        sessionId: record.session.id,
        pauseStartedAt: record.session.lastPausedAt!,
      };
      pending.current = intent;
      const activeBreak = await storage.save(intent);
      if (!mounted.current || !storage.isCurrent()) return;
      pending.current = null;
      setRecord({ ...record, activeBreak });
      setNow(Date.now());
      setFailed(false);
    } catch {
      if (mounted.current && storage.isCurrent()) setFailed(true);
    } finally {
      locked.current = false;
      if (mounted.current && storage.isCurrent()) setSaving(false);
    }
  }, [loading, record, storage]);

  let projection = null;
  let clockError = false;
  try { if (record?.activeBreak) projection = projectBreakTimer(record.activeBreak, now); }
  catch { clockError = true; }
  return {
    record, loading, saving, failed, clockError, projection,
    ready: !loading && !saving && !failed && !clockError && record?.session?.status === 'paused',
    start,
    retry: () => pending.current ? start(pending.current.plannedDurationSeconds / 60) : load(),
  };
}
