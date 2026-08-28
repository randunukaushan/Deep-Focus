import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Keep the first web render consistent with static server output,
 * then use the device color scheme after hydration.
 */
export function useColorScheme() {
  const hasHydrated = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  const colorScheme = useRNColorScheme();

  return hasHydrated ? colorScheme : 'light';
}