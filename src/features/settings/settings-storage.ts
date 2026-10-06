import { Platform } from 'react-native';
import { loadSettings as loadLocalSettings, saveSettings as saveLocalSettings } from '@/features/storage/local-database';

export type AppSettings = {
  defaultBreakDurationMinutes: 5 | 10 | 15;
};

const DEFAULT_SETTINGS: AppSettings = { defaultBreakDurationMinutes: 5 };
export async function loadSettings(): Promise<AppSettings> {
  if (Platform.OS === 'web') return DEFAULT_SETTINGS;
  return loadLocalSettings();
}

export async function saveSettings(settings: AppSettings) {
  if (Platform.OS === 'web') return;
  await saveLocalSettings(settings);
}
