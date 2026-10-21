import { createContext, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { randomUUID } from 'expo-crypto';
import { Platform } from 'react-native';
import { bindSetupStorage } from '@/features/storage/local-database';
import type { AppLocale } from '@/features/settings/settings-storage';
import { createSetupFlow, type SetupFlowState } from './setup-flow';
import type { SetupField, SetupQuestionId } from './setup-definition';

type Controller = ReturnType<typeof createSetupFlow>;
type Value = SetupFlowState & {
  answer(id: SetupQuestionId, option: string): Promise<boolean>;
  apply(fields: readonly SetupField[]): Promise<boolean>;
  ensureDraft(): Promise<boolean>;
  retry(): Promise<boolean>;
  reload(): Promise<boolean>;
  move(index: number): boolean;
  saveLocale(locale: AppLocale): Promise<boolean>;
};
const Context = createContext<Value | null>(null);

/** The layout must key this provider by authenticated owner. */
export function SetupProvider({ children }: PropsWithChildren) {
  const controller = useRef<Controller | null>(null);
  const storage = useRef<ReturnType<typeof bindSetupStorage> | null>(null);
  const languageLock = useRef(false);
  const [state, setState] = useState<SetupFlowState>({ status: Platform.OS === 'web' ? 'error' : 'loading', error: Platform.OS === 'web' ? 'load' : null, answers: {}, current: null, questionIndex: 0 });
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const bound = bindSetupStorage();
    const flow = createSetupFlow(bound, () => ({ id: `personal-setup-v2:${randomUUID()}`, startedAt: new Date().toISOString() }));
    storage.current = bound;
    controller.current = flow;
    const unsubscribe = flow.subscribe(setState);
    void flow.load();
    return () => { unsubscribe(); flow.dispose(); controller.current = null; storage.current = null; };
  }, []);
  return <Context.Provider value={{ ...state,
    answer: (id, option) => controller.current?.answer(id, option) ?? Promise.resolve(false),
    apply: fields => controller.current?.apply(fields) ?? Promise.resolve(false),
    ensureDraft: () => controller.current?.ensureDraft() ?? Promise.resolve(false),
    retry: () => controller.current?.retry() ?? Promise.resolve(false),
    reload: () => controller.current?.load() ?? Promise.resolve(false),
    move: index => controller.current?.move(index) ?? false,
    saveLocale: async locale => {
      const bound = storage.current;
      if (!bound || languageLock.current) return false;
      languageLock.current = true;
      try { await bound.saveSetupLocale(locale); return storage.current === bound; }
      catch { return false; }
      finally { languageLock.current = false; }
    },
  }}>{children}</Context.Provider>;
}

export function useSetup() {
  const value = useContext(Context);
  if (!value) throw new Error('SETUP_PROVIDER_REQUIRED');
  return value;
}
