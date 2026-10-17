import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { useAuth } from '@/features/auth/auth-context';
import { loadSettings } from '@/features/settings/settings-storage';
import { useAppLocale } from '@/features/localization/app-locale-context';
import { loadOnboardingState, saveOnboardingState, type OnboardingState, type OnboardingStep } from './onboarding-storage';

type OnboardingContextValue = {
  state: OnboardingState | null;
  loading: boolean;
  error: boolean;
  retry: () => void;
  beginAssessment: () => Promise<void>;
  setStep: (step: OnboardingStep) => Promise<void>;
  complete: () => Promise<void>;
  skip: () => Promise<void>;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: PropsWithChildren) {
  const { snapshot } = useAuth();
  const { setLocale } = useAppLocale();
  const [state, setState] = useState<OnboardingState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    let active = true;
    if (snapshot.status !== 'signed_in' || !snapshot.userId) {
      void loadSettings().then((settings) => { if (active) setLocale(settings.uiLocale); }).catch(() => undefined);
      return () => { active = false; };
    }
    void (async () => {
      await Promise.resolve();
      if (!active) return;
      setLoading(true);
      try {
        const [onboarding, settings] = await Promise.all([loadOnboardingState(), loadSettings()]);
        if (!active) return;
        setState(onboarding);
        setError(false);
        setLocale(settings.uiLocale);
      } catch {
        if (active) { setState(null); setError(true); }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [retryToken, setLocale, snapshot.status, snapshot.userId]);

  const update = useCallback(async (next: OnboardingState) => {
    await saveOnboardingState(next);
    setState(next);
  }, []);
  const beginAssessment = useCallback(() => update({ status: 'in_progress', step: 'assessment', version: 1 }), [update]);
  const setStep = useCallback((step: OnboardingStep) => update({ status: 'in_progress', step, version: 1 }), [update]);
  const complete = useCallback(() => update({ status: 'completed', step: 'intro', version: 1 }), [update]);
  const skip = useCallback(() => update({ status: 'skipped', step: 'intro', version: 1 }), [update]);
  const value = useMemo(() => ({ state, loading, error, retry: () => setRetryToken((value) => value + 1), beginAssessment, setStep, complete, skip }), [beginAssessment, complete, error, loading, setStep, skip, state]);
  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding(): OnboardingContextValue {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error('useOnboarding must be used within OnboardingProvider');
  return context;
}
