import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { useEffect, useRef } from 'react';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { loadActiveSession } from '@/features/focus/session-storage';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const recoveryChecked = useRef(false);

  useEffect(() => {
    if (recoveryChecked.current) return;
    recoveryChecked.current = true;
    loadActiveSession().then((session) => {
      if (!session) return;
      router.replace({ pathname: '/focus/session', params: { durationMinutes: String(session.plannedDurationSeconds / 60), taskName: session.taskName ?? '' } });
    });
  }, [router]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ThemeProvider>
  );
}
