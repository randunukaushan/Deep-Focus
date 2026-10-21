import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState, type PropsWithChildren } from 'react';
import { Platform } from 'react-native';
import { useAuth } from '@/features/auth/auth-context';
import { loadPresentationPreferences, savePresentationPreferences } from '@/features/storage/local-database';
import { defaultPresentationPreferences, type PresentationPreferences } from './presentation-preferences';

type Value = { preferences: PresentationPreferences; loading: boolean; saving: boolean; error: boolean; retry: () => void; save: (value: PresentationPreferences) => Promise<boolean> };
const Context = createContext<Value | null>(null);
export const usePresentation = () => useContext(Context);

export function PresentationProvider({ children }: PropsWithChildren) {
  const { snapshot } = useAuth();
  const owner = snapshot.status === 'signed_in' ? snapshot.userId ?? null : null;
  const currentOwner = useRef(owner);
  useLayoutEffect(() => { currentOwner.current = owner; return () => { currentOwner.current = null; }; }, [owner]);
  const generation = useRef(0);
  const writeLock = useRef(false);
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<{ owner: string | null; revision: number; preferences: PresentationPreferences; loading: boolean; saving: boolean; error: boolean }>({ owner: null, revision: -1, preferences: defaultPresentationPreferences, loading: false, saving: false, error: false });

  useEffect(() => {
    const request = ++generation.current;
    let active = true;
    writeLock.current = false;
    if (!owner) return;
    const read = Platform.OS === 'web' ? Promise.reject(new Error('NATIVE_STORAGE_REQUIRED')) : loadPresentationPreferences();
    void read.then(preferences => {
      if (active && generation.current === request && currentOwner.current === owner) setState({ owner, revision, preferences, loading: false, saving: false, error: false });
    }).catch(() => {
      if (active && generation.current === request && currentOwner.current === owner) setState({ owner, revision, preferences: defaultPresentationPreferences, loading: false, saving: false, error: true });
    });
    return () => { active = false; };
  }, [owner, revision]);

  const save = useCallback(async (preferences: PresentationPreferences) => {
    if (!owner || currentOwner.current !== owner || state.owner !== owner || state.revision !== revision || state.loading || state.error || writeLock.current) return false;
    writeLock.current = true;
    const request = generation.current;
    setState(s => ({ ...s, saving: true }));
    try {
      await savePresentationPreferences(preferences);
      if (currentOwner.current !== owner || generation.current !== request) return false;
      setState({ owner, revision, preferences, loading: false, saving: false, error: false });
      return true;
    } catch { return false; }
    finally {
      if (generation.current === request) { writeLock.current = false; setState(s => ({ ...s, saving: false })); }
    }
  }, [owner, revision, state.owner, state.revision, state.loading, state.error]);
  const sameOwner = state.owner === owner && state.revision === revision;
  return <Context.Provider value={{ preferences: sameOwner && owner ? state.preferences : defaultPresentationPreferences, loading: !!owner && (!sameOwner || state.loading), saving: sameOwner && state.saving, error: sameOwner && state.error, retry: () => setRevision(n => n + 1), save }}>{children}</Context.Provider>;
}
