import { Platform } from 'react-native';
import { loadSettings as loadLocalSettings, saveSettings as saveLocalSettings } from '@/features/storage/local-database';

export type AppSettings = {
  defaultFocusDurationMinutes: 25 | 45 | 60;
  defaultBreakDurationMinutes: 5 | 10 | 15;
  uiLocale: AppLocale;
};

export type AppLocale = 'en' | 'si' | 'ta';

export async function loadSettings(): Promise<AppSettings> {
  if (Platform.OS === 'web') throw new Error('SETTINGS_STORAGE_UNAVAILABLE: local SQLite settings are not available on web');
  return loadLocalSettings();
}

export async function saveSettings(settings: AppSettings) {
  if (Platform.OS === 'web') throw new Error('SETTINGS_STORAGE_UNAVAILABLE: local SQLite settings are not available on web');
  await saveLocalSettings(settings);
}
