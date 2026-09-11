import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

export type AppSettings = {
  defaultBreakDurationMinutes: 5 | 10 | 15;
};

const DEFAULT_SETTINGS: AppSettings = { defaultBreakDurationMinutes: 5 };
const SETTINGS_FILE = 'deep-focus-settings.json';

function settingsPath() {
  return FileSystem.documentDirectory ? `${FileSystem.documentDirectory}${SETTINGS_FILE}` : null;
}

export async function loadSettings(): Promise<AppSettings> {
  if (Platform.OS === 'web') return DEFAULT_SETTINGS;
  const path = settingsPath();
  if (!path) return DEFAULT_SETTINGS;
  try {
    const info = await FileSystem.getInfoAsync(path);
    if (!info.exists) return DEFAULT_SETTINGS;
    const value: unknown = JSON.parse(await FileSystem.readAsStringAsync(path));
    return isSettings(value) ? value : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings) {
  if (Platform.OS === 'web') return;
  const path = settingsPath();
  if (!path) return;
  try {
    await FileSystem.writeAsStringAsync(path, JSON.stringify(settings));
  } catch {
    // A settings failure must not block the focus experience.
  }
}

function isSettings(value: unknown): value is AppSettings {
  if (!value || typeof value !== 'object') return false;
  const settings = value as Partial<AppSettings>;
  return settings.defaultBreakDurationMinutes === 5
    || settings.defaultBreakDurationMinutes === 10
    || settings.defaultBreakDurationMinutes === 15;
}
