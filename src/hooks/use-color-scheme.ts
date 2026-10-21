import { useColorScheme as useSystemColorScheme } from 'react-native';
import { usePresentation } from '@/features/settings/presentation-context';

export function useColorScheme() {
  const system = useSystemColorScheme();
  const settings = usePresentation();
  const appearance = settings?.preferences.appearance ?? 'system';
  return appearance === 'system' ? system : appearance;
}
