import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';

import { loadSettings } from '@/features/settings/settings-storage';
import type { AppLocale } from '@/features/settings/settings-storage';
import { getAppLocaleCopy, type AppLocaleCopy } from './app-locale';

type AppLocaleContextValue = {
  locale: AppLocale;
  copy: AppLocaleCopy;
  setLocale: (locale: AppLocale) => void;
};

const AppLocaleContext = createContext<AppLocaleContextValue | null>(null);

export function AppLocaleProvider({ children }: React.PropsWithChildren) {
  const [locale, setLocale] = useState<AppLocale>('en');

  useEffect(() => {
    if (Platform.OS === 'web') return;
    let mounted = true;
    void loadSettings().then((settings) => {
      if (mounted) setLocale(settings.uiLocale);
    }).catch(() => {
      // The settings route reports read failures. Keep the existing English UI
      // fallback here so the navigation shell never blocks on preferences.
    });
    return () => { mounted = false; };
  }, []);

  const value = useMemo(() => ({ locale, copy: getAppLocaleCopy(locale), setLocale }), [locale]);
  return <AppLocaleContext.Provider value={value}>{children}</AppLocaleContext.Provider>;
}

export function useAppLocale(): AppLocaleContextValue {
  const value = useContext(AppLocaleContext);
  if (!value) throw new Error('useAppLocale must be used within AppLocaleProvider');
  return value;
}
